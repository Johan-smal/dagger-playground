import type { FC } from "hono/jsx";

export const About: FC = async () => {
  return (
    <div class="overflow-x-auto">
      <h1 class="text-3xl font-bold mb-4">Welcome to About!</h1>
    </div>
  );
};
