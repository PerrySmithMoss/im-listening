import Image from "next/image";
import styles from "../Navbar/navbar.module.css";

export function Logo() {
  return (
    <Image
      className={styles.headphonesLogo}
      src="/assets/headphones2.svg"
      alt=""
      height={40}
      width={40}
    />
  );
}
