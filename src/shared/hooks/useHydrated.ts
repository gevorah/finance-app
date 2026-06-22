'use client';

import { useEffect, useState } from 'react';

/**
 * Returns true once the component has mounted on the client.
 * Use to gate render of content that differs between server and client —
 * e.g. data restored from localStorage by Zustand persist, time-of-day greetings,
 * or anything else that would cause a hydration mismatch on first paint.
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
