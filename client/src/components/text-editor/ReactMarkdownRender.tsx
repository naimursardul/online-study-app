import Markdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import remarkMath from "remark-math";
import "katex/dist/katex.min.css";

export default function ReactMarkdownRender({ text }: { text: string }) {
  text = text?.replace("CDN_BASE_URL", import.meta.env.VITE_CDN_BASE_URL);
  return (
    <Markdown
      remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]}
      rehypePlugins={[rehypeKatex]}
      components={{
        h1: ({ children }) => (
          <h1 className="text-4xl font-bold mt-2 text-foreground">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-3xl font-semibold my-1.5 text-foreground">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-2xl font-semibold my-1 text-foreground">
            {children}
          </h3>
        ),
        h4: ({ children }) => (
          <h4 className="text-xl font-semibold my-1 text-foreground">
            {children}
          </h4>
        ),
        h5: ({ children }) => (
          <h5 className="text-lg font-semibold my-0.5 text-foreground">
            {children}
          </h5>
        ),
        h6: ({ children }) => (
          <h6 className="text-base font-semibold my-0.5 text-foreground">
            {children}
          </h6>
        ),

        p: ({ children }) => (
          <p className="my-2 leading-relaxed text-foreground">{children}</p>
        ),

        ul: ({ children }) => (
          <ul className="list-disc pl-6 my-2 text-foreground">{children}</ul>
        ),

        ol: ({ children }) => (
          <ol className="list-decimal pl-6 my-2 text-foreground">{children}</ol>
        ),

        li: ({ children }) => <li className="my-0.5">{children}</li>,

        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-border pl-4 italic my-4 text-muted-foreground">
            {children}
          </blockquote>
        ),

        code({ inline, className, children, ...props }: any) {
          if (inline) {
            return (
              <code className="bg-muted text-muted-foreground px-1 py-0.5 rounded text-sm">
                {children}
              </code>
            );
          }

          return (
            <pre className="bg-secondary text-secondary-foreground p-4 rounded-lg overflow-x-auto my-2 border border-border">
              <code className={className} {...props}>
                {children}
              </code>
            </pre>
          );
        },

        table: ({ children }) => (
          <table className="table-auto border-collapse border border-border my-4 w-full text-foreground">
            {children}
          </table>
        ),

        th: ({ children }) => (
          <th className="border border-border px-3 py-2 bg-muted text-muted-foreground text-left">
            {children}
          </th>
        ),

        td: ({ children }) => (
          <td className="border border-border px-3 py-2 text-foreground">
            {children}
          </td>
        ),

        a: ({ href, children }) => (
          <a
            href={href}
            className="text-primary underline underline-offset-2 hover:text-primary/80"
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),

        hr: () => <hr className="my-6 border-border" />,
      }}
    >
      {text}
    </Markdown>
  );
}
