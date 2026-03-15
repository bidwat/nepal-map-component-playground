import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import {
  NepalMap,
  VIEW_LEVEL,
  type NepalMapPolicy,
  type MapPolicyLevelConfig,
  type MapPolicyRegionConfig,
  type NepalMapTheme,
  type RegionId,
  type RegionReference,
  type RegionFeature,
  type SelectionMode,
  type ViewLevel,
} from "nepal-map-component";

import "./App.css";
import {
  CheckboxField,
  DEFAULT_ARIA_LABEL,
  DEFAULT_MAP_THEME,
  DEFAULT_PLAYGROUND_SIZE,
  EventLogPanel,
  FieldSection,
  GENERATED_CODE_FILENAME,
  GeneratedCodePanel,
  InfoIcon,
  LevelSelect,
  MAP_POLICY_HELP_TEXT,
  MAX_EVENT_LOG_ITEMS,
  MIN_MAP_DIMENSION,
  MOBILE_VIEWPORT_MAX_WIDTH,
  MetaPanel,
  PARTITION_LABEL_FONT_MAX,
  PARTITION_LABEL_FONT_MIN,
  POLICY_COLOR_KEYS,
  POLICY_REGION_LEVEL_OPTIONS,
  REGION_CATALOG,
  SKIP_LEVEL_OPTIONS,
  STROKE_WIDTH_MAX,
  STROKE_WIDTH_MIN,
  STROKE_WIDTH_STEP,
  SkipLevelsSelect,
  THEME_COLOR_KEYS,
  ThemeModeIcon,
  buildGeneratedComponentCode,
  copyTextToClipboard,
  nowLabel,
  parseMapPolicySafe,
  parseSelectedIds,
  resolveBuilderEnabled,
  usePolicyHelpPopoverPosition,
  type EventItem,
  type PolicyBuilderColorKey,
  type PolicyBuilderColors,
  type PolicyBuilderEnabledMode,
  type PolicyBuilderTarget,
  type UiMode,
} from "./playground";
import { GettingStartedPage } from "./gettingStarted";

type AppPage = "getting-started" | "playground";

