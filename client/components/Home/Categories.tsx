import { Chips, Chip, MultiSelect } from "@mantine/core";
import React, { useState } from "react";
import { useGlobalUIContext } from "../../context/GlobalUI.context";

interface CategoriesProps {}

export const Categories: React.FC<CategoriesProps> = ({}) => {
  const { filterCategories, setFilterCategories } = useGlobalUIContext();
  return (
    <>
      <section className="px-4 sm:px-8 lg:px-16 xl:px-20 mx-auto mt-5 md:mt-10">
        <h2 className="text-2xl xss:text-3xl font-bold">Currently Playing</h2>
      </section>
      <section
        // className={`${styles.categoriesWrap}`}
        className="px-4 sm:px-8 lg:px-16 xl:px-20 mx-auto"
      >
        <div className="flex sm:hidden  mx-auto py-6 w-full">
        {/* Mobile select */}
        <MultiSelect
          data={[
            { value: "rock", label: "Rock" },
            { value: "pop", label: "Pop" },
            { value: "hip hop", label: "Hip-Hop" },
            { value: "dance", label: "Dance" },
            { value: "electronic", label: "Electronic" },
            { value: "classical", label: "Classical" },
            { value: "indie", label: "Indie" },
            { value: "metal", label: "Metal" },
            { value: "r&b", label: "R&B" },
            { value: "country", label: "Country" },
          ]}
          value={filterCategories}
          onChange={setFilterCategories}
          placeholder="Filter by genre"
          searchable
          nothingFound="Nothing found"
          className="w-2/4"
        />
        </div>
        {/* Desktop chips */}
        <div className="hidden sm:flex  mx-auto py-6">
          <Chips
            color="orange"
            variant="filled"
            spacing="md"
            size="md"
            value={filterCategories}
            onChange={setFilterCategories}
            multiple
          >
            <Chip value="rock">Rock</Chip>
            <Chip value="pop">Pop</Chip>
            <Chip value="hip hop">Hip hop</Chip>
            <Chip value="dance">Dance</Chip>
            <Chip value="electronic">Electronic</Chip>
            <Chip value="classical">Classical</Chip>
            <Chip value="indie">Indie</Chip>
            <Chip value="metal">Metal</Chip>
            <Chip value="r&b">R&B</Chip>
            <Chip value="country">Country</Chip>
          </Chips>
        </div>
      </section>
    </>
  );
};
