"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import styles from "./Header.module.css";
import logo from "../../../public/logo.png";
import menu from "../../../public/menu.png";
import close from "../../../public/remove.png";
import { useUserStore } from "@/store/userStore";
import { signOutUser } from "@/app/firebase/authActions";
import { useRouter } from "next/navigation";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const user = useUserStore((state) => state.user);
  const router = useRouter();

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleClick = () => {
    const ok = confirm("Are you sure you want to log out?");
    if (ok) {
      signOutUser();
      router.push("/welcome");
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.logoContainer}>
        <Link href="/">
          <Image src={logo} alt="Logo" width={250} height={150} />
        </Link>
      </div>

      <nav className={`${styles.nav} ${isOpen ? styles.open : ""}`}>
        {["Home", "About", "My Closet", "New Cloth", "My Looks", "Style Feed", "Checklist"].map((text, i) => (
          <Link
            key={i}
            href={`/${text.toLowerCase().replace(/\s/g, "")}`}
            className={styles.link}
            onClick={() => setIsOpen(false)}
          >
            {text}
          </Link>
        ))}
      </nav>

      <div className={styles.rightControls}>
        <button className={styles.userButton} onClick={handleClick}>
          {user?.profileImage ? (
            <Image
              src={user.profileImage}
              alt="profileImage"
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

        <button className={styles.hamburger} onClick={toggleMenu} aria-label="Toggle Menu">
          {isOpen ? <Image src={close} alt="Close Menu" width={50} height={50} /> : <Image src={menu} alt="Open Menu" width={50} height={50} />}
        </button>
      </div>

      {isOpen && <div className={styles.overlay} onClick={() => setIsOpen(false)} />}
    </header>
  );
}
