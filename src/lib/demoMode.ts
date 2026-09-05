export const isDemoMode = () => typeof window !== "undefined" && new URLSearchParams(window.location.search).get("demo") === "true";
