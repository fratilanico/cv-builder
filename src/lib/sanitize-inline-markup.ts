const ALLOWED_TAGS = new Set(["strong", "code"]);

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function sanitizeInlineMarkup(input: string): string {
  const escaped = escapeHtml(input);

  return escaped.replace(/&lt;(\/?)(strong|code)&gt;/gi, (_, closing: string, tag: string) => {
    const normalized = tag.toLowerCase();
    if (!ALLOWED_TAGS.has(normalized)) {
      return "";
    }

    return `<${closing}${normalized}>`;
  });
}
