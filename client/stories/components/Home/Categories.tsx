import { Chips, Chip } from "@mantine/core";
import React, { useState } from "react";
import { useGlobalUIContext } from "../../../context/GlobalUI.context";
import styles from "./categories.module.css";

interface CategoriesProps {}

export const Categories: React.FC<CategoriesProps> = ({}) => {
  const { filterCategories, setFilterCategories } = useGlobalUIContext();
  return (
    <>
      <section className="px-4 sm:px-8 lg:px-16 xl:px-20 mx-auto mt-10">
        <h2 className="text-3xl font-bold">What Others are Listening to</h2>
      </section>
      <section
        className={`${styles.categoriesWrap} px-4 sm:px-8 lg:px-16 xl:px-20 mx-auto py-6`}
      >
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
          <Chip value="Indie">Indie</Chip>
          <Chip value="metal">Metal</Chip>
          <Chip value="r&b">R&B</Chip>
          <Chip value="country">Country</Chip>
        </Chips>
      </section>
    </>
  );
};
