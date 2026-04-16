import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeStringify from 'rehype-stringify'

// Compile markdown to HTML on the server with the async unified pipeline.
// ReactMarkdown uses `runSync` internally, which throws when an async rehype
// plugin (rehype-pretty-code + Shiki) is in the chain — so we run the
// pipeline directly and inject the HTML.
export async function BlogPostContent({ body }: { body: string }) {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypePrettyCode, {
      theme: {
        dark: 'github-dark',
        light: 'github-light',
      },
      keepBackground: false,
    })
    .use(rehypeStringify)
    .process(body)

  return (
    <div
      className="prose prose-neutral dark:prose-invert prose-headings:text-foreground prose-a:text-primary prose-code:text-foreground prose-pre:bg-muted prose-pre:border-border/50 prose-pre:border prose-pre:overflow-x-auto prose-pre:rounded-lg prose-pre:p-4 prose-pre:text-sm prose-pre:leading-relaxed prose-code:before:content-none prose-code:after:content-none max-w-none"
      dangerouslySetInnerHTML={{ __html: String(file) }}
    />
  )
}
