import type { RefObject } from "react";
import type { ViewLevel } from "nepal-map-component";

interface SkipLevelsSelectProps {
  id: string;
  label: string;
  options: ViewLevel[];
  skipLevels: ViewLevel[];
  isOpen: boolean;
  containerRef: RefObject<HTMLDivElement>;
  onToggleOpen: () => void;
  onToggleLevel: (level: ViewLevel) => void;
  onRemoveLevel: (level: ViewLevel) => void;
}

export function SkipLevelsSelect({
  id,
  label,
  options,
  skipLevels,
  isOpen,
  containerRef,
  onToggleOpen,
  onToggleLevel,
  onRemoveLevel,
}: SkipLevelsSelectProps) {
  return (
    <div className="fieldRow">
      <label htmlFor={id}>{label}</label>
      <div className="multiSelect" ref={containerRef}>
        <button
          id={id}
          type="button"
          className="multiSelectTrigger"
          aria-expanded={isOpen}
          onClick={onToggleOpen}
        >
          {skipLevels.length === 0
            ? "Select levels to skip"
            : `${skipLevels.length} selected`}
        </button>

        {isOpen ? (
          <div className="multiSelectMenu" role="listbox">
            {options.map((levelOption) => (
              <label className="multiSelectOption" key={levelOption}>
                <input
                  type="checkbox"
                  checked={skipLevels.includes(levelOption)}
                  onChange={() => onToggleLevel(levelOption)}
                />
                <span>{levelOption}</span>
              </label>
            ))}
          </div>
        ) : null}
      </div>

      {skipLevels.length > 0 ? (
        <div className="chipList">
          {skipLevels.map((levelOption) => (
            <button
              type="button"
              className="chip"
              key={levelOption}
              onClick={() => onRemoveLevel(levelOption)}
            >
              {levelOption} x
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
