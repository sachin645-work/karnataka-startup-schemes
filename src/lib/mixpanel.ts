import mixpanel from "mixpanel-browser";

let initialized = false;

function ensureInit() {
  const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
  if (!token || initialized) return;
  mixpanel.init(token, { track_pageview: false, persistence: "localStorage" });
  initialized = true;
}

/** Fires a Mixpanel event. Silently no-ops if no token is configured, so
 * local development never crashes on missing env vars. */
export function track(event: string, props?: Record<string, unknown>) {
  ensureInit();
  if (!initialized) {
    console.log("[mixpanel:disabled]", event, props ?? {});
    return;
  }
  mixpanel.track(event, props);
}
