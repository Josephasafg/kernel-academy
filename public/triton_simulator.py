"""
Triton Simulator for browser-based execution via Pyodide.

Provides a mock implementation of triton and triton.language (tl) that
executes kernels using NumPy. This allows writing real Triton-style code
that runs without a GPU.

Limitations vs real Triton:
- Sequential execution (no actual parallelism)
- No actual GPU memory (uses NumPy arrays)
- No autotuning / compilation
- Simplified pointer model
"""

import numpy as np
import sys
from typing import Any, Callable, Optional, Tuple, Union
from functools import wraps


# ---------------------------------------------------------------------------
# Pointer simulation
# ---------------------------------------------------------------------------

class Pointer:
    """Simulates a GPU memory pointer backed by a NumPy array."""

    def __init__(self, data: np.ndarray, offset: int = 0):
        self.data = data.ravel() if data.ndim > 1 else data
        self._flat = self.data  # always 1-D view
        self.offset = offset
        self.dtype = data.dtype
        self.shape = data.shape

    def __add__(self, other):
        if isinstance(other, (int, float, np.integer, np.floating)):
            return Pointer(self.data, self.offset + int(other))
        if isinstance(other, np.ndarray):
            return PointerBlock(self._flat, (self.offset + other).astype(np.int64))
        if isinstance(other, Pointer):
            return Pointer(self.data, self.offset + other.offset)
        raise TypeError(f"Cannot add Pointer and {type(other).__name__}")

    def __radd__(self, other):
        return self.__add__(other)

    def __sub__(self, other):
        if isinstance(other, (int, float, np.integer, np.floating)):
            return Pointer(self.data, self.offset - int(other))
        raise TypeError(f"Cannot sub Pointer and {type(other).__name__}")

    def __repr__(self):
        return f"Pointer(shape={self.shape}, dtype={self.dtype}, offset={self.offset})"


class PointerBlock:
    """A block of pointers (base array + array of offsets)."""

    def __init__(self, data: np.ndarray, offsets: np.ndarray):
        self.data = data.ravel() if data.ndim > 1 else data
        self.offsets = offsets.astype(np.int64)

    def __repr__(self):
        return f"PointerBlock(offsets_shape={self.offsets.shape})"


# ---------------------------------------------------------------------------
# Execution context (set by grid runner)
# ---------------------------------------------------------------------------

_context = {
    "pid": [0, 0, 0],
    "num_programs": [1, 1, 1],
}


# ---------------------------------------------------------------------------
# triton.language (tl) simulation
# ---------------------------------------------------------------------------

