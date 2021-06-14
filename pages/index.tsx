import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";

export default function Home() {
  return (
    <div>
      <header>
        <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
        <h3>I'm Listening</h3>
        <ul>
          <li>
            <a href="#">Home</a>
          </li>
          <li>
            <a href="#">Latest</a>
          </li>
          <li>
            <a href="#">Popular</a>
          </li>
        </ul>
        <ul>
          <li>
            <a href="#">Login</a>
          </li>
          <li>
            <a href="#">Sign up</a>
          </li>
        </ul>
      </header>
    </div>
  );
}
