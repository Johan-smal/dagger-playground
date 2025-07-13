import type { FC } from "hono/jsx";
import { Icon } from "@/templates/components/common/Icon";
import { Input } from "@/templates/components/common/Input";

export const SignUpForm: FC = () => {
  return <>
      <form hx-post="/hx/auth/signup">
        <Input
          name="email"
          type="text"
          placeholder="Enter Email"
          icon={<Icon name="email" />}
        />
        <Input 
          name="password"
          type="password"
          placeholder="Enter Password"
          icon={<Icon name="password" />}
        />
        <Input 
          name="confirm"
          type="password"
          placeholder="Confirm Password"
          icon={<Icon name="password" />}
        />
        <button type="submit" class="btn w-full mb-4">Sign up</button>
      </form>
  </>
}