class _TritonLanguage:
    """Simulates the triton.language namespace."""

    # Data types
    float16 = np.float16
    float32 = np.float32
    float64 = np.float64
    bfloat16 = np.float16  # approximate
    int8 = np.int8
    int16 = np.int16
    int32 = np.int32
    int64 = np.int64
    uint8 = np.uint8
    uint16 = np.uint16
    uint32 = np.uint32
    uint64 = np.uint64
    bool_ = np.bool_

    class constexpr:
        """Compile-time constant marker."""
        def __init__(self, value):
            self.value = value
        def __repr__(self):
            return f"constexpr({self.value})"
        def __eq__(self, other):
            if isinstance(other, _TritonLanguage.constexpr):
                return self.value == other.value
            return self.value == other
        def __hash__(self):
            return hash(self.value)
        def __int__(self):
            return int(self.value)
        def __index__(self):
            return int(self.value)

    @staticmethod
    def program_id(axis: int) -> int:
        return _context["pid"][axis]

    @staticmethod
    def num_programs(axis: int) -> int:
        return _context["num_programs"][axis]

    @staticmethod
    def arange(start: int, end: int) -> np.ndarray:
        return np.arange(start, end, dtype=np.int32)

    @staticmethod
    def zeros(shape, dtype=np.float32) -> np.ndarray:
        if isinstance(shape, (list, tuple)):
            return np.zeros(shape, dtype=dtype)
        return np.zeros((shape,), dtype=dtype)

    @staticmethod
    def full(shape, value, dtype=np.float32) -> np.ndarray:
        if isinstance(shape, (list, tuple)):
            return np.full(shape, value, dtype=dtype)
        return np.full((shape,), value, dtype=dtype)

    @staticmethod
    def load(
        pointer,
        mask=None,
        other=0.0,
        eviction_policy="",
        cache_modifier="",
    ) -> np.ndarray:
        if isinstance(pointer, PointerBlock):
            offsets = pointer.offsets
            data = pointer.data
            safe = (offsets >= 0) & (offsets < len(data))
            if mask is not None:
                safe = safe & mask
            result = np.full(offsets.shape, other, dtype=data.dtype)
            valid_offsets = offsets[safe].astype(np.intp)
            result[safe] = data[valid_offsets]
            return result
        if isinstance(pointer, Pointer):
            idx = pointer.offset
            if 0 <= idx < len(pointer._flat):
                return pointer._flat[idx]
            return type(other)(other) if other is not None else 0.0
        raise TypeError(f"load expects Pointer or PointerBlock, got {type(pointer).__name__}")

    @staticmethod
    def store(pointer, value, mask=None) -> None:
        if isinstance(pointer, PointerBlock):
            offsets = pointer.offsets
            data = pointer.data
            safe = (offsets >= 0) & (offsets < len(data))
            if mask is not None:
                safe = safe & mask
            valid_offsets = offsets[safe].astype(np.intp)
            if isinstance(value, np.ndarray):
                data[valid_offsets] = value[safe]
            else:
                data[valid_offsets] = value
            return
        if isinstance(pointer, Pointer):
            idx = pointer.offset
            if mask is None or mask:
                if 0 <= idx < len(pointer._flat):
                    pointer._flat[idx] = value
            return
        raise TypeError(f"store expects Pointer or PointerBlock, got {type(pointer).__name__}")

    # -- Reductions --
    @staticmethod
    def sum(x: np.ndarray, axis: int = 0) -> np.ndarray:
        return np.sum(x, axis=axis)

    @staticmethod
    def max(x: np.ndarray, axis: int = 0):
        return np.max(x, axis=axis)

    @staticmethod
    def min(x: np.ndarray, axis: int = 0):
        return np.min(x, axis=axis)

    @staticmethod
    def argmax(x: np.ndarray, axis: int = 0):
        return np.argmax(x, axis=axis)

    @staticmethod
    def argmin(x: np.ndarray, axis: int = 0):
        return np.argmin(x, axis=axis)

    @staticmethod
    def cumsum(x: np.ndarray, axis: int = 0):
        return np.cumsum(x, axis=axis)

    # -- Element-wise math --
    @staticmethod
    def exp(x):
        return np.exp(x)

    @staticmethod
    def exp2(x):
        return np.exp2(x)

    @staticmethod
    def log(x):
        return np.log(x)

    @staticmethod
    def log2(x):
        return np.log2(x)

    @staticmethod
    def sqrt(x):
        return np.sqrt(x)

    @staticmethod
    def abs(x):
        return np.abs(x)

    @staticmethod
    def cos(x):
        return np.cos(x)

    @staticmethod
    def sin(x):
        return np.sin(x)

    @staticmethod
    def sigmoid(x):
        return 1.0 / (1.0 + np.exp(-x))

    @staticmethod
    def softmax(x, axis=0):
        e = np.exp(x - np.max(x, axis=axis, keepdims=True))
        return e / np.sum(e, axis=axis, keepdims=True)

    @staticmethod
    def rsqrt(x):
        return 1.0 / np.sqrt(x)

    # -- Comparison / selection --
    @staticmethod
    def where(condition, x, y):
        return np.where(condition, x, y)

    @staticmethod
    def maximum(x, y):
        return np.maximum(x, y)

    @staticmethod
    def minimum(x, y):
        return np.minimum(x, y)

    # -- Matrix operations --
    @staticmethod
    def dot(a: np.ndarray, b: np.ndarray, allow_tf32: bool = True) -> np.ndarray:
        return np.dot(a, b)

    @staticmethod
    def trans(x: np.ndarray) -> np.ndarray:
        return x.T

    # -- Reshaping --
    @staticmethod
    def reshape(x: np.ndarray, shape) -> np.ndarray:
        return x.reshape(shape)

    @staticmethod
    def expand_dims(x: np.ndarray, axis: int) -> np.ndarray:
        return np.expand_dims(x, axis=axis)

    @staticmethod
    def broadcast_to(x: np.ndarray, shape) -> np.ndarray:
        return np.broadcast_to(x, shape)

    # -- Type casting --
    @staticmethod
    def cast(x, dtype):
        if isinstance(x, np.ndarray):
            return x.astype(dtype)
        return dtype(x)

    # -- Atomic operations (simplified) --
    @staticmethod
    def atomic_add(pointer, value, mask=None):
        _TritonLanguage.store(
            pointer,
            _TritonLanguage.load(pointer, mask=mask) + value,
            mask=mask,
        )

    @staticmethod
    def atomic_max(pointer, value, mask=None):
        old = _TritonLanguage.load(pointer, mask=mask)
        _TritonLanguage.store(pointer, np.maximum(old, value), mask=mask)

    # -- Debug --
    @staticmethod
    def device_print(prefix, *args):
        vals = " ".join(str(a) for a in args)
        print(f"[GPU] {prefix}: {vals}")

    @staticmethod
    def static_print(*args):
        print("[static]", *args)


