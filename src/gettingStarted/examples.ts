import {
  VIEW_LEVEL,
  type MapPolicyRegionConfig,
  type NepalMapPolicy,
  type NepalMapTheme,
  type RegionId,
  type RegionReference,
  type SelectionMode,
  type ViewLevel,
} from "nepal-map-component";

import {
  DEFAULT_MAP_THEME,
  REGION_CATALOG,
  buildGeneratedComponentCode,
} from "../playground";
import type {
  GettingStartedExample,
  GettingStartedExampleConfig,
} from "./types";

function normalizeText(value: string): string {
  return value.toLowerCase().trim();
}

function findRegionByName(
  level: ViewLevel,
  searchText: string,
): RegionReference | null {
  const normalizedSearchText = normalizeText(searchText);
  const exactMatch = REGION_CATALOG.byLevel[level].find(
    (region) => normalizeText(region.name) === normalizedSearchText,
  );
  if (exactMatch) return exactMatch;

  const partialMatch = REGION_CATALOG.byLevel[level].find((region) =>
    normalizeText(region.name).includes(normalizedSearchText),
  );

  return partialMatch ?? null;
}

function getRegionSlug(region: RegionReference | null): string | null {
  if (!region) return null;
  const [, slug] = region.id.split(":");
  return slug ?? null;
}

function toRegionPolicyRecord(
  entries: Array<[RegionId, MapPolicyRegionConfig]>,
): Record<RegionId, MapPolicyRegionConfig> {
  const record = {} as Record<RegionId, MapPolicyRegionConfig>;
  for (const [regionId, config] of entries) {
    record[regionId] = config;
  }
  return record;
}

function createRegionPolicy(
  entries: Array<[RegionId, MapPolicyRegionConfig]>,
): NepalMapPolicy {
  return {
    regions: toRegionPolicyRecord(entries),
  };
}

function mergePolicies(
  ...policies: Array<NepalMapPolicy | undefined>
): NepalMapPolicy | undefined {
  const merged: NepalMapPolicy = {};

  for (const policy of policies) {
    if (!policy) continue;

    if (policy.levels) {
      merged.levels = {
        ...(merged.levels ?? {}),
        ...policy.levels,
      };
    }

    if (policy.regions) {
      merged.regions = {
        ...(merged.regions ?? {}),
        ...policy.regions,
      };
    }
  }

  if (!merged.levels && !merged.regions) {
    return undefined;
  }

  return merged;
}

function toSelectionMode(
  selectionMode: SelectionMode | undefined,
): SelectionMode {
  return selectionMode ?? "single";
}

function buildExampleCode(config: GettingStartedExampleConfig): string {
  const selectionMode = toSelectionMode(config.selectionMode);
  const selectedIds = config.selectedIds ?? [];
  const controlledSelectedIds = selectedIds.length > 0;

  return buildGeneratedComponentCode({
    fitParent: false,
    width: config.width,
    height: config.height,
    startLevel: config.startLevel,
    endLevel: config.endLevel,
    skipLevels: config.skipLevels ?? [],
    showFirstLayerDivisions: config.showFirstLayerDivisions ?? false,
    openEndLevel: config.openEndLevel ?? false,
    showPartitionLabels: config.showPartitionLabels ?? false,
    partitionLabelFontSize: config.partitionLabelFontSize ?? 10,
    selectableProtectedAreas: config.selectableProtectedAreas ?? false,
    startRegion: config.startRegion ?? null,
    selectable: config.selectable ?? true,
    selectionMode,
    mapPolicy: config.mapPolicy,
    mapPolicyHasError: false,
    controlledSelectedIds,
    selectedIds,
    ariaLabel: config.ariaLabel,
    theme: config.theme ?? DEFAULT_MAP_THEME,
    enableHoverEvent: false,
    enableClickEvent: false,
    enableSelectionEvent: false,
  });
}

const provinces = REGION_CATALOG.byLevel[VIEW_LEVEL.PROVINCE];
const districts = REGION_CATALOG.byLevel[VIEW_LEVEL.DISTRICT];
const wards = REGION_CATALOG.byLevel[VIEW_LEVEL.WARD];

