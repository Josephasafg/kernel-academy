let pyodide: PyodideInterface | null = null;
let loadPromise: Promise<PyodideInterface> | null = null;
let simulatorLoaded = false;

export type RunResult = {
  output: string;
  error: string | null;
  success: boolean;
};

export async function initPyodide(
  onProgress?: (msg: string) => void,
): Promise<PyodideInterface> {
  if (pyodide) return pyodide;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    onProgress?.('Loading Python runtime...');
    const py = await loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/',
    });

    onProgress?.('Installing NumPy...');
    await py.loadPackage('numpy');

    onProgress?.('Loading Triton simulator...');
    const simulatorCode = await fetch(`${import.meta.env.BASE_URL}triton_simulator.py`).then((r) =>
      r.text(),
    );
    await py.runPythonAsync(simulatorCode);
    simulatorLoaded = true;

    onProgress?.('Ready!');
    pyodide = py;
    return py;
  })();

  return loadPromise;
}

export async function runCode(
  code: string,
  onProgress?: (msg: string) => void,
): Promise<RunResult> {
  const py = await initPyodide(onProgress);

  py.runPython(`
import sys
from io import StringIO
__tt_stdout = StringIO()
__tt_stderr = StringIO()
sys.stdout = __tt_stdout
sys.stderr = __tt_stderr
`);

  try {
    await py.runPythonAsync(code);
    const output = String(py.runPython('__tt_stdout.getvalue()'));
    const stderr = String(py.runPython('__tt_stderr.getvalue()'));

    py.runPython(
      'sys.stdout = sys.__stdout__; sys.stderr = sys.__stderr__',
    );

    if (stderr && stderr.trim()) {
      return { output: output + '\n' + stderr, error: null, success: true };
    }
    return { output, error: null, success: true };
  } catch (e: unknown) {
    py.runPython(
      'sys.stdout = sys.__stdout__; sys.stderr = sys.__stderr__',
    );
    const partialOutput = String(py.runPython('__tt_stdout.getvalue()'));
    const errMsg = e instanceof Error ? e.message : String(e);
    return {
      output: partialOutput,
      error: errMsg,
      success: false,
    };
  }
}

export function isPyodideReady(): boolean {
  return pyodide !== null && simulatorLoaded;
}
