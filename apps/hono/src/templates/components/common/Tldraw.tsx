import { FC } from "hono/jsx";

export const Tldraw: FC = () => {
  return (
    <div x-data="tldrawEditor">
      <div x-ref="tldraw" class="w-full aspect-[16/9]"></div>
    </div>
  );
}