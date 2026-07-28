import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}
function getClientSnapshot() {
  return true;
}
function getServerSnapshot() {
  return false;
}

/**
 * İstemcide hydrate olup olmadığını söyler — `document`/`window` gerektiren portal gibi
 * yapılar için SSR-güvenli "mount oldu mu" kontrolü. `useEffect` içinde `setState`
 * çağırmanın (cascading render'a yol açan, lint'in de yakaladığı) yerine geçer:
 * https://react.dev/reference/react/useSyncExternalStore
 */
export function useIsMounted(): boolean {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
