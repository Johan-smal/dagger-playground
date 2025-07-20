/**
 * HTMX
 */
import "htmx.org"

/**
 * Alpine
 */
import Alpine from "alpinejs";
import focus from "@alpinejs/focus"
window.Alpine = Alpine;
Alpine.plugin(focus)
Alpine.start();

import type { HonoAppType } from "@/routes";
import { hc } from "hono/client";
window.api = hc<HonoAppType>("/");