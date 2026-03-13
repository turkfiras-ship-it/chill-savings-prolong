import { useState, useEffect, useRef } from 'react';

interface UseCountUpOptions {
  end: number;
  duration?: number;
  decimals?: number;
  delay?: number;
}

export function useCountUp({ end, duration = 1500, decimals = 0, delay = 0 }: UseCountUpOptions) {
  const [value, setValue] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const animate = (timestamp: number) => {
        if (!startTimeRef.current) startTimeRef.current = timestamp;
        const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);
        // easeOutExpo for a satisfying deceleration
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        setValue(Number((eased * end).toFixed(decimals)));
        if (progress < 1) rafRef.current = requestAnimationFrame(animate);
      };
      rafRef.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(rafRef.current);
    };
  }, [end, duration, decimals, delay]);

  return value;
}
