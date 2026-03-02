import { useEffect, useRef, useState } from "react";

import {
  NepalMap,
  type NepalMapTheme,
  type RegionFeature,
  type SelectionMode,
  type ViewLevel,
} from "nepal-map-component";

import "./App.css";

interface EventItem {
  id: number;
  type: "hover" | "click" | "selection";
  text: string;
}

function parseSelectedIds(value: string): string[] {
  return value
    .split(/[\n,]/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

function nowLabel(): string {
  return new Date().toLocaleTimeString();
}

function App() {
  const [topoUrl, setTopoUrl] = useState("/nepal-map.topojson");
  const [topoData, setTopoData] = useState<Record<string, unknown> | null>(
    null,
  );
  const [topoError, setTopoError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const [initialLevel, setInitialLevel] = useState<
    "country" | "province" | "district"
  >("province");
  const [selectionMode, setSelectionMode] =
    useState<SelectionMode>("drill-down");

  const [fitParent, setFitParent] = useState(true);
  const [mapWidth, setMapWidth] = useState(1000);
  const [mapHeight, setMapHeight] = useState(650);
  const [parentWidth, setParentWidth] = useState(1000);
  const [parentHeight, setParentHeight] = useState(650);

  const [ariaLabel, setAriaLabel] = useState("Nepal administrative map");

  const [theme, setTheme] = useState<NepalMapTheme>({
    primary: "#dde3ef",
    disabled: "#bfc6d3",
    hover: "#9fc0ff",
    selected: "#4d80ff",
    background: "#f7f8fb",
    stroke: "#42526b",
    strokeWidth: 0.55,
  });

  const [controlledSelectedIds, setControlledSelectedIds] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedIdsInput, setSelectedIdsInput] = useState("");

  const [enableHoverEvent, setEnableHoverEvent] = useState(true);
  const [enableClickEvent, setEnableClickEvent] = useState(true);
  const [enableSelectionEvent, setEnableSelectionEvent] = useState(true);

  const [hoverLabel, setHoverLabel] = useState<string>("-");
  const [hoverId, setHoverId] = useState<string>("-");
  const [lastClicked, setLastClicked] = useState<string>("-");
  const [lastSelectionPayload, setLastSelectionPayload] = useState<string>("-");
  const [events, setEvents] = useState<EventItem[]>([]);

  const eventCounterRef = useRef(0);
  const lastHoverLoggedIdRef = useRef<string>("");

  function pushEvent(type: EventItem["type"], text: string) {
    eventCounterRef.current += 1;
    const entry: EventItem = {
      id: eventCounterRef.current,
      type,
      text: `${nowLabel()} — ${text}`,
    };

    setEvents((previous) => [entry, ...previous].slice(0, 120));
  }

  async function loadTopo(url: string) {
    setIsLoading(true);
    setTopoError("");

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load TopoJSON (${response.status})`);
      }

      const data = (await response.json()) as Record<string, unknown>;
      setTopoData(data);
    } catch (error) {
      setTopoData(null);
      setTopoError(
        error instanceof Error ? error.message : "Unable to load TopoJSON",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadTopo(topoUrl).catch((error) => {
      console.error(error);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateTheme<K extends keyof NepalMapTheme>(
    key: K,
    value: NepalMapTheme[K],
  ) {
    setTheme((previous) => ({ ...previous, [key]: value }));
  }

  function applySelectedIdsInput(value: string) {
    const next = parseSelectedIds(value);
    setSelectedIds(next);
    setSelectedIdsInput(value);
  }

  function handleHover(feature: RegionFeature | null) {
    const label = feature?.properties.__label ?? "-";
    const id = feature?.properties.__id ?? "-";
    setHoverLabel(label);
    setHoverId(id);

    if (!enableHoverEvent) return;
    if (lastHoverLoggedIdRef.current === id) return;
    lastHoverLoggedIdRef.current = id;
    pushEvent("hover", `onRegionHover: ${label} (${id})`);
  }

  function handleClick(feature: RegionFeature) {
    const id = feature.properties.__id;
    setLastClicked(id);

    if (!enableClickEvent) return;
    pushEvent("click", `onRegionClick: ${feature.properties.__label} (${id})`);
  }

  function handleSelectionChange(nextIds: string[]) {
    setSelectedIds(nextIds);
    setSelectedIdsInput(nextIds.join(", "));
    setLastSelectionPayload(JSON.stringify(nextIds));

    if (!enableSelectionEvent) return;
    pushEvent("selection", `onSelectionChange: [${nextIds.join(", ")}]`);
  }

  const mapStyle = fitParent
    ? ({ width: parentWidth, height: parentHeight } as const)
    : ({ width: mapWidth, height: mapHeight } as const);

  return (
    <main className="page">
      <header className="header">
        <h1>Nepal Map Playground</h1>
      </header>

      <section className="layout">
        <aside className="panel">
          <h2>Props Controls</h2>

          <div className="fieldRow">
            <label htmlFor="topoUrl">topoData URL</label>
            <div className="inline">
              <input
                id="topoUrl"
                value={topoUrl}
                onChange={(event) => setTopoUrl(event.target.value)}
              />
              <button
                type="button"
                onClick={() => {
                  loadTopo(topoUrl).catch((error) => console.error(error));
                }}
              >
                Reload
              </button>
            </div>
          </div>

          <div className="fieldRow">
            <label htmlFor="initialLevel">initialLevel</label>
            <select
              id="initialLevel"
              value={initialLevel}
              onChange={(event) =>
                setInitialLevel(
                  event.target.value as ViewLevel as
                    | "country"
                    | "province"
                    | "district",
                )
              }
            >
              <option value="country">country</option>
              <option value="province">province</option>
              <option value="district">district</option>
            </select>
          </div>

          <div className="fieldRow">
            <label htmlFor="selectionMode">selectionMode</label>
            <select
              id="selectionMode"
              value={selectionMode}
              onChange={(event) =>
                setSelectionMode(event.target.value as SelectionMode)
              }
            >
              <option value="drill-down">drill-down</option>
              <option value="select">select</option>
            </select>
          </div>

          <div className="fieldRow">
            <label htmlFor="ariaLabel">ariaLabel</label>
            <input
              id="ariaLabel"
              value={ariaLabel}
              onChange={(event) => setAriaLabel(event.target.value)}
            />
          </div>

          <div className="fieldRow checkboxRow">
            <label htmlFor="fitParent">fitParent</label>
            <input
              id="fitParent"
              type="checkbox"
              checked={fitParent}
              onChange={(event) => setFitParent(event.target.checked)}
            />
          </div>

          {fitParent ? (
            <>
              <div className="fieldRow">
                <label htmlFor="parentWidth">Parent width</label>
                <input
                  id="parentWidth"
                  type="number"
                  min={240}
                  value={parentWidth}
                  onChange={(event) =>
                    setParentWidth(Number(event.target.value) || 240)
                  }
                />
              </div>
              <div className="fieldRow">
                <label htmlFor="parentHeight">Parent height</label>
                <input
                  id="parentHeight"
                  type="number"
                  min={240}
                  value={parentHeight}
                  onChange={(event) =>
                    setParentHeight(Number(event.target.value) || 240)
                  }
                />
              </div>
            </>
          ) : (
            <>
              <div className="fieldRow">
                <label htmlFor="mapWidth">width</label>
                <input
                  id="mapWidth"
                  type="number"
                  min={240}
                  value={mapWidth}
                  onChange={(event) =>
                    setMapWidth(Number(event.target.value) || 240)
                  }
                />
              </div>
              <div className="fieldRow">
                <label htmlFor="mapHeight">height</label>
                <input
                  id="mapHeight"
                  type="number"
                  min={240}
                  value={mapHeight}
                  onChange={(event) =>
                    setMapHeight(Number(event.target.value) || 240)
                  }
                />
              </div>
            </>
          )}

          <h3>Theme</h3>
          <div className="fieldGrid">
            {(
              [
                ["primary", theme.primary],
                ["disabled", theme.disabled],
                ["hover", theme.hover],
                ["selected", theme.selected],
                ["background", theme.background],
                ["stroke", theme.stroke],
              ] as const
            ).map(([key, value]) => (
              <div className="fieldRow" key={key}>
                <label htmlFor={key}>{key}</label>
                <input
                  id={key}
                  type="color"
                  value={value}
                  onChange={(event) => updateTheme(key, event.target.value)}
                />
              </div>
            ))}
          </div>

          <div className="fieldRow">
            <label htmlFor="strokeWidth">strokeWidth</label>
            <input
              id="strokeWidth"
              type="number"
              min={0.1}
              max={4}
              step={0.05}
              value={theme.strokeWidth}
              onChange={(event) =>
                updateTheme("strokeWidth", Number(event.target.value) || 0.1)
              }
            />
          </div>

          <h3>selectedIds</h3>
          <div className="fieldRow checkboxRow">
            <label htmlFor="controlledSelectedIds">
              Controlled prop enabled
            </label>
            <input
              id="controlledSelectedIds"
              type="checkbox"
              checked={controlledSelectedIds}
              onChange={(event) =>
                setControlledSelectedIds(event.target.checked)
              }
            />
          </div>

          <div className="fieldRow">
            <label htmlFor="selectedIdsInput">
              Comma/newline separated IDs
            </label>
            <textarea
              id="selectedIdsInput"
              rows={3}
              value={selectedIdsInput}
              onChange={(event) => applySelectedIdsInput(event.target.value)}
            />
          </div>

          <h3>Callback toggles</h3>
          <div className="fieldRow checkboxRow">
            <label htmlFor="cbHover">onRegionHover</label>
            <input
              id="cbHover"
              type="checkbox"
              checked={enableHoverEvent}
              onChange={(event) => setEnableHoverEvent(event.target.checked)}
            />
          </div>
          <div className="fieldRow checkboxRow">
            <label htmlFor="cbClick">onRegionClick</label>
            <input
              id="cbClick"
              type="checkbox"
              checked={enableClickEvent}
              onChange={(event) => setEnableClickEvent(event.target.checked)}
            />
          </div>
          <div className="fieldRow checkboxRow">
            <label htmlFor="cbSelection">onSelectionChange</label>
            <input
              id="cbSelection"
              type="checkbox"
              checked={enableSelectionEvent}
              onChange={(event) =>
                setEnableSelectionEvent(event.target.checked)
              }
            />
          </div>
        </aside>

        <section className="workspace">
          <section className="meta">
            <p>Hover label: {hoverLabel}</p>
            <p>Hover id: {hoverId}</p>
            <p>Last click id: {lastClicked}</p>
            <p>Selected count: {selectedIds.length}</p>
            <p>Last selection payload: {lastSelectionPayload}</p>
            <p>
              Load status:{" "}
              {isLoading
                ? "Loading..."
                : topoError
                  ? `Error: ${topoError}`
                  : "Ready"}
            </p>
          </section>

          <section className="mapShell" style={mapStyle}>
            {!topoData ? (
              <p>
                {isLoading
                  ? "Loading TopoJSON..."
                  : topoError || "No data loaded"}
              </p>
            ) : (
              <NepalMap
                topoData={topoData as any}
                fitParent={fitParent}
                width={fitParent ? undefined : mapWidth}
                height={fitParent ? undefined : mapHeight}
                initialLevel={initialLevel}
                selectionMode={selectionMode}
                selectedIds={
                  controlledSelectedIds && selectionMode === "select"
                    ? selectedIds
                    : undefined
                }
                ariaLabel={ariaLabel}
                onSelectionChange={
                  enableSelectionEvent ? handleSelectionChange : undefined
                }
                onRegionHover={enableHoverEvent ? handleHover : undefined}
                onRegionClick={enableClickEvent ? handleClick : undefined}
                theme={theme}
              />
            )}
          </section>

          <section className="eventsPanel">
            <div className="eventsHeader">
              <h2>Event Log</h2>
              <button
                type="button"
                onClick={() => {
                  setEvents([]);
                  setLastSelectionPayload("-");
                }}
              >
                Clear
              </button>
            </div>

            {events.length === 0 ? (
              <p className="empty">No events yet. Interact with the map.</p>
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
        </section>
      </section>
    </main>
  );
}

export default App;
