import cls from './Button.module.css'
import type React from 'react'

export type ButtonVariant = 'primary' | 'ghost' | 'danger' | 'default'
export type ButtonSize = 'sm' | 'md'

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  iconOnly?: boolean
}

export function Button({
  className,
  variant = 'default',
  size = 'md',
  iconOnly,
  ...props
}: ButtonProps) {
  const variantClass =
    variant === 'default'
      ? undefined
      : variant === 'primary'
        ? cls.primary
        : variant === 'ghost'
          ? cls.ghost
          : cls.danger

  return (
    <button
      {...props}
      className={[
        cls.button,
        cls[size],
        iconOnly ? cls.iconOnly : undefined,
        variantClass,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    />
  )
}

