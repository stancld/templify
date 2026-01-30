import { useEffect, RefObject } from 'react';

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
