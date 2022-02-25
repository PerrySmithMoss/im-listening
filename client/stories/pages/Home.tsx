import React from "react";

import { Navbar } from "../components/Navbar/Navbar";
import { Header } from "../components/Home/Header";
import { WeeklyMostPopular } from "../components/Home/WeeklyMostPopular/WeeklyMostPopular";
import { Categories } from "../components/Home/Categories";
import { ListOfUserPosts } from "../components/Home/UserPosts/ListOfUserPosts";

export interface HomeProps {
  user?: {};
  onLogin: () => void;
  onLogout: () => void;
  onCreateAccount: () => void;
}

export const Home: React.FC<HomeProps> = ({
  user,
  onLogin,
  onLogout,
  onCreateAccount,
}) => (
  <article className="home-container">
    <Navbar
      primary={true}
      user={user}
      onLogin={onLogin}
      onLogout={onLogout}
      onCreateAccount={onCreateAccount}
    />
    <Header />
    <WeeklyMostPopular />
    <Categories />
    {/* <ListOfUserPosts /> */}
  </article>
);
