import { useCallback, useRef } from "react";

/**
 * A custom hook that creates a debounced version of a callback function.
 *
 * Unlike typical debounce implementations that delay ALL calls,
 * this implementation:
 * 1. Executes the callback immediately on first call
 * 2. Ignores subsequent calls within the delay window
 * 3. Resets the window after the delay expires
 *
 * This is ideal for autosave scenarios where you want immediate feedback
 * but don't want to spam the save function on every keystroke.
 *
 * @param callback - The function to debounce
 * @param delay - The debounce delay in milliseconds
 * @returns A debounced version of the callback
 *
 * @example
 * ```tsx
 * const debouncedSave = useDebouncedCallback((content) => {
 *   saveToDatabase(content);
 * }, 500);
 *
 * // First call: executes immediately
 * // Calls within 500ms: ignored
 * // Call after 500ms: executes immediately
 * ```
 */
export function useDebouncedCallback<T extends (...args: never[]) => void>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastCallRef = useRef<number>(0);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallRef.current;

      // If enough time has passed since last call, execute immediately
      if (timeSinceLastCall >= delay) {
        lastCallRef.current = now;
        callback(...args);
      } else {
        // Otherwise, schedule for later (replacing any pending timeout)
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        const remainingTime = delay - timeSinceLastCall;
        timeoutRef.current = setTimeout(() => {
          lastCallRef.current = Date.now();
          callback(...args);
        }, remainingTime);
      }
    },
    [callback, delay]
  );
}