const bagmatiProvince =
  findRegionByName(VIEW_LEVEL.PROVINCE, "Bagmati") ?? provinces[0] ?? null;
const koshiProvince =
  findRegionByName(VIEW_LEVEL.PROVINCE, "Koshi") ?? provinces[0] ?? null;
const karnaliProvince =
  findRegionByName(VIEW_LEVEL.PROVINCE, "Karnali") ?? provinces[0] ?? null;

const bagmatiSlug = getRegionSlug(bagmatiProvince);

const districtIdsToDisable = districts
  .slice(0, 3)
  .map((district) => district.id as RegionId);

const provincePalette = [
  "#d9e8ff",
  "#ffe2d1",
  "#f8ddff",
  "#d6f5ff",
  "#ffeec1",
  "#d9f3de",
  "#f7dfe4",
];

const provinceColorPolicy = createRegionPolicy(
  provinces.map((province, index) => [
    province.id as RegionId,
    {
      colors: {
        primary: provincePalette[index % provincePalette.length],
        hover: "#8fc0ff",
        selected: "#4d80ff",
      },
    },
  ]),
);

const disabledDistrictPolicy = createRegionPolicy(
  districtIdsToDisable.map((districtId) => [districtId, { enabled: false }]),
);

const protectedAreaWardIds = wards
  .filter((ward) => ward.id.startsWith("ward:special:"))
  .map((ward) => ward.id as RegionId);

const bagmatiProtectedAreaWardIds = bagmatiSlug
  ? protectedAreaWardIds.filter((wardId) =>
      wardId.includes(`:${bagmatiSlug.toLowerCase()}:`),
    )
  : [];

const highlightedProtectedAreaWardIds = (
  bagmatiProtectedAreaWardIds.length > 0
    ? bagmatiProtectedAreaWardIds
    : protectedAreaWardIds
).slice(0, 16);

const protectedAreaGreenPolicy = createRegionPolicy(
  highlightedProtectedAreaWardIds.map((wardId) => [
    wardId,
    {
      colors: {
        primary: "#b7efc8",
        hover: "#7ed89d",
        selected: "#2d9b5f",
      },
    },
  ]),
);

const disabledProvinceIds = [
  findRegionByName(VIEW_LEVEL.PROVINCE, "Karnali")?.id,
  findRegionByName(VIEW_LEVEL.PROVINCE, "Sudurpashchim")?.id,
]
  .filter(Boolean)
  .map((regionId) => regionId as RegionId);

const disabledProvincePolicy = createRegionPolicy(
  disabledProvinceIds.map((provinceId) => [provinceId, { enabled: false }]),
);

const randomThemeVariation: NepalMapTheme = {
  primary: "#f5def9",
  disabled: "#c6d3df",
  hover: "#ffb578",
  selected: "#ff7aa2",
  background: "#fff8f0",
  stroke: "#42526b",
  strokeWidth: 0.6,
};

const multilevelColorPolicy: NepalMapPolicy = {
  levels: {
    district: {
      colors: {
        primary: "#ffe2a6",
        hover: "#ffc970",
        selected: "#ff9f45",
      },
    },
    local_unit: {
      colors: {
        primary: "#d8f2c8",
        hover: "#b8e396",
        selected: "#79c266",
      },
    },
    ward: {
      colors: {
        primary: "#d5e8ff",
        hover: "#9ec7ff",
        selected: "#5b93eb",
      },
    },
  },
};

