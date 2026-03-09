// MarkdownRenderer - renders AI markdown responses with dark, readable text
interface Props { content: string; }

export default function MarkdownRenderer({ content }: Props) {
  const lines = content.split('\n');

  const renderInline = (text: string) => {
    const parts: (string | JSX.Element)[] = [];
    let remaining = text;
    let key = 0;
    while (remaining.length > 0) {
      const boldMatch = remaining.match(/^(.*?)\*\*(.*?)\*\*(.*)/s);
      const codeMatch = remaining.match(/^(.*?)`([^`]+)`(.*)/s);
      if (boldMatch && (!codeMatch || boldMatch[1].length <= codeMatch[1].length)) {
        if (boldMatch[1]) parts.push(boldMatch[1]);
        parts.push(<strong key={key++} className="font-bold text-slate-900">{boldMatch[2]}</strong>);
        remaining = boldMatch[3];
      } else if (codeMatch) {
        if (codeMatch[1]) parts.push(codeMatch[1]);
        parts.push(<code key={key++} className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-mono font-semibold text-primary">{codeMatch[2]}</code>);
        remaining = codeMatch[3];
      } else {
        parts.push(remaining);
        break;
      }
    }
    return parts;
  };

  const rendered: JSX.Element[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { rendered.push(<div key={i} className="h-2" />); i++; continue; }

    if (line.startsWith('## ')) {
      rendered.push(<h3 key={i} className="mt-3 mb-1 text-base font-extrabold text-primary">{line.slice(3)}</h3>);
      i++; continue;
    }
    if (line.startsWith('### ')) {
      rendered.push(<h4 key={i} className="mt-2 mb-1 text-sm font-bold text-slate-800">{line.slice(4)}</h4>);
      i++; continue;
    }
    if (/^(\*|-) /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^(\*|-) /.test(lines[i])) { items.push(lines[i].replace(/^(\*|-) /, '')); i++; }
      rendered.push(
        <ul key={i} className="my-1.5 space-y-1.5 pl-1">
          {items.map((item, j) => (
            <li key={j} className="flex items-start gap-2 text-sm text-slate-800">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }
    if (/^\d+\. /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) { items.push(lines[i].replace(/^\d+\. /, '')); i++; }
      rendered.push(
        <ol key={i} className="my-1.5 space-y-1.5 pl-1">
          {items.map((item, j) => (
            <li key={j} className="flex items-start gap-2 text-sm text-slate-800">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold mt-0.5">{j + 1}</span>
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }
    if (line.startsWith('Note:') || line.startsWith('Tip:')) {
      rendered.push(
        <div key={i} className="my-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-900">
          {renderInline(line)}
        </div>
      );
      i++; continue;
    }
    if (line.startsWith('---')) { rendered.push(<hr key={i} className="my-3 border-slate-200" />); i++; continue; }
    rendered.push(<p key={i} className="text-sm leading-relaxed text-slate-800">{renderInline(line)}</p>);
    i++;
  }
  return <div className="space-y-0.5">{rendered}</div>;
}
