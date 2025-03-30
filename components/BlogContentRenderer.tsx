'use client';

import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css'; // You can choose any style you prefer
import Link from 'next/link';
import React, { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

interface BlogContentRendererProps {
  content: string;
}

const BlogContentRenderer: React.FC<BlogContentRendererProps> = ({ content }) => {
  // Initialize highlight.js when the component mounts
  useEffect(() => {
    hljs.highlightAll();
  }, [content]);

  return (
    <ReactMarkdown
      components={{
        h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mt-8 mb-4" {...props} />,
        h2: ({ node, ...props }) => <h2 className="text-2xl font-bold mt-8 mb-4" {...props} />,
        h3: ({ node, ...props }) => <h3 className="text-xl font-bold mt-6 mb-3" {...props} />,
        p: ({ node, ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
        a: ({ node, href, ...props }) => (
          <Link
            href={href || '#'}
            className="text-blue-600 hover:text-blue-800 underline"
            {...props}
          />
        ),
        ul: ({ node, ordered, ...props }) => <ul className="list-disc pl-8 mb-4" {...props} />,
        ol: ({ node, ordered, ...props }) => <ol className="list-decimal pl-8 mb-4" {...props} />,
        li: ({ node, ordered, ...props }) => <li className="mb-1" {...props} />,
        blockquote: ({ node, ...props }) => (
          <blockquote
            className="border-l-4 border-gray-300 pl-4 italic text-gray-700 my-4"
            {...props}
          />
        ),
        img: ({ node, alt, src, ...props }) => (
          <div className="my-6">
            <iframe
              src={src || ''}
              title={alt || 'Embedded content'}
              width="100%"
              height="500"
              className="rounded-lg"
              style={{ border: 'none' }}
              allowFullScreen
            />
            {alt && <p className="text-sm text-center text-gray-500 mt-2">{alt}</p>}
          </div>
        ),
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          if (!inline && match) {
            // For code blocks
            return (
              <pre className="rounded-md my-6 overflow-auto">
                <code className={`hljs language-${match[1]}`} {...props}>
                  {String(children).replace(/\n$/, '')}
                </code>
              </pre>
            );
          }
          // For inline code
          return (
            <code
              className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded-md font-mono text-sm"
              {...props}
            >
              {children}
            </code>
          );
        },
        table: ({ node, ...props }) => (
          <div className="overflow-x-auto my-6">
            <table className="min-w-full border-collapse border border-gray-300" {...props} />
          </div>
        ),
        th: ({ node, ...props }) => (
          <th className="border border-gray-300 bg-gray-100 px-4 py-2 text-left" {...props} />
        ),
        td: ({ node, ...props }) => <td className="border border-gray-300 px-4 py-2" {...props} />,
        hr: ({ node, ...props }) => <hr className="my-8 border-gray-300" {...props} />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default BlogContentRenderer;
