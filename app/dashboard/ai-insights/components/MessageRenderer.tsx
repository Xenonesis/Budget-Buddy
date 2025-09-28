"use client";

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { MessageActions } from './MessageActions';

interface MessageRendererProps {
  content: string;
  role: 'user' | 'assistant';
  onSpeak?: (text: string) => void;
}

// Custom components for ReactMarkdown
const MarkdownComponents = {
  h1: ({ children, ...props }: any) => (
    <div className="text-base font-bold text-foreground mb-2 pb-1 border-b border-border/30" {...props}>
      {children}
    </div>
  ),
  h2: ({ children, ...props }: any) => (
    <div className="text-base font-semibold text-foreground mb-2 mt-3" {...props}>
      {children}
    </div>
  ),
  h3: ({ children, ...props }: any) => (
    <div className="text-sm font-semibold text-foreground mb-1 mt-2" {...props}>
      {children}
    </div>
  ),
  p: ({ children, ...props }: any) => (
    <p className="text-sm leading-relaxed mb-2 text-foreground/90" {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }: any) => (
    <ul className="text-sm space-y-1 mb-3 ml-4" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: any) => (
    <ol className="text-sm space-y-1 mb-3 ml-4" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }: any) => (
    <li className="text-sm leading-relaxed text-foreground/90" {...props}>
      {children}
    </li>
  ),
  code: ({ children, className, ...props }: any) => {
    const isInline = !className;
    return isInline ? (
      <code className="bg-muted/80 px-1.5 py-0.5 rounded text-xs font-mono border" {...props}>
        {children}
      </code>
    ) : (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
  pre: ({ children, ...props }: any) => (
    <pre className="bg-muted/50 border rounded-lg p-3 overflow-x-auto text-xs mb-3" {...props}>
      {children}
    </pre>
  ),
  blockquote: ({ children, ...props }: any) => (
    <blockquote className="border-l-4 border-primary/30 pl-4 py-2 bg-primary/5 rounded-r-lg mb-3" {...props}>
      <div className="text-sm italic text-foreground/80">
        {children}
      </div>
    </blockquote>
  ),
  strong: ({ children, ...props }: any) => (
    <strong className="font-semibold text-foreground" {...props}>
      {children}
    </strong>
  ),
  em: ({ children, ...props }: any) => (
    <em className="italic text-foreground/90" {...props}>
      {children}
    </em>
  ),
};

export function MessageRenderer({ content, role, onSpeak }: MessageRendererProps) {
  // Clean content - remove excessive markdown headers and format properly
  const cleanContent = (text: string): string => {
    return text
      // Convert ### headers to **bold** for better inline display
      .replace(/^### (.*$)/gm, '**$1**')
      // Convert ## headers to **bold** for better inline display
      .replace(/^## (.*$)/gm, '**$1**')
      // Convert # headers to **bold** for better inline display
      .replace(/^# (.*$)/gm, '**$1**')
      // Ensure proper line breaks after headers
      .replace(/\*\*(.*?)\*\*(?=\n|$)/g, '**$1**\n')
      // Clean up excessive newlines
      .replace(/\n{3,}/g, '\n\n')
      // Trim whitespace
      .trim();
  };

  if (role === 'user') {
    return (
      <div className="space-y-3">
        <div className="text-sm leading-relaxed break-words">
          {content}
        </div>
        <MessageActions content={content} role={role} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={MarkdownComponents}
        >
          {cleanContent(content)}
        </ReactMarkdown>
      </div>

      <MessageActions 
        content={content} 
        role={role} 
        onSpeak={onSpeak}
      />
    </div>
  );
}