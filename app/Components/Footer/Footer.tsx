"use client";
import styles from "./Footer.module.css";
import Link from "next/link";
import {
  FaInstagram,
  FaYoutube,
  FaFacebook,
  FaPinterest,
  FaTwitter,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.column}>
          <h3>Info</h3>
          <Link href={"/home"}>Home</Link>
          <Link href="/notes">Check List</Link>
          <Link href="/about">About My Closet</Link>
        </div>
        <div className={styles.column}>
          <h3>Looks</h3>
          <Link href="/mycloset">Create Look</Link>
          <Link href="/mylooks">My Looks</Link>
          <Link href="/stylefeed">Style Feed</Link>
        </div>

        <div className={styles.column}>
          <h3>Account</h3>
          <Link href={"/login"}>Login</Link>
          <Link href="/register">Register</Link>
          <Link href="/profile">Update Profile</Link>
        </div>
      </div>

      <div className={styles.social}>
        <a
          href="https://www.instagram.com/cladwellapp/"
          target="_blank"
          aria-label="Instagram"
        >
          <FaInstagram />
        </a>
        <a
          href="https://www.youtube.com/Cladwell/"
          target="_blank"
          aria-label="YouTube"
        >
          <FaYoutube />
        </a>
        <a
          href="https://www.facebook.com/cladwellapp/"
          target="_blank"
          aria-label="Facebook"
        >
          <FaFacebook />
        </a>
        <a
          href="https://www.pinterest.com/cladwellapp/"
          target="_blank"
          aria-label="Pinterest"
        >
          <FaPinterest />
        </a>
        <a
          href="https://twitter.com/cladwellapp"
          target="_blank"
          aria-label="Twitter"
        >
          <FaTwitter />
        </a>
      </div>
    </footer>
  );
}
