"use client";

import React from "react";
import Image from "next/image";

export default function ImageTest() {
  return (
    <div className="min-h-screen p-8 bg-background">
      <h1 className="text-3xl font-bold mb-8">Image Test</h1>
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
        <div className="flex flex-col items-center p-4 rounded-lg border border-muted bg-white/50 dark:bg-gray-900/50">
          <div className="w-16 h-16 mb-3 relative">
            <Image 
              src="/tech/nextjs.svg"
              alt="Next.js" 
              fill
              className="object-contain"
              unoptimized={true}
            />
          </div>
          <h4 className="text-sm font-medium text-center">Next.js</h4>
        </div>
        
        <div className="flex flex-col items-center p-4 rounded-lg border border-muted bg-white/50 dark:bg-gray-900/50">
          <div className="w-16 h-16 mb-3 relative">
            <Image 
              src="/tech/react.svg"
              alt="React" 
              fill
              className="object-contain"
              unoptimized={true}
            />
          </div>
          <h4 className="text-sm font-medium text-center">React</h4>
        </div>
        
        <div className="flex flex-col items-center p-4 rounded-lg border border-muted bg-white/50 dark:bg-gray-900/50">
          <div className="w-16 h-16 mb-3 relative">
            <Image 
              src="/tech/typescript.svg"
              alt="TypeScript" 
              fill
              className="object-contain"
              unoptimized={true}
            />
          </div>
          <h4 className="text-sm font-medium text-center">TypeScript</h4>
        </div>
      </div>
    </div>
  );
}