const NewsLinkedText = ({ text }: { text: string }) => (
  <>
    {(text || "").split("\n").map((line, lineIndex) => (
      <span key={`line-${lineIndex}`}>
        {lineIndex > 0 && <br />}
        {line.split(/(\[[^\]]+\]\([^)]+\))/g).map((part, partIndex) => {
          const match = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
          if (!match) return <span key={`text-${partIndex}`}>{part}</span>;
          const [, label, url] = match;
          const isAllowedUrl = /^https?:\/\//i.test(url) || url.startsWith("/");
          return isAllowedUrl ? (
            <a
              key={`link-${partIndex}`}
              href={url}
              className="font-semibold text-accent underline decoration-accent/70 underline-offset-2 hover:text-accent/80"
            >
              {label}
            </a>
          ) : (
            <span key={`text-${partIndex}`}>{part}</span>
          );
        })}
      </span>
    ))}
  </>
);

export const newsPlainText = (text: string) =>
  (text || "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\s+/g, " ").trim();

export default NewsLinkedText;
