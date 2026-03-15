import type {
  NepalMapPolicy,
  NepalMapTheme,
  RegionId,
  RegionReference,
  SelectionMode,
  ViewLevel,
} from "nepal-map-component";

export interface GettingStartedExampleConfig {
  width: number;
  height: number;
  startLevel: ViewLevel;
  endLevel: ViewLevel;
  skipLevels?: ViewLevel[];
  showFirstLayerDivisions?: boolean;
  openEndLevel?: boolean;
  showPartitionLabels?: boolean;
  partitionLabelFontSize?: number;
  selectableProtectedAreas?: boolean;
  startRegion?: RegionReference | null;
  selectable?: boolean;
  selectionMode?: SelectionMode;
  mapPolicy?: NepalMapPolicy;
  selectedIds?: RegionId[];
  theme?: NepalMapTheme;
  ariaLabel: string;
}

export interface GettingStartedExample {
  id: string;
  title: string;
  description: string;
  config: GettingStartedExampleConfig;
  code: string;
}
