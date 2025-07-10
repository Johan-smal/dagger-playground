import { users as usersTables } from "@/db/schema";
import type { ContainerVariables } from "@/middleware/container";
import type { FC } from "hono/jsx";
import { useRequestContext } from "hono/jsx-renderer";

export const Home: FC = async () => {
	const c = useRequestContext<{
		Variables: ContainerVariables;
	}>();
	const container = c.get("container");
	const db = container.get("db");
	const users = await db.select().from(usersTables)
	const usersList = users.map((user) => (
		<li key={user.id}>
			{user.name} ({user.email})
		</li>
	));
	return (
		<div class="overflow-x-auto">
			<h1 class="text-3xl font-bold mb-4">Welcome to Hono!</h1>
			<p class="mb-4">
				<ul>
					{usersList}
				</ul>
			</p>
		</div>
	);
};
