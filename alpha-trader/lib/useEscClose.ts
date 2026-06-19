import { useEffect } from 'react';

/**
 * Close a modal / popup when the user presses Escape.
 * Pass a stable `onClose` callback (or one that's fine to re-bind each render).
 * When `active` is false the listener is not attached (useful for inline
 * modals gated by a state flag in a parent component).
 */
export function useEscClose(onClose: () => void, active: boolean = true) {
  useEffect(() => {
    if (!active) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, active]);
}
