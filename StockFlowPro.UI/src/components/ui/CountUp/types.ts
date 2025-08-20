export interface CountUpProps {
  end: number;
  start?: number;
  duration?: number; // ms
  decimals?: number;
  suffix?: string;
  prefix?: string;
  easing?: (t: number) => number; // t in [0,1]
  className?: string;
  onEnd?: () => void;
  trigger?: unknown; // value that when changed restarts animation
  inViewOnly?: boolean; // start only when in viewport
}
