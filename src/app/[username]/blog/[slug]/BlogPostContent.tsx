import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypePrettyCode from 'rehype-pretty-code'
import type { ComponentPropsWithoutRef } from 'react'

// Server component: renders markdown with Shiki syntax highlighting.
// No client JS shipped for the markdown rendering itself.

export async function BlogPostContent({ body }: { body: string }) {
  return (
    <div className="prose prose-neutral dark:prose-invert prose-headings:text-foreground prose-a:text-primary prose-code:text-foreground prose-pre:bg-muted prose-pre:border-border/50 prose-pre:border max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          [
            rehypePrettyCode,
            {
              theme: {
                dark: 'github-dark',
                light: 'github-light',
              },
              keepBackground: false,
            },
          ],
        ]}
        components={{
          // Style code blocks to match theme.
          pre: (props: ComponentPropsWithoutRef<'pre'>) => (
            <pre
              {...props}
              className="overflow-x-auto rounded-lg p-4 text-sm leading-relaxed"
            />
          ),
          // Inline code styling.
          code: (props: ComponentPropsWithoutRef<'code'>) => {
            const { children, className, ...rest } = props
            // If it has a className, it's a code block (handled by pre).
            if (className) {
              return <code {...rest} className={className}>{children}</code>
            }
            return (
              <code
                {...rest}
                className="bg-muted rounded px-1.5 py-0.5 text-sm before:content-none after:content-none"
              >
                {children}
              </code>
            )
          },
        }}
      >
        {body}
      </ReactMarkdown>
    </div>
  )
}
