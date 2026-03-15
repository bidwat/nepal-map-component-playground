import type {
  NepalMapPolicy,
  NepalMapTheme,
  RegionId,
  RegionReference,
  SelectionMode,
  ViewLevel,
} from "nepal-map-component";

export interface EventItem {
  id: number;
  type: "hover" | "click" | "selection";
  text: string;
}

export type PolicyBuilderTarget = "level" | "region";
export type PolicyBuilderEnabledMode = "inherit" | "enabled" | "disabled";
export type PolicyBuilderColorKey =
  | "primary"
  | "disabled"
  | "hover"
  | "selected";
export type PolicyBuilderColors = Pick<NepalMapTheme, PolicyBuilderColorKey>;

export interface GeneratedCodeOptions {
  fitParent: boolean;
  width: number;
  height: number;
  startLevel: ViewLevel;
  endLevel: ViewLevel;
  skipLevels: ViewLevel[];
  showFirstLayerDivisions: boolean;
  openEndLevel: boolean;
  showPartitionLabels: boolean;
  partitionLabelFontSize: number;
  selectableProtectedAreas: boolean;
  startRegion: RegionReference | null;
  selectable: boolean;
  selectionMode: SelectionMode;
  mapPolicy?: NepalMapPolicy;
  mapPolicyHasError: boolean;
  controlledSelectedIds: boolean;
  selectedIds: RegionId[];
  ariaLabel: string;
  theme: NepalMapTheme;
  enableHoverEvent: boolean;
  enableClickEvent: boolean;
  enableSelectionEvent: boolean;
}
