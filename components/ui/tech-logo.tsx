"use client";

import React, { useState } from "react";
import Image from "next/image";

interface TechLogoProps {
  name: string;
  logo: string;
  size?: number;
  className?: string;
}

export function TechLogo({ name, logo, size = 40, className }: TechLogoProps) {
  const [error, setError] = useState(false);

  // If image fails to load, show a fallback with the first letter
  if (error) {
    return (
      <div 
        className={`flex items-center justify-center rounded-full bg-primary/10 text-primary font-bold ${className}`}
        style={{ width: size, height: size }}
      >
        {name.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <Image 
      src={logo} 
      alt={name} 
      width={size} 
      height={size}
      className={`object-contain ${className}`}
      onError={() => setError(true)}
    />
  );
} 