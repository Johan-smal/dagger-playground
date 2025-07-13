import type { ContainerVariables } from "@/middleware/container";
import type { FC } from "hono/jsx";
import { useRequestContext } from "hono/jsx-renderer";
import { LoginForm } from "@/templates/components/auth/LoginForm";

export const Login: FC = async () => {
  const c = useRequestContext<{
    Variables: ContainerVariables;
  }>();
  
  return (
    <div class="hero min-h-[80vh]">
      <div class="hero-content">
        <div class="max-w-md">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};
