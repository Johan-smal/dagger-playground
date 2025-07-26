/**
 * HTMX
 */
import "htmx.org"

import type { HonoAppType } from "@/routes";
import { hc } from "hono/client";
window.api = hc<HonoAppType>("/");

/**
 * Alpine
 */
import Alpine from "alpinejs";
import focus from "@alpinejs/focus"
import anchor from "@alpinejs/anchor"
import { formComponent } from "./alpine";
window.Alpine = Alpine;
Alpine.plugin(focus)
Alpine.plugin(anchor)
Alpine.plugin(formComponent)
Alpine.start();