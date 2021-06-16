import React from "react";
import "./categories.css";

interface CategoriesProps {}

export const Categories: React.FC<CategoriesProps> = ({}) => {
  return (
    <>
      <section className="categories-wrap">
        <div className="categories-button_wrap">
          <button className="categories-target categories-target_active">
            All Categories
          </button>
        </div>
        <div className="categories-button_wrap">
          <button className="categories-target">Hip-hop</button>
        </div>
        <div className="categories-button_wrap">
          <button className="categories-target">Dance</button>
        </div>
        <div className="categories-button_wrap">
          <button className="categories-target">Electronic</button>
        </div>
        <div className="categories-button_wrap">
          <button className="categories-target">Pop</button>
        </div>
      </section>
      <section className="select-wrapper">
        <div>
          <select name="category" id="category-select" className="category-select">
            <option defaultChecked disabled value="">Select a category</option>
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
