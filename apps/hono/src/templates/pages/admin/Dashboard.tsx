import { AuthMiddlewareVariables } from "@/middleware/auth";
import { Tldraw } from "@/templates/components/common/Tldraw";
import { FC } from "hono/jsx";
import { useRequestContext } from "hono/jsx-renderer";

export const Dashboard: FC = () => {
  const c = useRequestContext<{
    Variables: AuthMiddlewareVariables;
  }>();
  return (
    <>{JSON.stringify(c.get("user"))}</>
  )
}