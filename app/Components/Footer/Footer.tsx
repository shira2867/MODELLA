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
          <h3>Templates</h3>
          <a href="https://app.cladwell.com/capsules/minimalist-summer-capsule-621834">
            Minimalist Capsule Wardrobe
          </a>
          <a href="https://app.cladwell.com/capsules/french-girl-621843">
            Parisian Capsule Wardrobe
          </a>
          <a href="https://app.cladwell.com/capsules/athletic-639223">
            Athleisure Capsule Wardrobe
          </a>
        </div>

        <div className={styles.column}>
          <h3>Products</h3>
          <a href="#">Pricing</a>
          <a href="/app">App</a>
          <a href="https://cladwell.com/men">For Men</a>
          <a href="/capsule-wardrobe-program">Course</a>
        </div>

        <div className={styles.column}>
          <h3>Company</h3>
          <a href="https://app.cladwell.com">Login</a>
          <Link href="/faq">FAQ</Link>
          <a href="https://cladwell.zendesk.com/hc/en-us/sections/360000415753-Billing-and-Account-">
            Billing & Account
          </a>
          <a href="mailto:hello@cladwell.com">hello@cladwell.com</a>
        </div>

        <div className={styles.column}>
          <h3>About</h3>
          <a href="https://cladwell.com/style-for-good">Our Mission</a>
          <a href="/from-the-founder">From The Founder</a>
          <a href="/capsule-wardrobe-101">Capsule Wardrobe 101</a>
          <a href="/fastfashion">What is Fast Fashion?</a>
          <a href="/stories">Capsule Wardrobe Stories</a>
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

      <div className={styles.bottomLinks}>
        <a href="/terms-of-service">TERMS OF SERVICE</a>
        <a href="/privacy-policy">PRIVACY POLICY</a>
      </div>
    </footer>
  );
}