function App() {
  const [startLevel, setStartLevel] = useState<ViewLevel>(VIEW_LEVEL.COUNTRY);
  const [endLevel, setEndLevel] = useState<ViewLevel>(VIEW_LEVEL.WARD);
  const [skipLevels, setSkipLevels] = useState<ViewLevel[]>([]);
  const [isSkipLevelsOpen, setIsSkipLevelsOpen] = useState(false);
  const [showFirstLayerDivisions, setShowFirstLayerDivisions] = useState(false);
  const [openEndLevel, setOpenEndLevel] = useState(false);
  const [showPartitionLabels, setShowPartitionLabels] = useState(false);
  const [partitionLabelFontSize, setPartitionLabelFontSize] = useState(10);
  const [selectableProtectedAreas, setSelectableProtectedAreas] =
    useState(false);
  const [selectable, setSelectable] = useState(true);
  const [startRegionIdInput, setStartRegionIdInput] = useState("");
  const [selectionMode, setSelectionMode] = useState<SelectionMode>("single");
  const [mapPolicyInput, setMapPolicyInput] = useState("");
  const [showMapPolicyHelp, setShowMapPolicyHelp] = useState(false);
  const [policyBuilderTarget, setPolicyBuilderTarget] =
    useState<PolicyBuilderTarget>("level");
  const [policyBuilderLevel, setPolicyBuilderLevel] = useState<ViewLevel>(
    VIEW_LEVEL.DISTRICT,
  );
  const [policyBuilderRegionLevel, setPolicyBuilderRegionLevel] =
    useState<ViewLevel>(VIEW_LEVEL.PROVINCE);
  const [policyBuilderRegionId, setPolicyBuilderRegionId] = useState<
    RegionId | ""
  >("");
  const [policyBuilderEnabledMode, setPolicyBuilderEnabledMode] =
    useState<PolicyBuilderEnabledMode>("enabled");
  const [policyBuilderIncludeColors, setPolicyBuilderIncludeColors] =
    useState(false);
  const [policyBuilderColors, setPolicyBuilderColors] =
    useState<PolicyBuilderColors>({
      primary: DEFAULT_MAP_THEME.primary,
      disabled: DEFAULT_MAP_THEME.disabled,
      hover: DEFAULT_MAP_THEME.hover,
      selected: DEFAULT_MAP_THEME.selected,
    });
  const [policyBuilderFeedback, setPolicyBuilderFeedback] = useState("");
  const [isMobileViewport, setIsMobileViewport] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth <= MOBILE_VIEWPORT_MAX_WIDTH;
  });
  const [uiMode, setUiMode] = useState<UiMode>(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return "dark";
    }

    return "light";
  });
  const [activePage, setActivePage] = useState<AppPage>("getting-started");

  const [fitParent, setFitParent] = useState(true);
  const [mapWidth, setMapWidth] = useState<number>(
    DEFAULT_PLAYGROUND_SIZE.width,
  );
  const [mapHeight, setMapHeight] = useState<number>(
    DEFAULT_PLAYGROUND_SIZE.height,
  );
  const [parentWidth, setParentWidth] = useState<number>(
    DEFAULT_PLAYGROUND_SIZE.width,
  );
  const [parentHeight, setParentHeight] = useState<number>(
    DEFAULT_PLAYGROUND_SIZE.height,
  );

  const [ariaLabel, setAriaLabel] = useState(DEFAULT_ARIA_LABEL);

  const [theme, setTheme] = useState<NepalMapTheme>({ ...DEFAULT_MAP_THEME });

  const [controlledSelectedIds, setControlledSelectedIds] = useState(true);
  const [selectedIds, setSelectedIds] = useState<RegionId[]>([]);
  const [selectedIdsInput, setSelectedIdsInput] = useState("");

  const [enableHoverEvent, setEnableHoverEvent] = useState(true);
  const [enableClickEvent, setEnableClickEvent] = useState(true);
  const [enableSelectionEvent, setEnableSelectionEvent] = useState(true);

  const [hoverLabel, setHoverLabel] = useState<string>("-");
  const [hoverId, setHoverId] = useState<string>("-");
  const [lastClicked, setLastClicked] = useState<string>("-");
  const [lastSelectionPayload, setLastSelectionPayload] = useState<string>("-");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [codeFeedback, setCodeFeedback] = useState("");

  const eventCounterRef = useRef(0);
  const lastHoverLoggedIdRef = useRef<string>("");
  const skipLevelsDropdownRef = useRef<HTMLDivElement>(null);
  const mapPolicyInfoButtonRef = useRef<HTMLButtonElement>(null);
  const policyHelpPopoverStyle = usePolicyHelpPopoverPosition({
    show: showMapPolicyHelp,
    isMobileViewport,
    anchorRef: mapPolicyInfoButtonRef,
  });

  useEffect(() => {
    if (typeof document === "undefined") return;

    document.body.dataset.uiMode = uiMode;
    return () => {
      delete document.body.dataset.uiMode;
    };
  }, [uiMode]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setIsMobileViewport(window.innerWidth <= MOBILE_VIEWPORT_MAX_WIDTH);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (!isSkipLevelsOpen || typeof document === "undefined") return;

    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        skipLevelsDropdownRef.current &&
        !skipLevelsDropdownRef.current.contains(target)
      ) {
        setIsSkipLevelsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleDocumentClick);
    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
    };
  }, [isSkipLevelsOpen]);

  useEffect(() => {
    if (!showMapPolicyHelp || typeof document === "undefined") return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowMapPolicyHelp(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showMapPolicyHelp]);

  function toggleSkipLevel(level: ViewLevel) {
    setSkipLevels((previous) =>
      previous.includes(level)
        ? previous.filter((item) => item !== level)
        : [...previous, level],
    );
  }

  function removeSkipLevel(level: ViewLevel) {
    setSkipLevels((previous) => previous.filter((item) => item !== level));
  }

  function pushEvent(type: EventItem["type"], text: string) {
    eventCounterRef.current += 1;
    const entry: EventItem = {
      id: eventCounterRef.current,
      type,
      text: `${nowLabel()} — ${text}`,
    };

    setEvents((previous) => [entry, ...previous].slice(0, MAX_EVENT_LOG_ITEMS));
  }

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

  function handleSelectionChange(nextIds: RegionId[]) {
    setSelectedIds(nextIds);
    setSelectedIdsInput(nextIds.join(", "));
    setLastSelectionPayload(JSON.stringify(nextIds));

    if (!enableSelectionEvent) return;
    pushEvent("selection", `onSelectionChange: [${nextIds.join(", ")}]`);
  }

  async function handleCopyGeneratedCode() {
    try {
      const copied = await copyTextToClipboard(generatedComponentCode);
      setCodeFeedback(
        copied
          ? "Code copied to clipboard."
          : "Could not access clipboard. You can copy manually from the code block.",
      );
    } catch {
      setCodeFeedback(
        "Could not access clipboard. You can copy manually from the code block.",
      );
    }
  }

  function handleDownloadGeneratedCode() {
    const blob = new Blob([generatedComponentCode], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = GENERATED_CODE_FILENAME;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setCodeFeedback(`Downloaded ${GENERATED_CODE_FILENAME}.`);
  }

  function updatePolicyBuilderColor(key: PolicyBuilderColorKey, value: string) {
    setPolicyBuilderColors((previous) => ({ ...previous, [key]: value }));
  }

  function resetPolicyBuilder() {
    const defaultRegionId =
      REGION_CATALOG.byLevel[VIEW_LEVEL.PROVINCE][0]?.id ?? "";

    setPolicyBuilderTarget("level");
    setPolicyBuilderLevel(VIEW_LEVEL.DISTRICT);
    setPolicyBuilderRegionLevel(VIEW_LEVEL.PROVINCE);
    setPolicyBuilderRegionId(defaultRegionId);
    setPolicyBuilderEnabledMode("enabled");
    setPolicyBuilderIncludeColors(false);
    setPolicyBuilderColors({
      primary: theme.primary,
      disabled: theme.disabled,
      hover: theme.hover,
      selected: theme.selected,
    });
    setPolicyBuilderFeedback("Builder reset.");
  }

  function applyPolicyBuilderRule() {
    let basePolicy: NepalMapPolicy = {};
    let replacedInvalidPolicyInput = false;

    if (mapPolicyInput.trim()) {
      try {
        const parsed = JSON.parse(mapPolicyInput) as NepalMapPolicy;
        basePolicy =
          parsed && typeof parsed === "object"
            ? parsed
            : parseMapPolicySafe(mapPolicyInput);
      } catch {
        replacedInvalidPolicyInput = true;
      }
    }

    const nextPolicy: NepalMapPolicy = {
      levels: { ...(basePolicy.levels ?? {}) },
      regions: { ...(basePolicy.regions ?? {}) },
    };

    const enabled = resolveBuilderEnabled(policyBuilderEnabledMode);
    const hasConfig =
      typeof enabled === "boolean" || policyBuilderIncludeColors;

    const config: MapPolicyLevelConfig | MapPolicyRegionConfig = {};
    if (typeof enabled === "boolean") {
      config.enabled = enabled;
    }
    if (policyBuilderIncludeColors) {
      config.colors = { ...policyBuilderColors };
    }

    if (policyBuilderTarget === "level") {
      if (!nextPolicy.levels) nextPolicy.levels = {};

      if (hasConfig) {
        nextPolicy.levels[policyBuilderLevel] = config as MapPolicyLevelConfig;
      } else {
        delete nextPolicy.levels[policyBuilderLevel];
      }
    } else {
      const selectedPolicyRegionId = policyBuilderRegionSelectValue as
        | RegionId
        | "";

      if (!selectedPolicyRegionId) {
        setPolicyBuilderFeedback(
          "Select a region before applying a region-level rule.",
        );
        return;
      }

      if (!nextPolicy.regions) nextPolicy.regions = {};

      if (hasConfig) {
        nextPolicy.regions[selectedPolicyRegionId] =
          config as MapPolicyRegionConfig;
      } else {
        delete nextPolicy.regions[selectedPolicyRegionId];
      }
    }

    if (nextPolicy.levels && Object.keys(nextPolicy.levels).length === 0) {
      delete nextPolicy.levels;
    }
    if (nextPolicy.regions && Object.keys(nextPolicy.regions).length === 0) {
      delete nextPolicy.regions;
    }

    const nextPolicyInput =
      Object.keys(nextPolicy).length > 0
        ? JSON.stringify(nextPolicy, null, 2)
        : "";

    setMapPolicyInput(nextPolicyInput);
    setPolicyBuilderFeedback(
      replacedInvalidPolicyInput
        ? "Applied rule and replaced invalid mapPolicy JSON."
        : "Applied rule to mapPolicy JSON.",
    );
  }

  const mapStyle = fitParent
    ? ({ width: `min(100%, ${parentWidth}px)`, height: parentHeight } as const)
    : ({ width: `min(100%, ${mapWidth}px)`, height: mapHeight } as const);

  const shouldControlSelectedIds =
    controlledSelectedIds &&
    (selectionMode === "single" || selectionMode === "multi");

  const normalizedStartRegionId = startRegionIdInput.trim() as RegionId;
  const startRegionOptions =
    startLevel === VIEW_LEVEL.COUNTRY ? [] : REGION_CATALOG.byLevel[startLevel];
  const startRegionSelectValue =
    startLevel === VIEW_LEVEL.COUNTRY
      ? ""
      : startRegionOptions.some(
            (region) => region.id === normalizedStartRegionId,
          )
        ? normalizedStartRegionId
        : (startRegionOptions[0]?.id ?? "");
  const selectedStartRegion: RegionReference | null =
    startRegionOptions.find((region) => region.id === startRegionSelectValue) ??
    null;
  const missingRequiredStartRegionId =
    startLevel !== VIEW_LEVEL.COUNTRY && startRegionSelectValue.length === 0;

  const policyBuilderRegionOptions =
    REGION_CATALOG.byLevel[policyBuilderRegionLevel];
  const policyBuilderRegionSelectValue = policyBuilderRegionOptions.some(
    (region) => region.id === policyBuilderRegionId,
  )
    ? policyBuilderRegionId
    : (policyBuilderRegionOptions[0]?.id ?? "");

  let parsedMapPolicy: NepalMapPolicy | undefined;
  let mapPolicyParseError = "";
  if (mapPolicyInput.trim()) {
    try {
      parsedMapPolicy = JSON.parse(mapPolicyInput) as NepalMapPolicy;
    } catch {
      mapPolicyParseError = "Invalid mapPolicy JSON.";
    }
  }
  const shouldRenderMap = !missingRequiredStartRegionId && !mapPolicyParseError;
  const generatedComponentCode = buildGeneratedComponentCode({
    fitParent,
    width: mapWidth,
    height: mapHeight,
    startLevel,
    endLevel,
    skipLevels,
    showFirstLayerDivisions,
    openEndLevel,
    showPartitionLabels,
    partitionLabelFontSize,
    selectableProtectedAreas,
    startRegion: selectedStartRegion,
    selectable,
    selectionMode,
    mapPolicy: parsedMapPolicy,
    mapPolicyHasError: Boolean(mapPolicyParseError),
    controlledSelectedIds,
    selectedIds,
    ariaLabel,
    theme,
    enableHoverEvent,
    enableClickEvent,
    enableSelectionEvent,
  });
  const pageClassName = `page ${uiMode === "dark" ? "pageDark" : "pageLight"}`;
  const mapPolicyHelpPopover =
    activePage === "playground" &&
    showMapPolicyHelp &&
    typeof document !== "undefined"
      ? createPortal(
          <div
            className="policyHelpPopover policyHelpPopoverDesktop"
            role="tooltip"
            style={policyHelpPopoverStyle}
            onMouseDown={(event) => {
              event.stopPropagation();
            }}
          >
            {MAP_POLICY_HELP_TEXT}
          </div>,
          document.body,
        )
      : null;

  return (
    <main className={pageClassName}>
      <nav className="navbar" aria-label="Primary">
        <div className="navBrand">Nepal Map Component</div>
        <div className="navLinks" role="tablist" aria-label="Pages">
          <button
            type="button"
            className={`navLink ${
              activePage === "getting-started" ? "navLinkActive" : ""
            }`}
            role="tab"
            aria-selected={activePage === "getting-started"}
            onClick={() => {
              setActivePage("getting-started");
              setShowMapPolicyHelp(false);
            }}
          >
            Getting Started
          </button>
          <button
            type="button"
            className={`navLink ${
              activePage === "playground" ? "navLinkActive" : ""
            }`}
            role="tab"
            aria-selected={activePage === "playground"}
            onClick={() => setActivePage("playground")}
          >
            Playground
          </button>
        </div>
        <button
          className="modeToggle"
          type="button"
          onClick={() =>
            setUiMode((previous) => (previous === "dark" ? "light" : "dark"))
          }
          aria-label={`Switch to ${uiMode === "dark" ? "light" : "dark"} mode`}
          title={`Switch to ${uiMode === "dark" ? "light" : "dark"} mode`}
        >
          <ThemeModeIcon mode={uiMode} />
          <span className="srOnly">
            Switch to {uiMode === "dark" ? "light" : "dark"} mode
          </span>
        </button>
      </nav>

      {activePage === "getting-started" ? (
        <GettingStartedPage />
      ) : (
        <section className="layout">
          <aside className="panel">
            <h2 className="panelTitle">Playground Controls</h2>
            <div className="panelSections">
              <FieldSection
                title="View Scope"
                description="Define where the map starts and how deep navigation can go."
                className={
                  isSkipLevelsOpen ? "controlSectionRaised" : undefined
                }
              >
                <div className="fieldRow">
                  <label htmlFor="startLevel">startLevel</label>
                  <LevelSelect
                    id="startLevel"
                    value={startLevel}
                    onChange={setStartLevel}
                  />
                </div>

                <div className="fieldRow">
                  <label htmlFor="endLevel">endLevel</label>
                  <LevelSelect
                    id="endLevel"
                    value={endLevel}
                    onChange={setEndLevel}
                  />
                </div>

                <div className="fieldRow">
                  <label htmlFor="startRegionId">startRegion</label>
                  {startLevel === VIEW_LEVEL.COUNTRY ? (
                    <input
                      id="startRegionId"
                      value="Not required at country level"
                      disabled
                    />
                  ) : (
                    <select
                      id="startRegionId"
                      value={startRegionSelectValue}
                      onChange={(event) =>
                        setStartRegionIdInput(event.target.value)
                      }
                    >
                      {startRegionOptions.map((region) => (
                        <option key={region.id} value={region.id}>
                          {region.name} ({region.id})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <SkipLevelsSelect
                  id="skipLevels"
                  label="skipLevels"
                  options={SKIP_LEVEL_OPTIONS}
                  skipLevels={skipLevels}
                  isOpen={isSkipLevelsOpen}
                  containerRef={skipLevelsDropdownRef}
                  onToggleOpen={() =>
                    setIsSkipLevelsOpen((previous) => !previous)
                  }
                  onToggleLevel={toggleSkipLevel}
                  onRemoveLevel={removeSkipLevel}
                />
              </FieldSection>

              <FieldSection
                title="Interactivity"
                description="Configure what users can select and which partitions are visible."
              >
                <CheckboxField
                  id="selectable"
                  label="selectable"
                  checked={selectable}
                  onChange={setSelectable}
                />

                <CheckboxField
                  id="showFirstLayerDivisions"
                  label="showFirstLayerDivisions"
                  checked={showFirstLayerDivisions}
                  onChange={setShowFirstLayerDivisions}
                />

                <CheckboxField
                  id="openEndLevel"
                  label="openEndLevel"
                  checked={openEndLevel}
                  onChange={setOpenEndLevel}
                />

                <CheckboxField
                  id="showPartitionLabels"
                  label="showPartitionLabels"
                  checked={showPartitionLabels}
                  onChange={setShowPartitionLabels}
                />

                <div className="fieldRow">
                  <label htmlFor="partitionLabelFontSize">
                    partitionLabelFontSize
                  </label>
                  <input
                    id="partitionLabelFontSize"
                    type="number"
                    min={PARTITION_LABEL_FONT_MIN}
                    max={PARTITION_LABEL_FONT_MAX}
                    step={1}
                    value={partitionLabelFontSize}
                    onChange={(event) =>
                      setPartitionLabelFontSize(
                        Number(event.target.value) || PARTITION_LABEL_FONT_MIN,
                      )
                    }
                  />
                </div>

                <CheckboxField
                  id="selectableProtectedAreas"
                  label="selectableProtectedAreas"
                  checked={selectableProtectedAreas}
                  onChange={setSelectableProtectedAreas}
                />

                <div className="fieldRow">
                  <label htmlFor="selectionMode">selectionMode</label>
                  <select
                    id="selectionMode"
                    value={selectionMode}
                    onChange={(event) =>
                      setSelectionMode(event.target.value as SelectionMode)
                    }
                  >
                    <option value="none">none</option>
                    <option value="single">single</option>
                    <option value="multi">multi</option>
                  </select>
                </div>

                <div className="fieldRow">
                  <div className="fieldLabelRow">
                    <label htmlFor="mapPolicyInput">mapPolicy (JSON)</label>
                    <div className="infoButtonWrap">
                      <button
                        type="button"
                        className="infoButton"
                        ref={mapPolicyInfoButtonRef}
                        aria-label="What is mapPolicy?"
                        aria-expanded={showMapPolicyHelp}
                        title="What is mapPolicy?"
                        onMouseDown={(event) => {
                          event.stopPropagation();
                        }}
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          setShowMapPolicyHelp((previous) => !previous);
                        }}
                      >
                        <InfoIcon />
                      </button>
                    </div>
                  </div>
                  <textarea
                    id="mapPolicyInput"
                    rows={4}
                    value={mapPolicyInput}
                    onChange={(event) => setMapPolicyInput(event.target.value)}
                    placeholder='{"levels":{"district":{"enabled":false}}}'
                  />
                </div>

                <section
                  className="policyBuilder"
                  aria-label="Map policy builder"
                >
                  <div className="policyBuilderHeader">
                    <h4>MapPolicy Builder</h4>
                    <button type="button" onClick={resetPolicyBuilder}>
                      Reset
                    </button>
                  </div>
                  <p className="sectionDescription">
                    Create level or region rules without writing JSON manually.
                  </p>

                  <div className="fieldRow">
                    <label htmlFor="policyBuilderTarget">rule target</label>
                    <select
                      id="policyBuilderTarget"
                      value={policyBuilderTarget}
                      onChange={(event) =>
                        setPolicyBuilderTarget(
                          event.target.value as PolicyBuilderTarget,
                        )
                      }
                    >
                      <option value="level">level</option>
                      <option value="region">region</option>
                    </select>
                  </div>

                  {policyBuilderTarget === "level" ? (
                    <div className="fieldRow">
                      <label htmlFor="policyBuilderLevel">select level</label>
                      <LevelSelect
                        id="policyBuilderLevel"
                        value={policyBuilderLevel}
                        onChange={setPolicyBuilderLevel}
                      />
                    </div>
                  ) : (
                    <>
                      <div className="fieldRow">
                        <label htmlFor="policyBuilderRegionLevel">
                          select level
                        </label>
                        <select
                          id="policyBuilderRegionLevel"
                          value={policyBuilderRegionLevel}
                          onChange={(event) =>
                            setPolicyBuilderRegionLevel(
                              event.target.value as ViewLevel,
                            )
                          }
                        >
                          {POLICY_REGION_LEVEL_OPTIONS.map((levelOption) => (
                            <option key={levelOption} value={levelOption}>
                              {levelOption}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="fieldRow">
                        <label htmlFor="policyBuilderRegionId">
                          select region
                        </label>
                        {policyBuilderRegionOptions.length === 0 ? (
                          <input
                            id="policyBuilderRegionId"
                            value="No regions available"
                            disabled
                          />
                        ) : (
                          <select
                            id="policyBuilderRegionId"
                            value={policyBuilderRegionSelectValue}
                            onChange={(event) =>
                              setPolicyBuilderRegionId(
                                event.target.value as RegionId,
                              )
                            }
                          >
                            {policyBuilderRegionOptions.map((region) => (
                              <option key={region.id} value={region.id}>
                                {region.name} ({region.id})
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </>
                  )}

                  <div className="fieldRow">
                    <label htmlFor="policyBuilderEnabledMode">enabled</label>
                    <select
                      id="policyBuilderEnabledMode"
                      value={policyBuilderEnabledMode}
                      onChange={(event) =>
                        setPolicyBuilderEnabledMode(
                          event.target.value as PolicyBuilderEnabledMode,
                        )
                      }
                    >
                      <option value="inherit">
                        inherit (remove enabled rule)
                      </option>
                      <option value="enabled">enabled</option>
                      <option value="disabled">disabled</option>
                    </select>
                  </div>

                  <CheckboxField
                    id="policyBuilderIncludeColors"
                    label="override colors"
                    checked={policyBuilderIncludeColors}
                    onChange={setPolicyBuilderIncludeColors}
                  />

                  {policyBuilderIncludeColors ? (
                    <>
                      <div className="fieldGrid policyColorGrid">
                        {POLICY_COLOR_KEYS.map((key) => (
                          <div className="fieldRow" key={key}>
                            <label htmlFor={`builderColor-${key}`}>{key}</label>
                            <div className="colorInputWithHex">
                              <input
                                id={`builderColor-${key}`}
                                className="compactColorInput"
                                type="color"
                                value={policyBuilderColors[key]}
                                onChange={(event) =>
                                  updatePolicyBuilderColor(
                                    key,
                                    event.target.value,
                                  )
                                }
                              />
                              <span className="colorHex">
                                {policyBuilderColors[key].toUpperCase()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : null}

                  <div className="policyBuilderActions">
                    <button type="button" onClick={applyPolicyBuilderRule}>
                      Apply rule
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMapPolicyInput("");
                        setPolicyBuilderFeedback("Cleared mapPolicy JSON.");
                      }}
                    >
                      Clear JSON
                    </button>
                  </div>

                  {policyBuilderFeedback ? (
                    <p className="policyBuilderFeedback">
                      {policyBuilderFeedback}
                    </p>
                  ) : null}
                </section>

                <div className="fieldRow">
                  <label htmlFor="ariaLabel">ariaLabel</label>
                  <input
                    id="ariaLabel"
                    value={ariaLabel}
                    onChange={(event) => setAriaLabel(event.target.value)}
                  />
                </div>
              </FieldSection>

              <FieldSection
                title="Preview Size"
                description="Keep preview compact with fit mode, or set a fixed SVG size."
              >
                <CheckboxField
                  id="fitParent"
                  label="fitParent"
                  checked={fitParent}
                  onChange={setFitParent}
                />

                {fitParent ? (
                  <>
                    <div className="fieldRow">
                      <label htmlFor="parentWidth">Parent width</label>
                      <input
                        id="parentWidth"
                        type="number"
                        min={MIN_MAP_DIMENSION}
                        value={parentWidth}
                        onChange={(event) =>
                          setParentWidth(
                            Number(event.target.value) || MIN_MAP_DIMENSION,
                          )
                        }
                      />
                    </div>
                    <div className="fieldRow">
                      <label htmlFor="parentHeight">Parent height</label>
                      <input
                        id="parentHeight"
                        type="number"
                        min={MIN_MAP_DIMENSION}
                        value={parentHeight}
                        onChange={(event) =>
                          setParentHeight(
                            Number(event.target.value) || MIN_MAP_DIMENSION,
                          )
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
                        min={MIN_MAP_DIMENSION}
                        value={mapWidth}
                        onChange={(event) =>
                          setMapWidth(
                            Number(event.target.value) || MIN_MAP_DIMENSION,
                          )
                        }
                      />
                    </div>
                    <div className="fieldRow">
                      <label htmlFor="mapHeight">height</label>
                      <input
                        id="mapHeight"
                        type="number"
                        min={MIN_MAP_DIMENSION}
                        value={mapHeight}
                        onChange={(event) =>
                          setMapHeight(
                            Number(event.target.value) || MIN_MAP_DIMENSION,
                          )
                        }
                      />
                    </div>
                  </>
                )}
              </FieldSection>

              <FieldSection
                title="Map Theme"
                description="Fine tune component colors for active, disabled, and selected states."
              >
                <div className="fieldGrid">
                  {THEME_COLOR_KEYS.map((key) => (
                    <div className="fieldRow" key={key}>
                      <label htmlFor={key}>{key}</label>
                      <div className="colorInputWithHex">
                        <input
                          id={key}
                          className="compactColorInput"
                          type="color"
                          value={theme[key]}
                          onChange={(event) =>
                            updateTheme(key, event.target.value)
                          }
                        />
                        <span className="colorHex">
                          {theme[key].toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="fieldRow">
                  <label htmlFor="strokeWidth">strokeWidth</label>
                  <input
                    id="strokeWidth"
                    type="number"
                    min={STROKE_WIDTH_MIN}
                    max={STROKE_WIDTH_MAX}
                    step={STROKE_WIDTH_STEP}
                    value={theme.strokeWidth}
                    onChange={(event) =>
                      updateTheme(
                        "strokeWidth",
                        Number(event.target.value) || STROKE_WIDTH_MIN,
                      )
                    }
                  />
                </div>
              </FieldSection>

              <FieldSection
                title="Selected Regions"
                description="Simulate controlled selection states with IDs from your data."
              >
                <CheckboxField
                  id="controlledSelectedIds"
                  label="Controlled prop enabled"
                  checked={controlledSelectedIds}
                  onChange={setControlledSelectedIds}
                />

                <div className="fieldRow">
                  <label htmlFor="selectedIdsInput">
                    Comma/newline separated IDs
                  </label>
                  <textarea
                    id="selectedIdsInput"
                    rows={3}
                    value={selectedIdsInput}
                    onChange={(event) =>
                      applySelectedIdsInput(event.target.value)
                    }
                  />
                </div>
              </FieldSection>

              <FieldSection
                title="Callback Hooks"
                description="Toggle callback handlers to quickly test integration behavior."
              >
                <CheckboxField
                  id="cbHover"
                  label="onRegionHover"
                  checked={enableHoverEvent}
                  onChange={setEnableHoverEvent}
                />
                <CheckboxField
                  id="cbClick"
                  label="onRegionClick"
                  checked={enableClickEvent}
                  onChange={setEnableClickEvent}
                />
                <CheckboxField
                  id="cbSelection"
                  label="onSelectionChange"
                  checked={enableSelectionEvent}
                  onChange={setEnableSelectionEvent}
                />
              </FieldSection>
            </div>
          </aside>

          <section className="workspace">
            <MetaPanel
              hoverLabel={hoverLabel}
              hoverId={hoverId}
              lastClicked={lastClicked}
              selectedCount={selectedIds.length}
              lastSelectionPayload={lastSelectionPayload}
            />

            <section className="workspaceTop">
              <section className="mapShell" style={mapStyle}>
                {!shouldRenderMap ? (
                  <p>
                    {missingRequiredStartRegionId
                      ? "`startRegion` is required when `startLevel` is not `country`."
                      : mapPolicyParseError}
                  </p>
                ) : (
                  <NepalMap
                    fitParent={fitParent}
                    width={fitParent ? undefined : mapWidth}
                    height={fitParent ? undefined : mapHeight}
                    startLevel={startLevel}
                    endLevel={endLevel}
                    skipLevels={skipLevels}
                    showFirstLayerDivisions={showFirstLayerDivisions}
                    openEndLevel={openEndLevel}
                    showPartitionLabels={showPartitionLabels}
                    partitionLabelFontSize={partitionLabelFontSize}
                    selectableProtectedAreas={selectableProtectedAreas}
                    startRegion={selectedStartRegion ?? undefined}
                    selectable={selectable}
                    selectionMode={selectionMode}
                    mapPolicy={parsedMapPolicy}
                    selectedIds={
                      shouldControlSelectedIds ? selectedIds : undefined
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

              <GeneratedCodePanel
                generatedCode={generatedComponentCode}
                feedback={codeFeedback}
                onCopy={handleCopyGeneratedCode}
                onDownload={handleDownloadGeneratedCode}
              />
            </section>

            <EventLogPanel
              events={events}
              onClear={() => {
                setEvents([]);
                setLastSelectionPayload("-");
              }}
            />
          </section>
        </section>
      )}

      {mapPolicyHelpPopover}
    </main>
  );
}

export default App;
