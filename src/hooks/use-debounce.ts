"use client";

import { useEffect, useState } from "react";

/**
 * Debounce a value by the specified delay (ms).
 * Useful for debouncing search inputs without useEffect for data fetching.
 */
export function useDebounce<T>(value: T, delay = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
