import type { HTMLAttributes, ReactNode } from 'react';

export default function Card({
  children,
  className = '',
  padded = true,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode; padded?: boolean }) {
  return (
    <div
      className={`bg-white rounded-2xl border border-navy-100/70 shadow-card ${
        padded ? 'p-6' : ''
      } ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
