import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Persist an in-page view / section selection across reloads & navigation.
 * Syncs value to both localStorage and the URL query string for shareable links.
 *
 * @param key storage & query param key (e.g. 'dashboardSection')
 * @param defaultValue default when nothing stored
 */
export function usePersistentView(key: string, defaultValue: string) {
  const [searchParams, setSearchParams] = useSearchParams();
  const initRef = useRef(false);
  const initial = searchParams.get(key) || localStorage.getItem(key) || defaultValue;
  const [value, setValue] = useState(initial);

  // Ensure URL reflects current value on first mount if missing
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    if (!searchParams.get(key)) {
      const sp = new URLSearchParams(searchParams);
      sp.set(key, value);
      setSearchParams(sp, { replace: true });
    }
  }, [key, searchParams, setSearchParams, value]);

  // Keep localStorage in sync
  useEffect(() => {
    try { localStorage.setItem(key, value); } catch { /* ignore */ }
  }, [key, value]);

  const update = useCallback((next: string) => {
    setValue(next);
    try { localStorage.setItem(key, next); } catch { /* ignore */ }
    const sp = new URLSearchParams(searchParams);
    sp.set(key, next);
    setSearchParams(sp, { replace: true });
  }, [searchParams, setSearchParams, key]);

  return [value, update] as const;
}

export default usePersistentView;
