import { Rating } from "@mantine/core";

export function PostRating({ value, onChange }: { value: number; onChange?: (value: number) => void }) {
  return <Rating value={value} onChange={onChange} fractions={2} readOnly={!onChange} size="lg" />;
}
