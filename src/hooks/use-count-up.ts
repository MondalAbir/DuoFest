import { useEffect, useState } from "react";

interface UseCountUpOptions {
  duration?: number;
  delay?: number;
}

export function useCountUp(target: number, options: UseCountUpOptions = {}) {
  const { duration = 1400, delay = 0 } = options;
  const [value, setValue] = useState(0);

  useEffect(() => {
    let raf: number;
    let timeout: ReturnType<typeof setTimeout>;

    const start = () => {
      const startTime = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(target * eased);
        if (progress < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    timeout = setTimeout(start, delay);
    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(raf);
    };
  }, [target, duration, delay]);

  return value;
}
