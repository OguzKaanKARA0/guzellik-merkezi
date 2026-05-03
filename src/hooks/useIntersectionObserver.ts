import { useEffect, useState, useRef } from "react";

interface ObserverOptions {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
}

export function useIntersectionObserver(options: ObserverOptions = { threshold: 0.1, rootMargin: "50px" }) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // 1. Fail-safe: 2 saniye sonra hala görünmezse zorla göster (Kullanıcı boş ekran görmesin)
    const failSafeTimeout = setTimeout(() => {
      setIsIntersecting(true);
    }, 2000);

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsIntersecting(true);
        clearTimeout(failSafeTimeout);
        observer.unobserve(element);
      }
    }, {
      ...options,
      threshold: options.threshold ?? 0.1,
      rootMargin: options.rootMargin ?? "50px",
    });

    observer.observe(element);

    return () => {
      clearTimeout(failSafeTimeout);
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.threshold, options.rootMargin]); // Only re-run if options change meaningfully

  return { ref, isIntersecting };
}