tl = _TritonLanguage()


# ---------------------------------------------------------------------------
# triton.jit decorator
# ---------------------------------------------------------------------------

class JITFunction:
    """Wraps a Triton kernel for simulated grid execution."""

    def __init__(self, fn: Callable):
        self.fn = fn
        self.__name__ = fn.__name__
        self.__doc__ = fn.__doc__

    def __getitem__(self, grid):
        """kernel[grid](...) launch syntax."""
        return _KernelLauncher(self.fn, grid)

    def __call__(self, *args, **kwargs):
        return self.fn(*args, **kwargs)


class _KernelLauncher:
    def __init__(self, fn: Callable, grid):
        self.fn = fn
        self.grid = grid

    def __call__(self, *args, **kwargs):
        # Resolve grid size
        grid = self.grid
        if callable(grid):
            meta = {k: v for k, v in kwargs.items()}
            grid = grid(meta)
        if isinstance(grid, (int, np.integer)):
            grid = (int(grid),)
        if not isinstance(grid, tuple):
            grid = tuple(grid)

        # Pad to 3D
        grid_3d = list(grid) + [1] * (3 - len(grid))

        # Wrap numpy arrays as Pointers
        wrapped_args = []
        for a in args:
            if isinstance(a, np.ndarray):
                wrapped_args.append(Pointer(a))
            else:
                wrapped_args.append(a)

        # Resolve constexpr kwargs
        resolved_kwargs = {}
        for k, v in kwargs.items():
            if isinstance(v, _TritonLanguage.constexpr):
                resolved_kwargs[k] = v.value
            else:
                resolved_kwargs[k] = v

        # Execute kernel for each program ID
        _context["num_programs"] = grid_3d
        for z in range(grid_3d[2]):
            for y in range(grid_3d[1]):
                for x in range(grid_3d[0]):
                    _context["pid"] = [x, y, z]
                    self.fn(*wrapped_args, **resolved_kwargs)


# ---------------------------------------------------------------------------
# triton module-level utilities
# ---------------------------------------------------------------------------

class _TritonModule:
    """Simulates the top-level triton module."""

    language = tl
    jit = staticmethod(lambda fn=None, **kwargs: JITFunction(fn) if fn else lambda f: JITFunction(f))

    @staticmethod
    def cdiv(a: int, b: int) -> int:
        return (a + b - 1) // b

    @staticmethod
    def next_power_of_2(n: int) -> int:
        n -= 1
        n |= n >> 1
        n |= n >> 2
        n |= n >> 4
        n |= n >> 8
        n |= n >> 16
        return n + 1

    class Config:
        def __init__(self, kwargs=None):
            self.kwargs = kwargs or {}

    @staticmethod
    def autotune(configs, key):
        """Simplified autotune: just uses the first config."""
        def decorator(fn):
            jit_fn = JITFunction(fn)
            class AutotunedLauncher:
                def __getitem__(self, grid):
                    return _AutotunedKernelLauncher(fn, grid, configs)
            return AutotunedLauncher()
        return decorator

    @staticmethod
    def heuristics(values):
        def decorator(fn):
            return JITFunction(fn)
        return decorator


class _AutotunedKernelLauncher:
    def __init__(self, fn, grid, configs):
        self.fn = fn
        self.grid = grid
        self.configs = configs

    def __call__(self, *args, **kwargs):
        # Use first config
        config = self.configs[0] if self.configs else {}
        merged = {**kwargs}
        if hasattr(config, 'kwargs'):
            merged.update(config.kwargs)
        elif isinstance(config, dict):
            merged.update(config)
        launcher = _KernelLauncher(self.fn, self.grid)
        return launcher(*args, **merged)


triton = _TritonModule()

# Make importable
sys.modules['triton'] = triton
sys.modules['triton.language'] = tl

print("Triton simulator loaded (NumPy backend)")
