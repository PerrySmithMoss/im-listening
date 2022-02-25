import { Chips, Chip } from "@mantine/core";
import React, { useState } from "react";
import styles from "./categories.module.css";

interface CategoriesProps {}

export const Categories: React.FC<CategoriesProps> = ({}) => {
  const [value, setValue] = useState(["all"]);
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
          value={value}
          onChange={setValue}
          multiple
        >
          <Chip value="all">All Categories</Chip>
          <Chip value="rock">Rock</Chip>
          <Chip value="pop">Pop</Chip>
          <Chip value="hipHop">Hip-hop</Chip>
          <Chip value="jazz">Jazz</Chip>
          <Chip value="dance">Dance</Chip>
          <Chip value="electronic">Electronic</Chip>
          <Chip value="classical">Classical</Chip>
          <Chip value="classical">Indie</Chip>
        </Chips>
      </section>
    </>
  );
};
