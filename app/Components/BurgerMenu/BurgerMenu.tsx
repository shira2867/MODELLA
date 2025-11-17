'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import styles from './BurgerMenu.module.css';
import logo from '../../../public/logo.png';
import user from '../../../public/user.png';
import menu from '../../../public/menu.png';
import close from '../../../public/remove.png';

export default function BurgerMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <header className={styles.header}>
      <div className={styles.logoContainer}>
        <Link href="/">
          <Image src={logo} alt="Logo" width={200} height={200} />
        </Link>
      </div>

      {/* תפריט */}
      <nav className={`${styles.nav} ${isOpen ? styles.open : ''}`}>
        <Link href="/home" className={styles.link} onClick={() => setIsOpen(false)}>Home</Link>
        <Link href="/about" className={styles.link} onClick={() => setIsOpen(false)}>About</Link>
        <Link href="/mycloset" className={styles.link} onClick={() => setIsOpen(false)}>My Closet</Link>
        <Link href="/newcloth" className={styles.link} onClick={() => setIsOpen(false)}>New Cloth</Link>
        <Link href="/mylooks" className={styles.link} onClick={() => setIsOpen(false)}>My Looks</Link>
        <Link href="/stylefeed" className={styles.link} onClick={() => setIsOpen(false)}>Style Feed</Link>
      </nav>

      {/* בורגר וכפתור משתמש */}
      <div className={styles.rightControls}>
        <button className={styles.userButton}>
          <Image src={user} alt="User" width={50} height={50} />
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

      {/* Overlay */}
      {isOpen && <div className={styles.overlay} onClick={() => setIsOpen(false)} />}
    </header>
  );
}
