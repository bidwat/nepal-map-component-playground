import { useEffect, useRef, useState } from "react";

import { NepalMap, VIEW_LEVEL, type SelectionMode } from "nepal-map-component";

import { DEFAULT_MAP_THEME } from "../playground";
import type {
  GettingStartedExample,
  GettingStartedExampleConfig,
} from "./types";

interface SectionLink {
  id: string;
  label: string;
}

interface PropDoc {
  name: string;
  type: string;
  defaultValue: string;
  details: string;
}

interface PropGroupDoc {
  title: string;
  props: PropDoc[];
}

const DOC_SECTIONS: SectionLink[] = [
  { id: "overview", label: "Overview" },
  { id: "installation", label: "Installation" },
  { id: "quick-start", label: "Quick Start" },
  { id: "worked-examples", label: "Worked Examples" },
  { id: "props-reference", label: "Props Reference" },
  { id: "callback-functions", label: "Callback Functions" },
  { id: "helper-exports", label: "Helper Exports" },
  { id: "region-ids", label: "Region IDs" },
  { id: "accessibility", label: "Accessibility" },
];

const QUICK_START_SNIPPET = `import {
  NepalMap,
  VIEW_LEVEL,
  getRegionReferenceById,
} from "nepal-map-component";

export default function NepalMapQuickStart() {
  const bagmati = getRegionReferenceById("province:bagmati");
  if (!bagmati) return null;

  return (
    <div style={{ width: 960, height: 640 }}>
      <NepalMap
        fitParent
        startLevel={VIEW_LEVEL.PROVINCE}
        startRegion={bagmati}
        endLevel={VIEW_LEVEL.WARD}
        selectionMode="single"
        ariaLabel="Nepal administrative map"
      />
    </div>
  );
}`;

const PROP_GROUPS: PropGroupDoc[] = [
  {
    title: "Navigation and Scope",
    props: [
      {
        name: "startLevel",
        type: "ViewLevel",
        defaultValue: '"country"',
        details: "Defines the first hierarchy level shown when the map mounts.",
      },
      {
        name: "startRegion",
        type: "RegionReference",
        defaultValue: "null",
        details:
          "Preferred typed root selector when startLevel is not country. When empty (null/undefined), startRegionId is used if provided.",
      },
      {
        name: "startRegionId",
        type: "RegionId",
        defaultValue: "null",
        details:
          "Backward-compatible root selector. When both startRegion and startRegionId are empty, country level works but non-country startLevel throws at runtime.",
      },
      {
        name: "endLevel",
        type: "ViewLevel",
        defaultValue: '"ward"',
        details:
          "Sets the deepest allowed drill level for navigation and selection.",
      },
      {
        name: "skipLevels",
        type: "ViewLevel[]",
        defaultValue: "[]",
        details: "Skips selected hierarchy levels during drill transitions.",
      },
      {
        name: "showFirstLayerDivisions",
        type: "boolean",
        defaultValue: "false",
        details:
          "Starts with first child partitions visible and keeps zoom-out bounded.",
      },
      {
        name: "openEndLevel",
        type: "boolean",
        defaultValue: "false",
        details:
          "Allows same-level isolate drill behavior at endLevel before selection.",
      },
    ],
  },
  {
    title: "Selection and Interaction",
    props: [
      {
        name: "selectionMode",
        type: '"none" | "single" | "multi"',
        defaultValue: '"single"',
        details:
          "Controls selection behavior when users click regions at endLevel.",
      },
      {
        name: "selectable",
        type: "boolean",
        defaultValue: "true",
        details:
          "Global gate for selection actions at the effective end level.",
      },
      {
        name: "selectedIds",
        type: "RegionId[]",
        defaultValue: "null",
        details:
          "Controlled selection input. null/undefined uses internal state. An empty array [] is controlled-empty and requires onSelectionChange updates.",
      },
      {
        name: "selectableProtectedAreas",
        type: "boolean",
        defaultValue: "false",
        details:
          "Enables click and selection for protected-area ward features.",
      },
      {
        name: "mapPolicy",
        type: "NepalMapPolicy",
        defaultValue: "null",
        details:
          "Overrides per-level and per-region enabled state and theme colors. null/undefined means no policy overrides.",
      },
    ],
  },
  {
    title: "Labels and Visuals",
    props: [
      {
        name: "showPartitionLabels",
        type: "boolean",
        defaultValue: "false",
        details:
          "Shows labels for currently visible partitions in the active layer.",
      },
      {
        name: "partitionLabelFontSize",
        type: "number",
        defaultValue: "10",
        details:
          "Desired label size in screen space. The component compensates for zoom.",
      },
      {
        name: "theme",
        type: "Partial<NepalMapTheme>",
        defaultValue: "null (library defaults)",
        details:
          "Base map colors and stroke styles used before policy overrides.",
      },
    ],
  },
  {
    title: "Layout and Accessibility",
    props: [
      {
        name: "fitParent",
        type: "boolean",
        defaultValue: "false",
        details:
          "When true, map size tracks parent container dimensions automatically.",
      },
      {
        name: "width",
        type: "number",
        defaultValue: "960",
        details:
          "Base SVG width when fitParent is false. Also used as fallback width.",
      },
      {
        name: "height",
        type: "number",
        defaultValue: "640",
        details:
          "Base SVG height when fitParent is false. Also used as fallback height.",
      },
      {
        name: "ariaLabel",
        type: "string",
        defaultValue: '"Nepal administrative map"',
        details:
          "Accessible map label. Active level is appended internally for context.",
      },
    ],
  },
];

