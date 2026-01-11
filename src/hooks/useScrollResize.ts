import { useEffect, RefObject } from 'react';

/**
 * Hook to handle scroll and resize events on a container element.
 * Calls the callback when the container scrolls or window resizes.
 */
export const useScrollResize = (
  ref: RefObject<HTMLElement | null>,
  callback: () => void,
  enabled: boolean = true
): void => {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const element = ref.current;

    element?.addEventListener('scroll', callback);
    window.addEventListener('resize', callback);

    return () => {
      element?.removeEventListener('scroll', callback);
      window.removeEventListener('resize', callback);
    };
  }, [ref, callback, enabled]);
};
