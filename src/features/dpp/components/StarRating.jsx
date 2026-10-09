import { Star } from "lucide-react";

function StarRating({ average, count, showCount = true }) {
  const rounded = Math.round(Number(average) || 0);

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rounded ? "fill-gold text-gold" : "text-gray-300"
            }`}
            strokeWidth={1.5}
          />
        ))}
      </div>
      {showCount ? (
        <span className="text-sm text-gray-600">
          {Number(average).toFixed(1)} ({count} ביקורות)
        </span>
      ) : null}
    </div>
  );
}

export default StarRating;