const rawExamples: Array<Omit<GettingStartedExample, "code">> = [
  {
    id: "colored-provinces-disabled-districts",
    title: "1. Colored Provinces with Some Disabled Districts",
    description:
      "This example starts at country level, uses different province colors, and disables a few districts to demonstrate policy-based restrictions.",
    config: {
      width: 430,
      height: 280,
      startLevel: VIEW_LEVEL.COUNTRY,
      endLevel: VIEW_LEVEL.DISTRICT,
      showFirstLayerDivisions: true,
      selectionMode: "single",
      mapPolicy: mergePolicies(provinceColorPolicy, disabledDistrictPolicy),
      ariaLabel: "Colored provinces with some disabled districts",
    },
  },
  {
    id: "district-to-ward-selectable-labels",
    title: "2. Karnali to Wards with Multi-Select and Smaller Labels",
    description:
      "This example starts at Karnali province, drills to wards, enables multi-select, and uses smaller labels for denser views.",
    config: {
      width: 430,
      height: 280,
      startLevel: VIEW_LEVEL.PROVINCE,
      startRegion: karnaliProvince,
      endLevel: VIEW_LEVEL.WARD,
      selectionMode: "multi",
      showFirstLayerDivisions: true,
      showPartitionLabels: true,
      partitionLabelFontSize: 8,
      ariaLabel: "Karnali map with smaller ward labels and multi-select",
    },
  },
  {
    id: "country-multi-select-provinces",
    title: "3. Country with Multi-Select Provinces",
    description:
      "This example limits interaction to provinces and demonstrates live multi-selection from country view.",
    config: {
      width: 430,
      height: 280,
      startLevel: VIEW_LEVEL.COUNTRY,
      endLevel: VIEW_LEVEL.PROVINCE,
      selectionMode: "multi",
      showFirstLayerDivisions: true,
      ariaLabel: "Country map with multi-select provinces",
    },
  },
  {
    id: "country-with-disabled-provinces-no-partitions",
    title: "4. Country Without Partitions and Disabled Provinces",
    description:
      "This example hides extra partition lines and disables a couple of provinces to show non-interactive areas clearly.",
    config: {
      width: 430,
      height: 280,
      startLevel: VIEW_LEVEL.COUNTRY,
      endLevel: VIEW_LEVEL.PROVINCE,
      showFirstLayerDivisions: false,
      mapPolicy: disabledProvincePolicy,
      ariaLabel: "Country map without partitions and disabled provinces",
    },
  },
  {
    id: "theme-variation",
    title: "5. Theme Variation Example",
    description:
      "This example applies a playful theme variation and different colors by level to show how visual customization can be layered.",
    config: {
      width: 430,
      height: 280,
      startLevel: VIEW_LEVEL.COUNTRY,
      endLevel: VIEW_LEVEL.DISTRICT,
      showFirstLayerDivisions: true,
      theme: randomThemeVariation,
      mapPolicy: multilevelColorPolicy,
      ariaLabel: "Theme variation example",
    },
  },
  {
    id: "koshi-to-district-unselectable-open-end",
    title: "6. Start at Koshi, End at District, Unselectable, Open End",
    description:
      "This example starts from Koshi province, stops at district level, keeps the map unselectable, and enables open-end-level behavior.",
    config: {
      width: 430,
      height: 280,
      startLevel: VIEW_LEVEL.PROVINCE,
      startRegion: koshiProvince,
      endLevel: VIEW_LEVEL.DISTRICT,
      selectable: false,
      selectionMode: "none",
      openEndLevel: true,
      showFirstLayerDivisions: true,
      ariaLabel: "Koshi to district unselectable open-end example",
    },
  },
  {
    id: "bagmati-protected-areas-selectable",
    title: "7. Bagmati Protected Areas with Multi-Select",
    description:
      "This replacement example starts inside Bagmati, keeps protected areas selectable, and applies a dedicated protected-area policy.",
    config: {
      width: 430,
      height: 280,
      startLevel: VIEW_LEVEL.PROVINCE,
      startRegion: bagmatiProvince,
      endLevel: VIEW_LEVEL.WARD,
      selectableProtectedAreas: true,
      selectionMode: "multi",
      showFirstLayerDivisions: true,
      mapPolicy: protectedAreaGreenPolicy,
      ariaLabel: "Bagmati protected-area multi-select example",
    },
  },
];

export const GETTING_STARTED_EXAMPLES: GettingStartedExample[] =
  rawExamples.map((example) => ({
    ...example,
    code: buildExampleCode(example.config),
  }));
