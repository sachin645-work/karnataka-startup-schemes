"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackPageView } from "@/lib/mixpanel";

/**
 * Fires a page_viewed event on first load and on every client-side route change,
 * so homepage and scheme-page visits are counted, not just chatbot opens. Renders
 * nothing; it just observes the current path.
 */
export function AnalyticsTracker() {
  const pathname = usePathname();
  useEffect(() => {
    trackPageView(pathname);
  }, [pathname]);
  return null;
}
