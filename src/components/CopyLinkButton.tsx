import { useState } from 'react';
import { Check, Link as LinkIcon } from 'lucide-react';

export function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard not available (e.g. insecure context) — silent fail.
    }
  };

  return (
    <button
      onClick={handleCopy}
      title="Copy link to this page"
      className={`flex shrink-0 items-center gap-1.5 font-sans text-[10.5px] uppercase tracking-caps transition-colors ${
        copied ? 'text-sage' : 'text-parchment-mute hover:text-parchment'
      }`}
    >
      {copied ? <Check size={11} /> : <LinkIcon size={11} />}
      <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy link'}</span>
    </button>
  );
}
