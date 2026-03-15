export type UiMode = "light" | "dark";

export function InfoIcon() {
  return (
    <svg
      className="infoButtonIcon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      role="img"
    >
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" />
      <circle cx="12" cy="7.8" r="1.25" fill="currentColor" />
      <path
        d="M12 10.8v6.2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface ThemeModeIconProps {
  mode: UiMode;
}

export function ThemeModeIcon({ mode }: ThemeModeIconProps) {
  if (mode === "dark") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" role="img">
        <path
          d="M12 3.75a8.25 8.25 0 1 0 8.25 8.25 7.45 7.45 0 0 1-8.25-8.25z"
          fill="currentColor"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" role="img">
      <circle cx="12" cy="12" r="4" fill="currentColor" />
      <path
        d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3M4.57 4.57l2.12 2.12M17.31 17.31l2.12 2.12M19.43 4.57l-2.12 2.12M6.69 17.31l-2.12 2.12"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}
