import mixpanel from "mixpanel-browser";

let initialized = false;

/**
 * Tags this browser as internal (the team's own devices) so their activity can be
 * filtered out in Mixpanel. Visit any page once with ?internal=1 to set it; it then
 * sticks in localStorage and rides along on every event as internal_traffic: true.
 */
function applyInternalFlag() {
  if (typeof window === "undefined") return;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("internal") === "1") localStorage.setItem("kss_internal", "1");
    if (localStorage.getItem("kss_internal") === "1") {
      mixpanel.register({ internal_traffic: true });
    }
  } catch {
    // localStorage can throw in private mode; tagging is best-effort.
  }
}

function ensureInit() {
  const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
  if (!token || initialized) return;
  mixpanel.init(token, { track_pageview: false, persistence: "localStorage" });
  initialized = true;
  applyInternalFlag();
}

/** Fires a Mixpanel event. Silently no-ops if no token is configured. */
export function track(event: string, props?: Record<string, unknown>) {
  ensureInit();
  if (!initialized) {
    console.log("[mixpanel:disabled]", event, props ?? {});
    return;
  }
  mixpanel.track(event, props);
}

/**
 * Records a page view. This is the top of the funnel the PRD's journey starts at
 * ("01 Land"), and the only way to count visitors who never open the assistant.
 */
export function trackPageView(path: string) {
  track("page_viewed", { path });
}

/**
 * Attaches the founder's first name to every later event in the session, so one
 * session can be told apart from another (and the team's own runs filtered out).
 */
export function registerFounderName(name: string) {
  ensureInit();
  if (!initialized) return;
  try {
    mixpanel.register({ founder_name: name });
  } catch {
    // best-effort
  }
}
