/**
 * Lightweight loading skeleton for landing page sections
 */

import { memo } from 'react';

export const SectionSkeleton = memo(function SectionSkeleton() {
  return (
    <div className="py-16 px-4 will-change-auto">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="h-8 w-48 mx-auto rounded fast-skeleton" />
        <div className="h-4 w-96 mx-auto rounded fast-skeleton" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-xl fast-skeleton" />
          ))}
        </div>
      </div>
    </div>
  );
});