const CALLBACK_DOCS = [
  {
    name: "onRegionHover",
    signature: "(feature: RegionFeature | null) => void",
    details:
      "Fires when hover focus changes. Receives null when pointer leaves features.",
  },
  {
    name: "onRegionClick",
    signature: "(feature: RegionFeature) => void",
    details:
      "Fires on successful activation click. Includes feature id and normalized label.",
  },
  {
    name: "onSelectionChange",
    signature: "(selectedIds: RegionId[]) => void",
    details:
      "Fires when selection changes. Use with selectedIds for controlled selection.",
  },
];

const HELPER_EXPORTS = [
  {
    name: "VIEW_LEVEL / VIEW_LEVELS / isViewLevel",
    details:
      "Level constants, ordered level list, and runtime level guard for safe parsing.",
  },
  {
    name: "getRegionCatalog / getRegionReferenceById",
    details:
      "Typed region lookup tools so you can avoid hardcoded IDs in UI logic.",
  },
  {
    name: "getRegionLevelFromId",
    details:
      "Extracts hierarchy level from a region id and helps validate external inputs.",
  },
  {
    name: "buildLayerCollections / parseNepalTopology",
    details:
      "Lower-level topology helpers for advanced data workflows and testing.",
  },
  {
    name: "evaluateRegionActivation / evaluateBackgroundNavigation",
    details:
      "Interaction transition helpers used by the map engine for drill and zoom logic.",
  },
];

function resolveSelectionMode(
  selectionMode: SelectionMode | undefined,
): SelectionMode {
  return selectionMode ?? "single";
}

function renderExampleMap(config: GettingStartedExampleConfig) {
  if (config.startLevel !== VIEW_LEVEL.COUNTRY && !config.startRegion) {
    return (
      <p className="gettingStartedMapMessage">
        This example requires a specific start region, but one is not available
        in the current dataset.
      </p>
    );
  }

  const selectionMode = resolveSelectionMode(config.selectionMode);
  const selectedIds =
    selectionMode === "single" || selectionMode === "multi"
      ? config.selectedIds
      : undefined;

  return (
    <div
      className="gettingStartedExampleMapViewport"
      style={{
        width: "100%",
        maxWidth: `${config.width}px`,
        height: `${config.height}px`,
      }}
    >
      <NepalMap
        fitParent
        startLevel={config.startLevel}
        endLevel={config.endLevel}
        skipLevels={config.skipLevels ?? []}
        showFirstLayerDivisions={config.showFirstLayerDivisions ?? false}
        openEndLevel={config.openEndLevel ?? false}
        showPartitionLabels={config.showPartitionLabels ?? false}
        partitionLabelFontSize={config.partitionLabelFontSize ?? 10}
        selectableProtectedAreas={config.selectableProtectedAreas ?? false}
        startRegion={config.startRegion ?? undefined}
        selectable={config.selectable ?? true}
        selectionMode={selectionMode}
        mapPolicy={config.mapPolicy}
        selectedIds={selectedIds}
        ariaLabel={config.ariaLabel}
        theme={config.theme ?? DEFAULT_MAP_THEME}
      />
    </div>
  );
}

