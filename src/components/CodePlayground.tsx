import Editor from '@monaco-editor/react';
import { useState, useCallback, useRef } from 'react';
import { runCode, isPyodideReady } from '../engine/pyodideRunner';
import { useProgress } from '../store/progress';
import {
  Play,
  RotateCcw,
  Loader2,
  Terminal,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface Props {
  initialCode: string;
  storageKey?: string;
  testCode?: string;
  readOnly?: boolean;
  onSuccess?: () => void;
  onCodeChange?: (code: string) => void;
  height?: string;
}

export function CodePlayground({
  initialCode,
  storageKey,
  testCode,
  readOnly = false,
  onSuccess,
  onCodeChange,
  height = '100%',
}: Props) {
  const { getCodeEdit, setCodeEdit, clearCodeEdit } = useProgress();
  const savedCode = storageKey ? getCodeEdit(storageKey) : undefined;

  const [output, setOutput] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'running' | 'success' | 'error'>('idle');
  const [loadingMsg, setLoadingMsg] = useState('');
  const editorRef = useRef<{ getValue: () => string; setValue: (v: string) => void } | null>(null);

  const handleEditorMount = useCallback((editor: { getValue: () => string; setValue: (v: string) => void }) => {
    editorRef.current = editor;
  }, []);

  const handleCodeChange = useCallback(
    (value: string | undefined) => {
      const v = value ?? '';
      if (storageKey) setCodeEdit(storageKey, v);
      onCodeChange?.(v);
    },
    [storageKey, setCodeEdit, onCodeChange],
  );

  const handleRun = useCallback(async () => {
    if (status === 'loading' || status === 'running') return;

    const code = editorRef.current?.getValue() ?? '';

    setStatus(isPyodideReady() ? 'running' : 'loading');
    setOutput('');
    setLoadingMsg('');

    const fullCode = testCode ? `${code}\n\n# --- Tests ---\n${testCode}` : code;

    const result = await runCode(fullCode, (msg) => setLoadingMsg(msg));

    if (result.error) {
      setStatus('error');
      setOutput(
        (result.output ? result.output + '\n' : '') +
          '--- Error ---\n' +
          result.error,
      );
    } else {
      setStatus('success');
      setOutput(result.output || '(no output)');
      if (result.success && testCode) {
        onSuccess?.();
      }
    }
  }, [testCode, status, onSuccess]);

  const handleReset = useCallback(() => {
    editorRef.current?.setValue(initialCode);
    if (storageKey) clearCodeEdit(storageKey);
    setOutput('');
    setStatus('idle');
  }, [initialCode, storageKey, clearCodeEdit]);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-white/[0.06] bg-[#0a0e1a]">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-white/[0.06] bg-surface/60 px-3 py-1.5">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-rose-500/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
          <span className="ml-2 text-[11px] text-slate-600 font-mono">kernel.py</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleReset}
            className="btn-ghost !py-1 !px-2 !text-[11px]"
            title="Reset code"
          >
            <RotateCcw size={12} />
            Reset
          </button>
          <button
            onClick={handleRun}
            disabled={status === 'loading' || status === 'running'}
            className="inline-flex items-center gap-1.5 rounded-md bg-accent-cyan/10 px-3 py-1
                       text-[11px] font-medium text-accent-cyan transition-all
                       hover:bg-accent-cyan/20 disabled:opacity-50"
          >
            {status === 'loading' || status === 'running' ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Play size={12} />
            )}
            {status === 'loading'
              ? loadingMsg || 'Loading...'
              : status === 'running'
                ? 'Running...'
                : 'Run'}
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-0">
        <Editor
          height={height === '100%' ? '100%' : height}
          language="python"
          theme="vs-dark"
          defaultValue={savedCode ?? initialCode}
          onChange={handleCodeChange}
          onMount={handleEditorMount}
          options={{
            readOnly,
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily: '"JetBrains Mono", "Fira Code", monospace',
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            padding: { top: 12, bottom: 12 },
            renderLineHighlight: 'gutter',
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            overviewRulerBorder: false,
            scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
            wordWrap: 'on',
            tabSize: 4,
            automaticLayout: true,
          }}
        />
      </div>

      {/* Output panel */}
      <div className="border-t border-white/[0.06]">
        <div className="flex items-center gap-2 border-b border-white/[0.04] bg-surface/40 px-3 py-1">
          <Terminal size={11} className="text-slate-600" />
          <span className="text-[10px] font-medium uppercase tracking-wider text-slate-600">
            Output
          </span>
          {status === 'success' && (
            <CheckCircle2 size={12} className="ml-auto text-emerald-400" />
          )}
          {status === 'error' && (
            <XCircle size={12} className="ml-auto text-rose-400" />
          )}
        </div>
        <pre
          className={`max-h-48 min-h-[80px] overflow-auto p-3 font-mono text-xs leading-relaxed ${
            status === 'error' ? 'text-rose-300' : 'text-slate-400'
          }`}
        >
          {status === 'idle' && (
            <span className="text-slate-600">
              Click "Run" or press Ctrl+Enter to execute...
            </span>
          )}
          {(status === 'loading' || status === 'running') && (
            <span className="text-accent-cyan">
              {loadingMsg || 'Executing...'}
            </span>
          )}
          {(status === 'success' || status === 'error') && output}
        </pre>
      </div>
    </div>
  );
}
