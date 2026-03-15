import {
  getRegionCatalog,
  VIEW_LEVEL,
  VIEW_LEVELS,
  type NepalMapTheme,
  type ViewLevel,
} from "nepal-map-component";

export const LEVEL_OPTIONS: ViewLevel[] = [...VIEW_LEVELS];
export const SKIP_LEVEL_OPTIONS: ViewLevel[] = [...VIEW_LEVELS];

export const POLICY_REGION_LEVEL_OPTIONS: ViewLevel[] = [
  VIEW_LEVEL.PROVINCE,
  VIEW_LEVEL.DISTRICT,
  VIEW_LEVEL.LOCAL_UNIT,
];

export const DEFAULT_MAP_THEME: NepalMapTheme = {
  primary: "#dde3ef",
  disabled: "#bfc6d3",
  hover: "#9fc0ff",
  selected: "#4d80ff",
  background: "#f7f8fb",
  stroke: "#42526b",
  strokeWidth: 0.55,
};

export const REGION_CATALOG = getRegionCatalog();

export const GENERATED_CODE_FILENAME = "ConfiguredNepalMap.tsx";
export const MOBILE_VIEWPORT_MAX_WIDTH = 760;
export const MAX_EVENT_LOG_ITEMS = 120;

export const DEFAULT_ARIA_LABEL = "Nepal administrative map";

export const DEFAULT_PLAYGROUND_SIZE: Readonly<{
  width: number;
  height: number;
}> = {
  width: 580,
  height: 380,
};

export const MIN_MAP_DIMENSION = 240;
export const STROKE_WIDTH_MIN = 0.1;
export const STROKE_WIDTH_MAX = 4;
export const STROKE_WIDTH_STEP = 0.05;

export const PARTITION_LABEL_FONT_MIN = 6;
export const PARTITION_LABEL_FONT_MAX = 32;

export const THEME_COLOR_KEYS = [
  "primary",
  "disabled",
  "hover",
  "selected",
  "background",
  "stroke",
] as const;

export const POLICY_COLOR_KEYS = [
  "primary",
  "disabled",
  "hover",
  "selected",
] as const;

export const MAP_POLICY_HELP_TEXT =
  "MapPolicy lets you customize how the map behaves. You can disable whole levels, disable specific regions, or override map colors. Level rules apply broadly, and region rules can override level behavior for selected IDs.";