function ExampleLoader() {
  return (
    <div className="gettingStartedLoader" role="status" aria-live="polite">
      <span className="gettingStartedSpinner" aria-hidden="true" />
      <div>
        <strong>Loading worked examples...</strong>
        <p>
          Preparing live maps and code snippets. This can take a moment on first
          load.
        </p>
      </div>
    </div>
  );
}

export function GettingStartedPage() {
  const scrollRootRef = useRef<HTMLElement | null>(null);
  const [activeSection, setActiveSection] = useState<string>(
    DOC_SECTIONS[0].id,
  );
  const [examples, setExamples] = useState<GettingStartedExample[] | null>(
    null,
  );
  const [examplesError, setExamplesError] = useState("");

  useEffect(() => {
    let mounted = true;

    import("./examples")
      .then((module) => {
        if (!mounted) return;
        setExamples(module.GETTING_STARTED_EXAMPLES);
      })
      .catch(() => {
        if (!mounted) return;
        setExamples([]);
        setExamplesError(
          "Worked examples could not be loaded right now. Please refresh the page.",
        );
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (typeof IntersectionObserver === "undefined") return;
    if (!scrollRootRef.current) return;

    const sections = DOC_SECTIONS.map((section) =>
      document.getElementById(section.id),
    ).filter((element): element is HTMLElement => Boolean(element));

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (entryA, entryB) =>
              entryB.intersectionRatio - entryA.intersectionRatio,
          );

        if (visibleEntries.length > 0) {
          setActiveSection(visibleEntries[0].target.id);
        }
      },
      {
        root: scrollRootRef.current,
        rootMargin: "-20% 0px -62% 0px",
        threshold: [0.15, 0.35, 0.6],
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
    };
  }, []);

  const isExamplesLoading = examples === null && examplesError.length === 0;

  return (
    <section
      ref={scrollRootRef}
      className="gettingStarted gettingStartedDocs"
      aria-label="Getting Started"
    >
      <aside
        className="gettingStartedSidebar"
        aria-label="Getting Started sections"
      >
        <p className="gettingStartedSidebarTitle">On This Page</p>
        <nav className="gettingStartedSidebarNav">
          {DOC_SECTIONS.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className={`gettingStartedSidebarLink ${
                activeSection === section.id
                  ? "gettingStartedSidebarLinkActive"
                  : ""
              }`}
            >
              {section.label}
            </a>
          ))}
        </nav>

        <div className="gettingStartedSidebarMeta">
          <p>
            <strong>Worked examples:</strong> 7
          </p>
        </div>
      </aside>

      <div className="gettingStartedContent">
        <header className="gettingStartedHero" id="overview">
          <h1>Nepal Map Component Guide</h1>
          <p>
            Nepal Map Component provides a map of Nepal that is comprehensive
            and allows flexible usage. With the number of options available,
            props can quickly feel overwhelming. Below, we have a curated set of
            examples and documentation to help you get started, understand the
            core concepts, and find your way around the available features.{" "}
            <br />
            Use our Playground to experiment with the map, decide and configure
            what you want, and generate code to implement it in your app. :)
          </p>
        </header>

        <section className="gettingStartedBlock" id="installation">
          <h2>Installation</h2>
          <p>
            Install the package from npm, then import the map component and
            helper utilities in your React app.
          </p>
          <pre>
            <code>npm install nepal-map-component</code>
          </pre>
        </section>

        <section className="gettingStartedBlock" id="quick-start">
          <h2>Quick Start</h2>
          <p>
            Use typed region helpers for safer setup when your start level is
            not country-level.
          </p>
          <pre>
            <code>{QUICK_START_SNIPPET}</code>
          </pre>
        </section>

        <section className="gettingStartedBlock" id="worked-examples">
          <h2>Worked Examples</h2>
          <p>
            Each example is fully worked out and demonstrates a realistic
            scenario with props and behavior.
          </p>

          {isExamplesLoading ? (
            <ExampleLoader />
          ) : examplesError ? (
            <p className="gettingStartedError">{examplesError}</p>
          ) : (
            <div
              className="gettingStartedExamples"
              aria-label="Getting started live examples"
            >
              {(examples ?? []).map((example) => (
                <article className="gettingStartedExampleCard" key={example.id}>
                  <header className="gettingStartedExampleHeader">
                    <h3>{example.title}</h3>
                    <p>{example.description}</p>
                  </header>

                  <div className="gettingStartedExampleBody">
                    <div
                      className="gettingStartedExampleMap"
                      role="presentation"
                    >
                      {renderExampleMap(example.config)}
                    </div>

                    <div className="gettingStartedExampleCode">
                      <pre>
                        <code>{example.code}</code>
                      </pre>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="gettingStartedBlock" id="props-reference">
          <h2>Props Reference</h2>
          <p>
            Complete prop reference for `NepalMap`, grouped by responsibility.
          </p>
          <p>
            Empty prop behavior: most optional props treat null/undefined as
            "not provided" and fall back to built-in defaults. For
            `selectedIds`, passing `[]` keeps the map in controlled mode; you
            must handle `onSelectionChange` to reflect user clicks.
          </p>

          <div className="gettingStartedPropGroups">
            {PROP_GROUPS.map((group) => (
              <article className="gettingStartedPropGroup" key={group.title}>
                <h3>{group.title}</h3>
                <div className="gettingStartedPropList">
                  {group.props.map((prop) => (
                    <div className="gettingStartedPropCard" key={prop.name}>
                      <div className="gettingStartedPropHeader">
                        <code>{prop.name}</code>
                        <span>{prop.type}</span>
                      </div>
                      <p>{prop.details}</p>
                      <p className="gettingStartedPropDefault">
                        Default: <code>{prop.defaultValue}</code>
                      </p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="gettingStartedBlock" id="callback-functions">
          <h2>Callback Functions</h2>
          <p>
            Use callbacks to sync UI state with map interactions and user
            actions.
          </p>
          <div className="gettingStartedInfoList">
            {CALLBACK_DOCS.map((callbackDoc) => (
              <article
                className="gettingStartedInfoCard"
                key={callbackDoc.name}
              >
                <h3>{callbackDoc.name}</h3>
                <pre>
                  <code>{callbackDoc.signature}</code>
                </pre>
                <p>{callbackDoc.details}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="gettingStartedBlock" id="helper-exports">
          <h2>Helper Exports</h2>
          <p>
            Besides the main component, the package exports utilities for
            catalogs, levels, policy, and transition logic.
          </p>
          <div className="gettingStartedInfoList">
            {HELPER_EXPORTS.map((helperExport) => (
              <article
                className="gettingStartedInfoCard"
                key={helperExport.name}
              >
                <h3>{helperExport.name}</h3>
                <p>{helperExport.details}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="gettingStartedBlock" id="region-ids">
          <h2>Region IDs</h2>
          <p>
            Region IDs are deterministic, lowercase, and reflect Nepal's admin
            hierarchy.
          </p>
          <pre>
            <code>{`country:nepal
province:bagmati
district:bagmati:kathmandu
local_unit:bagmati:kathmandu:kathmandu-metropolitan-city
ward:bagmati:kathmandu:kathmandu-metropolitan-city:1
ward:special:bagmati:chitwan:chitwan-national-park:1`}</code>
          </pre>
        </section>

        <section className="gettingStartedBlock" id="accessibility">
          <h2>Accessibility and Keyboard Notes</h2>
          <p>
            Regions are keyboard-focusable and interaction events are designed
            to work across pointer and keyboard navigation. Always provide a
            clear `ariaLabel` so assistive technology can announce context.
          </p>
          <p>
            For larger apps, combine controlled selection (`selectedIds`) and
            callback handlers to mirror map state in external UI elements.
          </p>
        </section>
      </div>
    </section>
  );
}
