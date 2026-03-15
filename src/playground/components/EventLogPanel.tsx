import type { EventItem } from "../types";

interface EventLogPanelProps {
  events: EventItem[];
  onClear: () => void;
  emptyMessage?: string;
}

export function EventLogPanel({
  events,
  onClear,
  emptyMessage = "No events yet. Interact with the map.",
}: EventLogPanelProps) {
  return (
    <section className="eventsPanel">
      <div className="eventsHeader">
        <h2>Event Log</h2>
        <button type="button" onClick={onClear}>
          Clear
        </button>
      </div>

      {events.length === 0 ? (
        <p className="empty">{emptyMessage}</p>
      ) : (
        <ul>
          {events.map((eventItem) => (
            <li key={eventItem.id} className={`event ${eventItem.type}`}>
              {eventItem.text}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
