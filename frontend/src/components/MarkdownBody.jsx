import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'

// Renders analysis output as formatted Markdown (GFM tables, lists, code).
// Single newlines render as line breaks. Raw HTML in the text is never rendered: react-markdown escapes it by default.
const COMPONENTS = {
  a: (props) => <a href={props.href} title={props.title} target="_blank" rel="noreferrer noopener">{props.children}</a>,
  table: (props) => <div className="md-table-wrap"><table>{props.children}</table></div>,
}
const PLUGINS = [remarkGfm, remarkBreaks]

export default function MarkdownBody({ text }) {
  return <ReactMarkdown remarkPlugins={PLUGINS} components={COMPONENTS}>{text}</ReactMarkdown>
}
