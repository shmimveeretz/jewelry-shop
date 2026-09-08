import { Gem } from "lucide-react";
import StarRating from "../components/StarRating";

/**
 * Falls back to a craft statement when a product has no reviews yet. An empty
 * review section reads worse than no review section at all.
 */
function SocialProofBlock({ ctx, ...props }) {
  const {
    title = "מה הלקוחות מספרים",
    showRating = true,
    maxReviews = 4,
    fallbackTitle = "תכשיטי מקור בעבודת יד",
    fallbackText = "כל תכשיט נוצר אצלנו באולפן בישראל, אחד אחד, מחומרים אמיתיים. זה לא תכשיט שקונים בכל מקום — וזו בדיוק הנקודה.",
  } = props;

  const { product } = ctx;
  const hasRating = Number(product.rating?.count) > 0;
  const reviews = (product.reviews || [])
    .filter((review) => review.comment)
    .slice(0, maxReviews);

  if (!hasRating) {
    return (
      <section className="border-y border-gray-200 bg-white py-12">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 px-4 text-center">
          <Gem className="h-8 w-8 text-gold" strokeWidth={1.5} />
          <h2 className="font-display text-2xl text-navy">{fallbackTitle}</h2>
          <p className="leading-relaxed text-gray-600">{fallbackText}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="border-y border-gray-200 bg-white py-12">
      <div className="mx-auto max-w-3xl px-4">
        <div className="flex flex-col items-center gap-2 text-center">
          {showRating ? (
            <StarRating
              average={product.rating.average}
              count={product.rating.count}
            />
          ) : null}
          <h2 className="font-display text-2xl text-navy">{title}</h2>
        </div>

        {reviews.length > 0 ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {reviews.map((review, index) => (
              <figure
                key={`${review.date || "review"}-${index}`}
                className="rounded-2xl bg-cream p-5"
              >
                <StarRating average={review.rating} count={1} showCount={false} />
                <blockquote className="mt-3 leading-relaxed text-gray-700">
                  {review.comment}
                </blockquote>
              </figure>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default SocialProofBlock;
