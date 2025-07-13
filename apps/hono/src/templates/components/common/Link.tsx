import type { FC, PropsWithChildren } from 'hono/jsx'

type LinkProps = PropsWithChildren<{
  route: string
  className?: string
  ['hx-target']?: string
  ['hx-replace-url']?: string | null
}>

export const Link: FC<LinkProps> = ({ children, route, className, "hx-target": hxTarget, "hx-replace-url": hxReplaceUrl }) => { 
  return <a 
    hx-get={route} 
    hx-target={hxTarget ?? "#main-container"} 
    hx-replace-url={hxReplaceUrl === undefined ? route : hxReplaceUrl ?? undefined} 
    class={`${className ?? ''} cursor-pointer`}
  >{children}</a>
}