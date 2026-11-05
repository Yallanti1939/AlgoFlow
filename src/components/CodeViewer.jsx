import { useMemo, useState } from "react";

const keywordPattern = /(\b(const|let|var|function|return|if|else|for|while|new|class|switch|case|break|continue|true|false|null|undefined|try|catch|throw|import|from|export|default|Array|Map|Set)\b)|("[^"]*"|'[^']*'|`[^`]*`)|\b(\d+)\b/g;

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function highlightCode(code) {
  const escaped = escapeHtml(code);
  return escaped.replace(keywordPattern, (match, keyword, literal, number) => {
    if (keyword) {
      return `<span class="code-keyword">${keyword}</span>`;
    }
    if (literal) {
      return `<span class="code-string">${literal}</span>`;
    }
    if (number) {
      return `<span class="code-number">${number}</span>`;
    }
    return match;
  });
}

function CodeViewer({ title, summary, code, explanation }) {
  const [copied, setCopied] = useState(false);

  const highlightedCode = useMemo(() => highlightCode(code ?? ""), [code]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code ?? "");
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="viewer-panel">
      <div className="viewer-header">
        <div>
          <p className="eyebrow">CODE VIEWER</p>
          <h3>{title}</h3>
          {summary && <p className="viewer-summary">{summary}</p>}
        </div>
        <button className="secondary-btn" onClick={handleCopy}>
          {copied ? "Copied" : "Copy code"}
        </button>
      </div>

      <pre className="code-block" dangerouslySetInnerHTML={{ __html: highlightedCode }} />

      {explanation && <p className="viewer-explanation">{explanation}</p>}
    </div>
  );
}

export default CodeViewer;
