import { FC } from "hono/jsx";
import { Link } from "@/templates/components/common/Link";

const MobileMenu: FC = () => {
  return (
    <div class="dropdown lg:hidden">
      <div tabindex={0} role="button" class="btn btn-ghost">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" /></svg>
      </div>
      <ul tabindex={0} class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
        <li><a>Item 1</a></li>
        <li><a>Item 3</a></li>
      </ul>
    </div>
  )
}

const DesktopMenu: FC = () => {
  return (
    <div class="navbar-center hidden lg:flex">
      <ul class="menu menu-horizontal px-1">
        <li><a>Item 1</a></li>
        <li><a>Item 3</a></li>
      </ul>
    </div>
  )
}

export const NavBar: FC = () => {
  return (
    <div class="navbar bg-base-100">
      <div class="navbar-start">
        <MobileMenu />
        <Link route="/" className="btn btn-ghost text-xl">Mini SaaS</Link>
      </div>
      <DesktopMenu />
      <div class="navbar-end">
        <Link route="/login" className="btn">Login</Link>
      </div>
    </div>
  )
}