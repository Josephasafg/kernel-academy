/// <reference types="vite/client" />

interface Window {
  loadPyodide: (config: { indexURL: string }) => Promise<PyodideInterface>;
}

interface PyodideInterface {
  runPython: (code: string) => unknown;
  runPythonAsync: (code: string) => Promise<unknown>;
  loadPackage: (pkg: string | string[]) => Promise<void>;
  globals: Map<string, unknown>;
}

declare function loadPyodide(config: {
  indexURL: string;
}): Promise<PyodideInterface>;
