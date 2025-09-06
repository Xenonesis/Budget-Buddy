"use client";

import React from "react";

interface TechLogoProps {
  name: string;
  logo: string;
  size?: number;
  className?: string;
}

export function TechLogo({ name, logo, size = 40, className }: TechLogoProps) {
  // First try to load the actual SVG/PNG files from the public directory
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <img 
        src={logo}
        alt={name} 
        width={size}
        height={size}
        className={`object-contain ${className}`}
        onError={(e) => {
          // If image fails to load, show a fallback with the first letter
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const fallback = document.createElement('div');
          fallback.className = `flex items-center justify-center rounded-full bg-primary/10 text-primary font-bold ${className}`;
          fallback.style.width = `${size}px`;
          fallback.style.height = `${size}px`;
          fallback.textContent = name.charAt(0).toUpperCase();
          target.parentNode?.appendChild(fallback);
        }}
      />
    </div>
  );
}

 