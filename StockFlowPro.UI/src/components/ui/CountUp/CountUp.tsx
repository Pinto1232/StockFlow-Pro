import React, { useEffect, useRef, useState } from 'react';
import type { CountUpProps } from './types';
import styles from './styles.module.css';

const defaultEasing = (t: number) => 1 - Math.pow(1 - t, 3); // easeOutCubic

export const CountUp: React.FC<CountUpProps> = ({
  end,
  start = 0,
  duration = 1400,
  decimals = 0,
  suffix = '',
  prefix = '',
  easing = defaultEasing,
  className = '',
  onEnd,
  trigger,
  inViewOnly = true,
}) => {
  const [display, setDisplay] = useState(start);
  const frameRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLSpanElement | null>(null);
  const hasStartedRef = useRef(false);

  const beginAnimation = () => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    startTimeRef.current = null;
    if (frameRef.current) cancelAnimationFrame(frameRef.current);

    const step = (ts: number) => {
      if (startTimeRef.current == null) startTimeRef.current = ts;
      const elapsed = ts - startTimeRef.current;
      const progress = Math.min(1, elapsed / duration);
      const eased = easing(progress);
      const value = start + (end - start) * eased;
      setDisplay(value);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      } else {
        onEnd?.();
      }
    };
    frameRef.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    hasStartedRef.current = false;
    setDisplay(start);
    if (!inViewOnly) {
      beginAnimation();
      return;
    }

    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) beginAnimation();
        });
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [end, trigger, inViewOnly]);

  useEffect(() => () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); }, []);

  return (
    <span
      ref={containerRef}
      className={`${styles.root} ${className}`.trim()}
      data-testid="count-up"
    >
      {prefix}
      {display.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
};
