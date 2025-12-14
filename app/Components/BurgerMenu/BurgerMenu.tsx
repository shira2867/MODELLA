"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import styles from "./BurgerMenu.module.css";
import logo from "../../../public/logo.png";
import menu from "../../../public/menu.png";
import close from "../../../public/remove.png";
import { useUserStore } from "@/store/userStore";

export default function BurgerMenu() {
  const navLinks = [
    { label: "Home", href: "/home" },
    { label: "About", href: "/about" },
    { label: "My Closet", href: "/mycloset" },
    { label: "New Cloth", href: "/newcloth" },
    { label: "My Looks", href: "/mylooks" },
    { label: "Style Feed", href: "/stylefeed" },
    { label: "Wishlist", href: "/checklist" },
  ];

  const [isOpen, setIsOpen] = useState(false);
  const user = useUserStore((state) => state.user);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <header className={styles.header}>
      <div className={styles.logoContainer}>
        <Link href="/">
          <Image src={logo} alt="Logo" width={200} height={100} />
        </Link>
      </div>

      <nav className={`${styles.nav} ${isOpen ? styles.open : ""}`}>
        {navLinks.map((link, i) => (
          <Link
            key={i}
            href={link.href}
            className={styles.link}
            onClick={() => setIsOpen(false)}
          >
            {link.label}
          </Link>
        ))}
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
            <Image src={close} alt="Close" width={50} height={50} />
          ) : (
            <Image src={menu} alt="Menu" width={50} height={50} />
          )}
        </button>
      </div>

      {isOpen && (
        <div className={styles.overlay} onClick={() => setIsOpen(false)} />
      )}
    </header>
  );
}
