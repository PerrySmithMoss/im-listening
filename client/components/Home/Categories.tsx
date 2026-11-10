import { Chip, Group, MultiSelect } from "@mantine/core";
import { useGlobalUIContext } from "../../context/GlobalUI.context";

const genres = [
  ["rock", "Rock"], ["pop", "Pop"], ["hip hop", "Hip-hop"], ["dance", "Dance"],
  ["electronic", "Electronic"], ["classical", "Classical"], ["indie", "Indie"],
  ["metal", "Metal"], ["r&b", "R&B"], ["country", "Country"],
].map(([value, label]) => ({ value, label }));

export function Categories() {
  const { filterCategories, setFilterCategories } = useGlobalUIContext();

  return (
    <section className="px-4 sm:px-8 lg:px-16 xl:px-20 mx-auto mt-5 md:mt-10">
      <h2 className="text-2xl xss:text-3xl font-bold">Currently Playing</h2>
      <div className="sm:hidden py-6">
        <MultiSelect
          data={genres}
          value={filterCategories}
          onChange={setFilterCategories}
          aria-label="Filter by genre"
          placeholder="Filter by genre"
          searchable
          nothingFoundMessage="Nothing found"
        />
      </div>
      <div className="hidden sm:block py-6">
        <Chip.Group value={filterCategories} onChange={setFilterCategories} multiple>
          <Group gap="md">
            {genres.map(({ value, label }) => <Chip key={value} value={value} color="orange" variant="filled">{label}</Chip>)}
          </Group>
        </Chip.Group>
      </div>
    </section>
  );
}
