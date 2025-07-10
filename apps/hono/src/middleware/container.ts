import { db } from "@/db";
import { createMiddleware } from "hono/factory";

// Strongly typed dependency container
class Container<T extends Record<string, NonNullable<unknown>>> {
	private services = new Map<keyof T, T[keyof T]>();

	set<K extends keyof T>(name: K, instance: T[K]) {
		this.services.set(name, instance);
	}

	get<K extends keyof T>(name: K): T[K] {
		const service = this.services.get(name);
		if (!service) {
			throw new Error(`Service '${String(name)}' not found`);
		}
		return service as T[K];
	}
}

// Define the services that will be injected
type ServiceMap = {
	db: typeof db;
};

// Ensure Hono has the correct types for injected variables
export type ContainerVariables = {
	container: Container<ServiceMap>;
};

// Middleware to inject the container into Hono’s context
export const containerMiddleware = createMiddleware<{
	Variables: ContainerVariables;
}>(async (c, next) => {
	const container = new Container<ServiceMap>();
	container.set("db", db);

	c.set("container", container);
	await next();
});
