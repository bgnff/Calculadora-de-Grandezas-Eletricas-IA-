import React from 'react';

interface StarBorderProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  className?: string;
  color?: string;
  speed?: string;
  children: React.ReactNode;
}

export function StarBorder({
  as: Component = 'div',
  className = '',
  color = '#1e6fff',
  speed = '5s',
  children,
  ...props
}: StarBorderProps) {
  return (
    <Component
      className={`relative inline-block overflow-hidden rounded-xl p-[1px] ${className}`}
      {...props}
    >
      <div
        className="absolute inset-[-100%] rounded-xl"
        style={{
          background: `conic-gradient(from 0deg, transparent 0 320deg, ${color} 360deg)`,
          animation: `star-border-spin ${speed} linear infinite`,
        }}
      />
      <div className="relative z-10 h-full w-full rounded-xl bg-white">{children}</div>
    </Component>
  );
}
