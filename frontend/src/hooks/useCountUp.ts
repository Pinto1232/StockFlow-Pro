import { useState, useEffect, useRef, useCallback } from 'react';

interface UseCountUpOptions {
  start?: number;
  end: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  separator?: string;
  preserveValue?: boolean;
}

export const useCountUp = ({
  start = 0,
  end,
  duration = 2000,
  decimals = 0,
  prefix = '',
  suffix = '',
  separator = ',',
  preserveValue = false,
}: UseCountUpOptions) => {
  const [count, setCount] = useState(preserveValue ? end : start);
  const [isAnimating, setIsAnimating] = useState(false);
  const frameRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number | undefined>(undefined);

  const formatNumber = useCallback((num: number): string => {
    const fixed = num.toFixed(decimals);
    const parts = fixed.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    return prefix + parts.join('.') + suffix;
  }, [decimals, prefix, suffix, separator]);

  const animate = useCallback((timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }

    const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);
    
    // Use easeOutQuart easing function for smooth animation
    const easeOutQuart = 1 - Math.pow(1 - progress, 4);
    const currentValue = start + (end - start) * easeOutQuart;
    
    setCount(currentValue);

    if (progress < 1) {
      frameRef.current = requestAnimationFrame(animate);
    } else {
      setIsAnimating(false);
      setCount(end);
    }
  }, [duration, start, end]);

  const startAnimation = useCallback(() => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    startTimeRef.current = undefined;
    frameRef.current = requestAnimationFrame(animate);
  }, [isAnimating, animate]);

  const reset = useCallback(() => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
    setIsAnimating(false);
    setCount(start);
    startTimeRef.current = undefined;
  }, [start]);

  useEffect(() => {
    if (end !== count || (!preserveValue && !isAnimating)) {
      startAnimation();
    }

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [end, count, preserveValue, isAnimating, startAnimation]);

  useEffect(() => {
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return {
    value: formatNumber(count),
    rawValue: count,
    isAnimating,
    startAnimation,
    reset,
  };
};

export default useCountUp;