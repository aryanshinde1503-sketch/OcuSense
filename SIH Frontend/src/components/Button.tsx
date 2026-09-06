import { type ButtonHTMLAttributes, type ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

const variants = {
  primary:
    'bg-teal-500 text-white hover:bg-teal-600 shadow-soft disabled:bg-teal-500/50',
  secondary:
    'bg-navy-800 text-white hover:bg-navy-700 shadow-soft disabled:bg-navy-800/50',
  outline:
    'border border-navy-100 text-navy-700 bg-white hover:border-teal-400 hover:text-teal-600 disabled:opacity-50',
  ghost: 'text-navy-600 hover:bg-navy-50 disabled:opacity-50',
};

const sizes = {
  sm: 'px-3.5 py-2 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-[15px] rounded-xl',
  lg: 'px-7 py-3.5 text-base rounded-xl',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'right',
  children,
  className = '',
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-medium transition-colors duration-150 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {icon && iconPosition === 'left' && icon}
      {children}
      {icon && iconPosition === 'right' && icon}
    </button>
  );
}
