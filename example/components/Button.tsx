import React, { type DetailedHTMLProps, type ButtonHTMLAttributes } from 'react'

// Button with some styles.
const Button: React.FC<
  DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
> = (props) => (
  <button
    {...{
      ...props,
      className: `border border-gray-500 rounded-lg px-2 py-1 transition-colors hover:bg-gray-100 ${props.className}`,
    }}
  />
)

export default Button
