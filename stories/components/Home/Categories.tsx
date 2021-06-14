import React from "react";
import "./categories.css";

interface CategoriesProps {}

export const Categories: React.FC<CategoriesProps> = ({}) => {
  return (
    <section className="categories-wrap">
      <div className="categories-button_wrap">
        <button className="categories-target categories-target_active" >All Categories</button>
      </div>
      <div className="categories-button_wrap">
        <button className="categories-target" >Hip-Hop</button>
      </div>
      <div className="categories-button_wrap">
        <button className="categories-target" >Dance</button>
      </div>
      <div className="categories-button_wrap">
        <button className="categories-target" >Electronic</button>
      </div>
      <div className="categories-button_wrap">
        <button className="categories-target" >Pop</button>
      </div>
    </section>
  );
};
