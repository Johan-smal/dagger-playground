import type { FC } from "hono/jsx";

type InputProps = {
  icon?: ReturnType<FC>
  placeholder?: string
  type: string
  name: string
}

export const Input: FC<InputProps> = ({ type, icon, placeholder, name }) => {
  return (
    <label class="input input-bordered flex items-center gap-2 mb-4">
      {icon ?? <></>}
      <input name={name} type={type} placeholder={placeholder} class="grow" />
    </label>
  )
}