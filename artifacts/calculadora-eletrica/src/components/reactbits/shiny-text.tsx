import React from 'react';

interface ShinyTextProps {
  children: React.ReactNode;
  disabled?: boolean;
  speed?: number;
  className?: string;
  shimmerColor?: string;
}

export function ShinyText({
  children,
  disabled = false,
  speed = 4,
  className = '',
  shimmerColor = 'rgba(255, 255, 255, 0.85)',
}: ShinyTextProps) {
  if (disabled) {
    return <span className={className}>{children}</span>;
  }

  return (
    <span
      className={`inline-block bg-clip-text text-transparent ${className}`}
      style={{
        backgroundImage: `linear-gradient(120deg, currentColor 0%, currentColor 40%, ${shimmerColor} 50%, currentColor 60%, currentColor 100%)`,
        backgroundSize: '200% 100%',
        animation: `shiny-text-sweep ${speed}s linear infinite`,
      }}
    >
      {children}
    </span>
  );
}
