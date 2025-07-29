import  { type FC, type PropsWithChildren, memo } from 'hono/jsx'
import { Base } from '@/templates/layouts/Base'
import { Link } from '@/templates/components/common/Link'
import { Icon } from '@/templates/components/common/Icon'
import { useRequestContext } from 'hono/jsx-renderer'
import { AuthMiddlewareVariables } from '@/middleware/auth'

const Logo: FC = memo(() => (
  <a class="ml-2 w-fit text-2xl font-bold text-on-surface-strong dark:text-on-surface-dark-strong" href="/">
    <span class="sr-only">homepage</span>
    LOGO PLACEHOLDER
  </a>
))

type IconNames = Parameters<typeof Icon>[0]['name']
type MenuItemProps = { name: string, route: string, icon: IconNames }

const MenuItem: FC<MenuItemProps> = ({ name, route, icon }) => {
  return <>
    <Link route={route}>
      <Icon name={icon} className="size-5 shrink-0" />
      <span>{ name }</span>
    </Link>
  </>
}

const SideBar: FC = memo(() => {
  const menuItems: MenuItemProps[] = [
    { name: "Dashboard", route: "/admin", icon: "chart-bar" },
    { name: "Clients", route: "/admin/clients", icon: "users" },
    { name: "Referrals", route: "/admin/referrals", icon: "globe-alt" },
    { name: "Appointments", route: "/admin/appointments", icon: "calendar" },
  ]
  return <>
    <Logo />
    <ul class="menu">
      {menuItems.map((props) => (<li><MenuItem {...props} /></li>))}
    </ul>
  </>
})

const Breadcrumbs: FC = () => (<>
  <nav class="hidden md:inline-block text-sm font-medium text-on-surface dark:text-on-surface-dark" aria-label="breadcrumb">
    <ol class="flex flex-wrap items-center gap-1">
    <li class="flex items-center gap-1">
      <a href="#" class="hover:text-on-surface-strong dark:hover:text-on-surface-dark-strong">TODO</a>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2" class="size-4" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"/>
      </svg>
    </li>
    <li class="flex items-center gap-1 font-bold text-on-surface-strong dark:text-on-surface-dark-strong" aria-current="page">DYNAMIC</li>
    </ol>
  </nav>
</>)

const ProfileMenu: FC<{ user: AuthMiddlewareVariables['user'] }> = ({ user }) => (<>
  <div 
    x-data="{ userDropdownIsOpen: false }"
    class="relative" 
    {...{
      "x-on:keydown.esc.window": "userDropdownIsOpen = false"
    }}
  >
    <button type="button" class="flex w-full items-center rounded-radius gap-2 p-2 text-left text-on-surface hover:bg-primary/5 hover:text-on-surface-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary dark:text-on-surface-dark dark:hover:bg-primary-dark/5 dark:hover:text-on-surface-dark-strong dark:focus-visible:outline-primary-dark" x-bind:class="userDropdownIsOpen ? 'bg-primary/10 dark:bg-primary-dark/10' : ''" aria-haspopup="true" x-on:click="userDropdownIsOpen = ! userDropdownIsOpen" x-bind:aria-expanded="userDropdownIsOpen">
      <Icon name="user-circle" className="size-8 object-cover rounded-radius" />
      <div class="hidden md:flex flex-col">
        <span class="text-sm font-bold text-on-surface-strong dark:text-on-surface-dark-strong">{ user.name }</span>
        <span class="text-xs" aria-hidden="true">{ user.email }</span>
        <span class="sr-only">profile settings</span>
      </div>
    </button>   
    {/* <!-- menu --> */}
    <div 
      x-cloak 
      x-show="userDropdownIsOpen" 
      class="absolute top-14 right-0 z-20 h-fit w-48 border divide-y divide-outline border-outline bg-surface dark:divide-outline-dark dark:border-outline-dark dark:bg-surface-dark rounded-radius"
      role="menu"
      {...{
        "x-on:click.outside": "userDropdownIsOpen = false",
        "x-on:keydown.down.prevent": "$focus.wrap().next()",
        "x-on:keydown.up.prevent": "$focus.wrap().previous()"
      }}
      x-transition="" 
      x-trap="userDropdownIsOpen"
    >
      <div class="flex flex-col py-1.5">
        <a hx-post="/hx/auth/logout" class="flex items-center gap-2 px-2 py-1.5 text-sm font-medium text-on-surface underline-offset-2 hover:bg-primary/5 hover:text-on-surface-strong focus-visible:underline focus:outline-hidden dark:text-on-surface-dark dark:hover:bg-primary-dark/5 dark:hover:text-on-surface-dark-strong">
          <Icon name="arrow-right-start-on-rectangle" className="size-5 shrink-0" />
          <span>Sign Out</span>
        </a>
      </div>
    </div>
  </div>
</>)

type DashboardProps = PropsWithChildren<{
  title: string
}>

export const Dashboard: FC<DashboardProps> = async ({ children, title }) => {
  const ctx = useRequestContext<{ Variables: AuthMiddlewareVariables }>();
  const user = ctx.get("user");
  const props = {
    title
  }

  return (
    <Base {...props}>
      <div x-data="{ sidebarIsOpen: false }" class="relative flex w-full flex-col md:flex-row">
        {/* <!-- This allows screen readers to skip the sidebar and go directly to the main content. --> */}
        <a class="sr-only" href="#main-content">skip to the main content</a>
        {/* <!-- dark overlay for when the sidebar is open on smaller screens  --> */}
        <div 
          x-cloak 
          x-show="sidebarIsOpen" 
          class="fixed inset-0 z-20 bg-surface-dark/10 backdrop-blur-xs md:hidden" 
          aria-hidden="true"
          x-on:click="sidebarIsOpen = false"
          {...{
            "x-transition.opacity": ''
          }}
        ></div>

        <nav 
          x-cloak 
          class="fixed left-0 z-30 flex h-svh w-60 shrink-0 flex-col border-r border-outline bg-surface-alt p-4 md:w-64 md:translate-x-0 md:relative"
          x-bind:class="sidebarIsOpen ? 'translate-x-0' : '-translate-x-60'"
          aria-label="sidebar navigation"
        >
          <SideBar />
        </nav>

        {/* <!-- top navbar & main content  --> */}
        <div class="h-svh w-full bg-surface dark:bg-surface-dark flex flex-col">
          {/* <!-- top navbar  --> */}
          <nav class="sticky top-0 z-10 flex items-center justify-between border-b border-outline bg-surface-alt px-4 py-2 dark:border-outline-dark dark:bg-surface-dark-alt" aria-label="top navibation bar">
            {/* <!-- sidebar toggle button for small screens  --> */}
            <button type="button" class="md:hidden inline-block text-on-surface dark:text-on-surface-dark" x-on:click="sidebarIsOpen = true">
                <Icon name="bars-3" className="size-6" />
                <span class="sr-only">sidebar toggle</span>
            </button>
            {/* <!-- breadcrumbs  --> */}
            <Breadcrumbs /> 
            {/* <!-- Profile Menu  --> */}
            <ProfileMenu user={user} />
          </nav>
          {/* <!-- main content  --> */}
          <div class="flex-1 overflow-y-auto">
            <div id="main-container">
              { children }
            </div>
          </div>
        </div>
      </div>
    </Base>
  )
}