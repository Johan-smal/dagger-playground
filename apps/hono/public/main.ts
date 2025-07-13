/**
 * HTMX
 */
import "htmx.org"

/**
 * Alpine
 */
import Alpine from "alpinejs";
window.Alpine = Alpine;
Alpine.start();

import type { HonoAppType } from "@/routes";
import { hc } from "hono/client";
window.api = hc<HonoAppType>("/");

console.log("JS loaded");