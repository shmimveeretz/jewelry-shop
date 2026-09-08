const ALIGNMENTS = {
  start: "text-start",
  center: "text-center",
  end: "text-end",
};

/**
 * Plain text only — rendered as text nodes, never as HTML. Line breaks are
 * preserved with whitespace-pre-line, which covers what admins actually need
 * without opening an injection path.
 */
function RichTextBlock({ title, body, align = "start" }) {
  if (!title && !body) return null;

  return (
    <section
      className={`mx-auto max-w-3xl px-4 py-10 ${ALIGNMENTS[align] || ALIGNMENTS.start}`}
    >
      {title ? (
        <h2 className="mb-4 font-display text-2xl text-navy">{title}</h2>
      ) : null}
      {body ? (
        <p className="whitespace-pre-line leading-relaxed text-gray-700">
          {body}
        </p>
      ) : null}
    </section>
  );
}

export default RichTextBlock;
