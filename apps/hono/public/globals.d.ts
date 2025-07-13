import type { HonoAppType } from "@/routes";
import type Alpine from "alpinejs";
import type { hc } from "hono/client";

declare global {
	interface Window {
		Alpine: Alpine.Alpine;
		api: ReturnType<typeof hc<HonoAppType>>;
	}
}
