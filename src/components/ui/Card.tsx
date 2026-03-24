import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'bordered' | 'elevated';
}

export function Card({ children, className = '', variant = 'bordered', ...props }: CardProps) {
  const variantClass = variant === 'elevated' ? 'panel' : 'table-card';
  return (
    <div className={`${variantClass} ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}
