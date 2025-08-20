import { useEffect, useLayoutEffect, useState, useCallback } from 'react';

export interface FloatingOptions {
  offset?: number;
  minWidth?: number;
  preferredPlacement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
  width?: number;
}

export function useAnchoredPosition(anchorEl: HTMLElement | null, options: FloatingOptions = {}) {
  const { offset = 8, preferredPlacement = 'bottom-start', width } = options;
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  const recompute = useCallback(() => {
    if (!anchorEl) { setPosition(null); return; }
    const rect = anchorEl.getBoundingClientRect();
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const scrollX = window.scrollX || document.documentElement.scrollLeft;
    let top: number;
    let left: number;
    const viewportWidth = window.innerWidth;
    const estimatedWidth = width || 480;
    const estHeight = 300;

    const placeBottom = preferredPlacement.startsWith('bottom');
    const alignEnd = preferredPlacement.endsWith('end');

    top = placeBottom ? rect.bottom + scrollY + offset : rect.top + scrollY - estHeight - offset;
    left = alignEnd ? rect.right + scrollX - estimatedWidth : rect.left + scrollX;

    if (left + estimatedWidth > viewportWidth + scrollX - 8) {
      left = Math.max(8 + scrollX, viewportWidth + scrollX - estimatedWidth - 8);
    }
    if (left < 8 + scrollX) left = 8 + scrollX;

    const viewportBottom = scrollY + window.innerHeight;
    if (placeBottom && top + estHeight > viewportBottom - 8) {
      const topAlt = rect.top + scrollY - estHeight - offset;
      if (topAlt > scrollY) top = topAlt;
    }
    if (!placeBottom && top < scrollY + 8) {
      const downAlt = rect.bottom + scrollY + offset;
      if (downAlt + estHeight < viewportBottom) top = downAlt;
    }
    setPosition({ top, left });
  }, [anchorEl, offset, preferredPlacement, width]);

  useLayoutEffect(() => { recompute(); }, [anchorEl, recompute]);

  useEffect(() => {
    if (!anchorEl) return;
    const handler = () => recompute();
    window.addEventListener('scroll', handler, true);
    window.addEventListener('resize', handler);
    return () => {
      window.removeEventListener('scroll', handler, true);
      window.removeEventListener('resize', handler);
    };
  }, [anchorEl, recompute]);

  return { position, recompute };
}
