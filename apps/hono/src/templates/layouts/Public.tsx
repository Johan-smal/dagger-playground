import type { FC, PropsWithChildren } from 'hono/jsx'
import { NavBar } from '@/templates/components/NavBar'
import { Base } from '@/templates/layouts/Base'


type BaseProps = PropsWithChildren<{
  title: string
}>

export const Public: FC<BaseProps> = async ({ children, title }) => {
  const props = {
    title
  }
  return (
    <Base { ...props }>
      <NavBar />
      <div id="main-container">{ children }</div>
    </Base>
  )
}