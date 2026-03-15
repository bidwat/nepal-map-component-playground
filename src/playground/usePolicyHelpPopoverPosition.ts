import { useEffect, useState, type CSSProperties, type RefObject } from "react";

import { MOBILE_VIEWPORT_MAX_WIDTH } from "./constants";

interface UsePolicyHelpPopoverPositionOptions {
  show: boolean;
  isMobileViewport: boolean;
  anchorRef: RefObject<HTMLButtonElement>;
}

export function usePolicyHelpPopoverPosition({
  show,
  isMobileViewport,
  anchorRef,
}: UsePolicyHelpPopoverPositionOptions): CSSProperties {
  const [style, setStyle] = useState<CSSProperties>({});

  useEffect(() => {
    if (!show || typeof window === "undefined" || !anchorRef.current) {
      return;
    }

    const updatePosition = () => {
      const anchorRect = anchorRef.current?.getBoundingClientRect();
      if (!anchorRect) return;

      const viewportPadding = 8;
      const popoverWidth = Math.min(
        320,
        window.innerWidth - viewportPadding * 2,
      );
      const popoverHeightEstimate = 160;
      const gutter = 8;

      const isNarrowViewport =
        isMobileViewport && window.innerWidth <= MOBILE_VIEWPORT_MAX_WIDTH;

      let left = isNarrowViewport ? anchorRect.left : anchorRect.right + gutter;

      if (left + popoverWidth > window.innerWidth - viewportPadding) {
        left = Math.max(
          viewportPadding,
          anchorRect.left - popoverWidth - gutter,
        );
      }

      left = Math.max(
        viewportPadding,
        Math.min(left, window.innerWidth - popoverWidth - viewportPadding),
      );

      const maxTop = Math.max(
        gutter,
        window.innerHeight - popoverHeightEstimate - gutter,
      );

      const preferredTop = isNarrowViewport
        ? anchorRect.bottom + gutter
        : anchorRect.top;

      const top = Math.min(maxTop, Math.max(gutter, preferredTop));

      setStyle({
        position: "fixed",
        left: `${left}px`,
        top: `${top}px`,
        width: `${popoverWidth}px`,
        maxWidth: `calc(100vw - ${viewportPadding * 2}px)`,
        pointerEvents: "auto",
        zIndex: 2147483647,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [show, isMobileViewport, anchorRef]);

  return style;
}
