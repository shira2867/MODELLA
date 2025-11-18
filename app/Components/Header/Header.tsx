"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import styles from "./Header.module.css";
import logo from "../../../public/logo.png";
import user from "../../../public/user.png";
import menu from "../../../public/menu.png";
import close from "../../../public/remove.png";
import { useUserStore } from "@/store/userStore"; // תוודאי שהנתיב נכון

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const user = useUserStore((state) => state.user);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <header className={styles.header}>
      <div className={styles.logoContainer}>
        <Link href="/">
          <Image src={logo} alt="Logo" width={250} height={150} />
        </Link>
      </div>

      <nav className={`${styles.nav} ${isOpen ? styles.open : ""}`}>
        <Link
          href="/home"
          className={styles.link}
          onClick={() => setIsOpen(false)}
        >
          Home
        </Link>
        <Link
          href="/about"
          className={styles.link}
          onClick={() => setIsOpen(false)}
        >
          About
        </Link>
        <Link
          href="/mycloset"
          className={styles.link}
          onClick={() => setIsOpen(false)}
        >
          My Closet
        </Link>
        <Link
          href="/newcloth"
          className={styles.link}
          onClick={() => setIsOpen(false)}
        >
          New Cloth
        </Link>
        <Link
          href="/mylooks"
          className={styles.link}
          onClick={() => setIsOpen(false)}
        >
          My Looks
        </Link>
        <Link
          href="/stylefeed"
          className={styles.link}
          onClick={() => setIsOpen(false)}
        >
          Style Feed
        </Link>
      </nav>

      <div className={styles.rightControls}>
<button className={styles.userButton}>
  {user?.profileImage ? (
    <Image
      src={user.profileImage}
      alt="User Icon"
      width={50}
      height={50}
      className={styles.userImage}
    />
  ) : user?.name ? (
    <div className={styles.userInitial}>
      {user.name.charAt(0).toUpperCase()}
    </div>
  ) : (
    <div className={styles.userInitial}>U</div> 
  )}
</button>


        <button
          className={styles.hamburger}
          onClick={toggleMenu}
          aria-label="Toggle Menu"
        >
          {isOpen ? (
            <Image src={close} alt="Close Menu" width={50} height={50} />
          ) : (
            <Image src={menu} alt="Open Menu" width={50} height={50} />
          )}
        </button>
      </div>

      {isOpen && (
        <div className={styles.overlay} onClick={() => setIsOpen(false)} />
      )}
    </header>
  );
}
