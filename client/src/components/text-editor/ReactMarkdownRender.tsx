"use client";

import Markdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import "katex/dist/katex.min.css";

export default function ReactMarkdownRender({ text }: { text: string }) {
  return (
    <Markdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        h1: ({ children }) => (
          <h1 className="text-4xl font-bold mb-4">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-3xl font-semibold mb-3">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-2xl font-semibold mb-2">{children}</h3>
        ),
        h4: ({ children }) => (
          <h4 className="text-xl font-semibold mb-2">{children}</h4>
        ),
        h5: ({ children }) => (
          <h5 className="text-lg font-semibold mb-1">{children}</h5>
        ),
        h6: ({ children }) => (
          <h6 className="text-base font-semibold mb-1">{children}</h6>
        ),

        p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,

        ul: ({ children }) => (
          <ul className="list-disc pl-6 mb-4">{children}</ul>
        ),

        ol: ({ children }) => (
          <ol className="list-decimal pl-6 mb-4">{children}</ol>
        ),

        li: ({ children }) => <li className="mb-1">{children}</li>,

        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4 text-gray-600">
            {children}
          </blockquote>
        ),

        code({ inline, className, children, ...props }: any) {
          if (inline) {
            return (
              <code className="bg-gray-200 px-1 py-0.5 rounded text-sm">
                {children}
              </code>
            );
          }

          return (
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
              <code className={className} {...props}>
                {children}
              </code>
            </pre>
          );
        },

        table: ({ children }) => (
          <table className="table-auto border-collapse border border-gray-300 my-4 w-full">
            {children}
          </table>
        ),

        th: ({ children }) => (
          <th className="border border-gray-300 px-3 py-2 bg-gray-100 text-left">
            {children}
          </th>
        ),

        td: ({ children }) => (
          <td className="border border-gray-300 px-3 py-2">{children}</td>
        ),

        a: ({ href, children }) => (
          <a
            href={href}
            className="text-blue-600 underline hover:text-blue-800"
            target="_blank"
          >
            {children}
          </a>
        ),

        hr: () => <hr className="my-6 border-gray-300" />,
      }}
    >
      {text}
    </Markdown>
  );
}
