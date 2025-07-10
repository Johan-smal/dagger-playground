import type { FC } from "hono/jsx";

export const NotFound: FC = async () => {
  return (
    <div class="overflow-x-auto">
      <h1 class="text-3xl font-bold mb-4">Page not found</h1>
    </div>
  );
};
