import Editor, { type Monaco } from '@monaco-editor/react';
import { useState, useCallback, useRef } from 'react';
import { runCode, isPyodideReady } from '../engine/pyodideRunner';
import { useProgress } from '../store/progress';

interface Props {
  initialCode: string;
  storageKey?: string;
  testCode?: string;
  readOnly?: boolean;
  onSuccess?: () => void;
  onCodeChange?: (code: string) => void;
  height?: string;
}

type Editor = { getValue: () => string; setValue: (v: string) => void };

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
  const editorRef = useRef<Editor | null>(null);

  const handleEditorMount = useCallback((editor: Editor, monaco: Monaco) => {
    monaco.editor.defineTheme('kernel-academy', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: 'a89a7f', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'c44569' },
        { token: 'string', foreground: '8fa173' },
        { token: 'number', foreground: 'c9a961' },
        { token: 'type', foreground: 'b87333' },
        { token: 'function', foreground: 'd4c5a9' },
        { token: 'variable', foreground: 'f4e8d7' },
        { token: 'delimiter', foreground: 'a89a7f' },
      ],
      colors: {
        'editor.background': '#1a0308',
        'editor.foreground': '#f4e8d7',
        'editor.lineHighlightBackground': '#280611',
        'editor.lineHighlightBorder': '#280611',
        'editorLineNumber.foreground': '#a8703c',
        'editorLineNumber.activeForeground': '#c9a961',
        'editorCursor.foreground': '#c44569',
        'editor.selectionBackground': '#5c1026',
        'editor.inactiveSelectionBackground': '#3d0b1c',
        'editorBracketMatch.background': '#3d0b1c',
        'editorBracketMatch.border': '#c9a961',
        'editorIndentGuide.background': '#3d0b1c',
        'editorIndentGuide.activeBackground': '#5c1026',
        'editorGutter.background': '#1a0308',
        'scrollbarSlider.background': '#5c102680',
        'scrollbarSlider.hoverBackground': '#9f2e4ab0',
        'scrollbarSlider.activeBackground': '#c44569',
      },
    });
    monaco.editor.setTheme('kernel-academy');
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
    <div className="flex h-full flex-col overflow-hidden border border-wine-glow/50 bg-wine-deep">
      {/* Laboratory chrome */}
      <div className="flex items-center justify-between border-b border-wine-glow/40 bg-wine/70 px-4 py-2.5">
        <div className="flex items-baseline gap-3">
          <span className="font-ital text-[13px] italic text-copper">§</span>
          <span className="font-sans text-[10.5px] uppercase tracking-widest-caps text-parchment-mute">
            kernel.py
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleReset}
            className="font-sans text-[10.5px] uppercase tracking-caps text-parchment-mute
                       transition-colors hover:text-parchment-dim"
          >
            Reset
          </button>
          <button
            onClick={handleRun}
            disabled={status === 'loading' || status === 'running'}
            className="border border-gold/50 bg-wine-soft/70 px-4 py-1 font-sans text-[10.5px]
                       font-medium uppercase tracking-caps text-gold transition-all
                       hover:border-gold hover:bg-wine-glow/80 hover:text-parchment
                       disabled:opacity-40"
          >
            {status === 'loading'
              ? (loadingMsg || 'Loading').slice(0, 18)
              : status === 'running'
                ? 'Running…'
                : 'Execute ▸'}
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-0">
        <Editor
          height={height === '100%' ? '100%' : height}
          language="python"
          theme="kernel-academy"
          defaultValue={savedCode ?? initialCode}
          onChange={handleCodeChange}
          onMount={handleEditorMount}
          options={{
            readOnly,
            minimap: { enabled: false },
            fontSize: 13.5,
            fontFamily: '"IBM Plex Mono", "JetBrains Mono", monospace',
            fontLigatures: true,
            lineNumbers: 'on',
            lineNumbersMinChars: 3,
            scrollBeyondLastLine: false,
            padding: { top: 16, bottom: 16 },
            renderLineHighlight: 'none',
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            overviewRulerBorder: false,
            scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
            wordWrap: 'on',
            tabSize: 4,
            automaticLayout: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            smoothScrolling: true,
            guides: { indentation: false },
          }}
        />
      </div>

      {/* Output: lab notebook annotation */}
      <div className="border-t border-wine-glow/40 bg-wine/60">
        <div className="flex items-baseline justify-between border-b border-wine-glow/30 px-4 py-1.5">
          <span className="font-sans text-[10.5px] uppercase tracking-widest-caps text-parchment-mute">
            Observation
          </span>
          {status === 'success' && (
            <span className="diff-pill text-sage">✓ Executed</span>
          )}
          {status === 'error' && (
            <span className="diff-pill text-rust">✕ Error</span>
          )}
        </div>
        <pre
          className={`max-h-52 min-h-[92px] overflow-auto px-4 py-3 font-mono text-[12px] leading-relaxed ${
            status === 'error' ? 'text-rust' : 'text-parchment/85'
          }`}
        >
          {status === 'idle' && (
            <span className="italic text-parchment-mute">
              Press <span className="text-gold">Execute</span> to run this kernel.
            </span>
          )}
          {(status === 'loading' || status === 'running') && (
            <span className="italic text-copper">
              {loadingMsg || 'Executing…'}
            </span>
          )}
          {(status === 'success' || status === 'error') && output}
        </pre>
      </div>
    </div>
  );
}
