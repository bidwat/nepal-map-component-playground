import type { GeneratedCodeOptions } from "./types";

export function buildGeneratedComponentCode(
  options: GeneratedCodeOptions,
): string {
  const shouldIncludeSelectedIds =
    options.controlledSelectedIds &&
    (options.selectionMode === "single" || options.selectionMode === "multi");

  const imports = [
    `import { NepalMap${shouldIncludeSelectedIds ? ", type RegionId" : ""} } from "nepal-map-component";`,
  ];

  const declarations: string[] = [
    `const theme = ${JSON.stringify(options.theme, null, 2)};`,
  ];

  if (options.skipLevels.length > 0) {
    declarations.push(
      `const skipLevels = ${JSON.stringify(options.skipLevels, null, 2)};`,
    );
  }

  if (options.startRegion) {
    declarations.push(
      `const startRegion = ${JSON.stringify(options.startRegion, null, 2)};`,
    );
  }

  if (options.mapPolicy) {
    declarations.push(
      `const mapPolicy = ${JSON.stringify(options.mapPolicy, null, 2)};`,
    );
  } else if (options.mapPolicyHasError) {
    declarations.push(
      "// mapPolicy is omitted because the JSON in the playground is invalid.",
    );
  }

  if (shouldIncludeSelectedIds) {
    declarations.push(
      `const selectedIds: RegionId[] = ${JSON.stringify(options.selectedIds, null, 2)};`,
    );
  }

  const propLines = [
    `fitParent={${options.fitParent}}`,
    `startLevel="${options.startLevel}"`,
    `endLevel="${options.endLevel}"`,
    `showFirstLayerDivisions={${options.showFirstLayerDivisions}}`,
    `openEndLevel={${options.openEndLevel}}`,
    `showPartitionLabels={${options.showPartitionLabels}}`,
    `partitionLabelFontSize={${options.partitionLabelFontSize}}`,
    `selectableProtectedAreas={${options.selectableProtectedAreas}}`,
    `selectable={${options.selectable}}`,
    `selectionMode="${options.selectionMode}"`,
    `ariaLabel=${JSON.stringify(options.ariaLabel)}`,
    `theme={theme}`,
  ];

  if (!options.fitParent) {
    propLines.splice(
      1,
      0,
      `width={${options.width}}`,
      `height={${options.height}}`,
    );
  }

  if (options.skipLevels.length > 0) {
    propLines.push("skipLevels={skipLevels}");
  }

  if (options.startRegion) {
    propLines.push("startRegion={startRegion}");
  }

  if (options.mapPolicy) {
    propLines.push("mapPolicy={mapPolicy}");
  }

  if (shouldIncludeSelectedIds) {
    propLines.push("selectedIds={selectedIds}");
  }

  if (options.enableSelectionEvent) {
    propLines.push(
      'onSelectionChange={(nextIds) => console.log("selection", nextIds)}',
    );
  }

  if (options.enableHoverEvent) {
    propLines.push(
      'onRegionHover={(feature) => console.log("hover", feature?.properties.__id)}',
    );
  }

  if (options.enableClickEvent) {
    propLines.push(
      'onRegionClick={(feature) => console.log("click", feature.properties.__id)}',
    );
  }

  const declarationBlock =
    declarations.length > 0 ? `${declarations.join("\n\n")}\n\n` : "";

  return `${imports.join("\n")}\n\n${declarationBlock}export default function ConfiguredNepalMap() {\n  return (\n    <NepalMap\n${propLines
    .map((line) => `      ${line}`)
    .join("\n")}\n    />\n  );\n}\n`;
}
