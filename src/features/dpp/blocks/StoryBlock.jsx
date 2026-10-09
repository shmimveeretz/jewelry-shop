import { Quote } from "lucide-react";

function StoryBlock({ ctx, ...props }) {
  const {
    title = "הסיפור שמאחורי התכשיט",
    showDescription = true,
    showMeaning = true,
    meaningTitle = "המשמעות",
    showQuote = true,
    extraBody,
  } = props;

  const { product } = ctx;

  const description = showDescription ? product.description : null;
  const meaning = showMeaning ? product.meaningHe : null;
  const quote = showQuote ? product.quoteHe : null;

  if (!description && !meaning && !quote && !extraBody) return null;

  return (
    <section className="mx-auto max-w-3xl px-4 py-12">
      {title ? (
        <h2 className="mb-4 font-display text-2xl text-navy">{title}</h2>
      ) : null}

      {description ? (
        <p className="whitespace-pre-line leading-relaxed text-gray-700">
          {description}
        </p>
      ) : null}

      {extraBody ? (
        <p className="mt-4 whitespace-pre-line leading-relaxed text-gray-700">
          {extraBody}
        </p>
      ) : null}

      {meaning ? (
        <div className="mt-6 rounded-2xl border-s-4 border-gold bg-white p-5">
          <p className="font-semibold text-navy">{meaningTitle}</p>
          <p className="mt-2 leading-relaxed text-gray-700">{meaning}</p>
        </div>
      ) : null}

      {quote ? (
        <blockquote className="mt-6 flex gap-3 text-gray-700">
          <Quote className="h-6 w-6 shrink-0 text-gold" strokeWidth={1.5} />
          <div>
            <p className="text-lg italic leading-relaxed">{quote}</p>
            {product.sourceHe ? (
              <footer className="mt-2 text-sm text-gray-600">
                {product.sourceHe}
              </footer>
            ) : null}
          </div>
        </blockquote>
      ) : null}
    </section>
  );
}

export default StoryBlock;
