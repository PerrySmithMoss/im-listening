import { MultiSelect, Pill } from "@mantine/core";
import { genres } from "../../lib/genres";

export const genreInputId = "feed-genres";

export function Categories({ selected, onChange }: { selected: string[]; onChange: (values: string[]) => void }) {
  return (
    <div className="feed-filters">
      <MultiSelect id={genreInputId} label="Filter by genre" className="genre-picker" data={genres} value={selected}
        onChange={onChange} placeholder={selected.length ? "Add a genre" : "All genres"}
        searchable nothingFoundMessage="No matching genres" hidePickedOptions
        withCheckIcon={false} size="md" radius="md"
        renderPill={({ option, value, onRemove }) => {
          const label = option?.label ?? value;
          return <Pill withRemoveButton={Boolean(onRemove)} onRemove={() => {
            onRemove?.();
            document.getElementById(genreInputId)?.focus();
          }} removeButtonProps={{ "aria-hidden": false, "aria-label": `Remove ${label} filter`, tabIndex: 0 }}>{label}</Pill>;
        }} />
    </div>
  );
}
