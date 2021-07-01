import React from "react";
import styles from "./categories.module.css";

interface CategoriesProps {}

export const Categories: React.FC<CategoriesProps> = ({}) => {
  return (
    <>
    <section className={`${styles.othersListeningTo}`}>
    <h2 >What others are listening to</h2>
    </section>
      <section className={`${styles.categoriesWrap}`}>
        <div className={`${styles.categoriesButtonWrap}`}>
          <button
            className={`${styles.categoriesTarget} ${styles.categoriesTargetActive}`}
          >
            All Categories
          </button>
        </div>
        <div className={`${styles.categoriesButtonWrap}`}>
          <button className={`${styles.categoriesTarget}`}>Hip-hop</button>
        </div>
        <div className={`${styles.categoriesButtonWrap}`}>
          <button className={`${styles.categoriesTarget}`}>Dance</button>
        </div>
        <div className={`${styles.categoriesButtonWrap}`}>
          <button className={`${styles.categoriesTarget}`}>Electronic</button>
        </div>
        <div className={`${styles.categoriesButtonWrap}`}>
          <button className={`${styles.categoriesTarget}`}>Pop</button>
        </div>
      </section>
      <section className={`${styles.selectWrapper}`}>
        <div>
          <select
            name="category"
            id="category-select"
            className={`${styles.categorySelect}`}
          >
            <option defaultChecked disabled value="">
              Select a category
            </option>
            <option value="Hip-hop">Hip-hop</option>
            <option value="Dance">Dance</option>
            <option value="Electronic">Electronic</option>
            <option value="Pop">Pop</option>
            <option value="Jazz">Jazz</option>
            <option value="Classical">Classical</option>
          </select>
        </div>
      </section>
    </>
  );
};
