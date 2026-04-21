# Kernel Academy

Interactive web app for learning GPU kernel programming with [OpenAI Triton](https://github.com/triton-lang/triton). Write real Triton code, solve puzzles, and run everything in your browser — no GPU required.

## How It Works

A **NumPy-based Triton simulator** runs inside the browser via [Pyodide](https://pyodide.org/) (Python in WebAssembly). You write code with the real Triton API (`@triton.jit`, `tl.load`, `tl.store`, etc.) and it executes client-side with NumPy. Same syntax, same patterns — skills transfer directly to real GPU development.

## Curriculum

6 progressive modules, each with lessons, hands-on puzzles, and quizzes:

| # | Module | Level | Topics |
|---|--------|-------|--------|
| 1 | Hello, Triton | Beginner | Grids, programs, blocks, vector addition |
| 2 | Memory & Pointers | Beginner | Pointer arithmetic, strided access, masks |
| 3 | Element-wise Ops | Intermediate | Activation functions, kernel fusion |
| 4 | Reductions | Intermediate | Sum/max/min, numerically stable softmax |
| 5 | Matrix Multiplication | Advanced | 2D indexing, tiled matmul |
| 6 | Advanced Kernels | Advanced | LayerNorm, attention scores, autotuning |

## Features

- **In-browser code execution** — Pyodide + NumPy, no backend needed
- **Monaco code editor** — syntax highlighting, same engine as VS Code
- **Puzzles** — starter code, progressive hints, auto-verified tests, solution reveal
- **Quizzes** — multiple choice with explanations for every answer
- **Progress tracking** — persisted to localStorage

## Getting Started

```bash
git clone https://github.com/Josephasafg/kernel-academy.git
cd kernel-academy
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Tech Stack

React 18, TypeScript, Vite, Tailwind CSS, Monaco Editor, Pyodide, Zustand, React Router

## Simulator vs Real Triton

The simulator covers the full Triton API surface (`tl.load/store`, `tl.sum/max/min`, `tl.dot`, `@triton.autotune`, pointer arithmetic, masks, etc.) but runs sequentially on CPU. No warp-level ops, no real autotuning benchmarks. Code transfers to real GPUs with minimal changes (swap NumPy arrays for PyTorch tensors).

## Inspiration

- [Triton-Puzzles](https://github.com/gpu-mode/Triton-Puzzles) by GPU MODE
- [Triton Official Tutorials](https://github.com/triton-lang/triton)
- [GPU MODE Lectures](https://github.com/gpu-mode/lectures)

## License

MIT
