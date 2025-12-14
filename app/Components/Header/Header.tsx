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
  const [profileOpen, setProfileOpen] = useState(false);
  const user = useUserStore((state) => state.user);
  const router = useRouter();

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleProfile = () => setProfileOpen(!profileOpen);

  const handleLogout = () => {
    const ok = confirm("Are you sure you want to log out?");
    if (ok) {
      signOutUser();
      router.push("/welcome");
    }
  };

  const handleUpdateProfile = () => {
    router.push("/profile");
  };

  return (
    <header className={styles.header}>
      <div className={styles.logoContainer}>
        <Link href="/">
          <Image src={logo} alt="Logo" width={250} height={150} />
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
        <button className={styles.userButton} onClick={toggleProfile}>
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

        {profileOpen && (
          <div className={styles.buttons}>
            <button className={styles.profileButton} onClick={handleLogout}>
              Logout
            </button>
            <button
              className={styles.profileButton}
              onClick={handleUpdateProfile}
            >
              update profile
            </button>
          </div>
        )}

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
