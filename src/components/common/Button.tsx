import { ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        {
          // Variants
          'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500':
            variant === 'primary' && !disabled,
          'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-500':
            variant === 'secondary' && !disabled,
          'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500':
            variant === 'danger' && !disabled,
          'opacity-50 cursor-not-allowed': disabled,
        },
        {
          // Sizes
          'text-sm px-3 py-2': size === 'sm',
          'px-4 py-2': size === 'md',
          'text-lg px-6 py-3': size === 'lg',
        },
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
} 