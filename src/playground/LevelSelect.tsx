import type { ViewLevel } from "nepal-map-component";

import { LEVEL_OPTIONS } from "./constants";

interface LevelSelectProps {
  id: string;
  value: ViewLevel;
  onChange: (level: ViewLevel) => void;
}

export function LevelSelect({ id, value, onChange }: LevelSelectProps) {
  return (
    <select
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value as ViewLevel)}
    >
      {LEVEL_OPTIONS.map((levelOption) => (
        <option key={levelOption} value={levelOption}>
          {levelOption}
        </option>
      ))}
    </select>
  );
}
