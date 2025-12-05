/**
 * Reusable section wrapper with animation support
 */

import { memo } from 'react';

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
  AnimationComponent?: React.ComponentType;
  animationClassName?: string;
  animationOpacity?: number;
}

export const SectionWrapper = memo(function SectionWrapper({
  children,
  className = '',
  AnimationComponent,
  animationClassName = '',
  animationOpacity = 1,
}: SectionWrapperProps) {
  return (
    <div className={`relative transform-gpu ${className}`}>
      {AnimationComponent && (
        <div
          className={`absolute inset-0 overflow-hidden pointer-events-none hidden sm:block ${animationClassName}`}
          style={{ opacity: animationOpacity, willChange: 'opacity' }}
        >
          <AnimationComponent />
        </div>
      )}
      {children}
    </div>
  );
});
