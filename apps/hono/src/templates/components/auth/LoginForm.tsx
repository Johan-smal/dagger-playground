import { FC } from "hono/jsx";
import { Link } from "@/templates/components/common/Link";
import { Input } from "@/templates/components/common/Input";
import { Icon } from "@/templates/components/common/Icon";

export const LoginForm: FC = () => {
  return <>
    <div id="auth-form">
      <form hx-post="/hx/auth/login">
        <Input
          name="email"
          type="text"
          placeholder="Enter Email"
          icon={<Icon name="envelope" />}
        />
        <Input 
          name="password"
          type="password"
          placeholder="Enter Password"
          icon={<Icon name="key" />}
        />
        <button type="submit" class="btn w-full mb-4">Sign in</button>
        <div>
          <p class="text-center text-sm text-gray-500">
            No account?<span> </span>
            <Link route="/hx/auth/signup" hx-target="#auth-form" hx-replace-url={null}>Sign up</Link>
          </p>
        </div>
      </form>
    </div>
  </>
}