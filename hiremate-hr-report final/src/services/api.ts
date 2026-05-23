/**
 * Shared API helper to dynamically resolve backend endpoint URLs.
 * Enables running the client and backend on different ports or origins in local development (e.g. VS Code).
 */
export const getApiUrl = (endpoint: string): string => {
  if (typeof window !== "undefined") {
    // If the browser is running the client on a port other than 3000 (e.g. 5173 for Vite dev server),
    // and is on localhost or 127.0.0.1, we direct API traffic to http://localhost:3000.
    const isLocalDevPort = window.location.port && window.location.port !== "3000";
    const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    
    if (isLocalDevPort && isLocalhost) {
      return `http://localhost:3000${endpoint}`;
    }
  }
  return endpoint;
};
