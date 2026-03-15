interface GeneratedCodePanelProps {
  generatedCode: string;
  feedback: string;
  onCopy: () => void;
  onDownload: () => void;
}

export function GeneratedCodePanel({
  generatedCode,
  feedback,
  onCopy,
  onDownload,
}: GeneratedCodePanelProps) {
  return (
    <section className="codePanel">
      <div className="codeHeader">
        <h2>Generated Component Code</h2>
        <div className="codeActions">
          <button type="button" onClick={onCopy}>
            Copy code
          </button>
          <button type="button" onClick={onDownload}>
            Download .tsx
          </button>
        </div>
      </div>
      {feedback ? <p className="codeFeedback">{feedback}</p> : null}
      <pre>
        <code>{generatedCode}</code>
      </pre>
    </section>
  );
}
