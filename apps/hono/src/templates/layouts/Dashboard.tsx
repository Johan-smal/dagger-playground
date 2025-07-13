import type { FC, PropsWithChildren } from 'hono/jsx'
import { Base } from '@/templates/layouts/Base'
import { Link } from '@/templates/components/common/Link'

type DashboardProps = PropsWithChildren<{
  title: string
}>

export const Dashboard: FC<DashboardProps> = async ({ children, title }) => {
  const props = {
    title
  }
  return (
    <Base { ...props }>
      <div class="drawer lg:drawer-open">
        <input id="main-drawer" type="checkbox" class="drawer-toggle" />
        <div class="drawer-content">
          <label for="main-drawer" class="btn drawer-button lg:hidden">Open drawer</label>
          <div id="main-container" class="p-4">{ children }</div>
        </div> 
        <div class="drawer-side bg-blue-200">
          <label for="main-drawer" aria-label="close sidebar" class="drawer-overlay"></label> 
          <ul class="menu p-4 w-40">
            <li><Link route="/dashboard">Dashboard</Link></li>
            <li><Link route="/dashboard/posts">Posts</Link></li>
          </ul>
          <button class="btn btn-primary" hx-post="/hx/auth/logout">Logout</button>
        </div>
      </div>
    </Base>
  )
}