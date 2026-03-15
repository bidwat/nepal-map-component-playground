interface MetaPanelProps {
  hoverLabel: string;
  hoverId: string;
  lastClicked: string;
  selectedCount: number;
  lastSelectionPayload: string;
}

export function MetaPanel({
  hoverLabel,
  hoverId,
  lastClicked,
  selectedCount,
  lastSelectionPayload,
}: MetaPanelProps) {
  const metaRows = [
    `Hover label: ${hoverLabel}`,
    `Hover id: ${hoverId}`,
    `Last click id: ${lastClicked}`,
    `Selected count: ${selectedCount}`,
    `Last selection payload: ${lastSelectionPayload}`,
    "Load status: Ready (internal Nepal dataset)",
  ];

  return (
    <section className="meta">
      {metaRows.map((row) => (
        <span key={row}>{row}</span>
      ))}
    </section>
  );
}
