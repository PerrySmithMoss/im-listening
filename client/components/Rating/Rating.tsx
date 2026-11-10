export function PostRating({ value }: { value: number }) {
  return (
    <p className="muted text-sm">
      <span aria-hidden="true" className="rating-star">★</span>{" "}
      Rated {value} out of 5 by the author
    </p>
  );
}

export function RatingField({ value, onChange, disabled }: { value: number; onChange: (value: number) => void; disabled?: boolean }) {
  return (
    <div className="field">
      <label htmlFor="post-rating">Your rating (required)</label>
      <select id="post-rating" className="field-control" disabled={disabled} value={value} onChange={(event) => onChange(Number(event.currentTarget.value))} required>
        <option value={0} disabled>Choose a rating</option>
        {Array.from({ length: 10 }, (_, index) => (index + 1) / 2).map((rating) =>
          <option key={rating} value={rating}>{rating} out of 5</option>)}
      </select>
    </div>
  );
}
