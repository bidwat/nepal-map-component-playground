import type { NepalMapPolicy, RegionId } from "nepal-map-component";

import type { PolicyBuilderEnabledMode } from "./types";

export function parseSelectedIds(value: string): RegionId[] {
  return value
    .split(/[\n,]/g)
    .map((item) => item.trim())
    .filter(Boolean) as RegionId[];
}

export function nowLabel(): string {
  return new Date().toLocaleTimeString();
}

export function resolveBuilderEnabled(
  mode: PolicyBuilderEnabledMode,
): boolean | undefined {
  if (mode === "enabled") return true;
  if (mode === "disabled") return false;
  return undefined;
}

export function parseMapPolicySafe(value: string): NepalMapPolicy {
  if (!value.trim()) return {};

  try {
    const parsed = JSON.parse(value) as NepalMapPolicy;
    if (parsed && typeof parsed === "object") {
      return parsed;
    }
  } catch {
    return {};
  }

  return {};
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }

  if (typeof document === "undefined") {
    return false;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  return copied;
}
