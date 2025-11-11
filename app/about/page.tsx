"use client";

import styles from "./About.module.css";
import Header from "../Components/Header/Header";
import Footer from "../Components/Footer/Footer";

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <Header />

      <section className={styles.hero}>
        
        <div className={styles.heroText}>
          <div className={styles.heroTextInner}>
            
            <h1 className={styles.title}>About</h1>

            <div className={styles.lead}>
              <p>
                Every morning, choosing what to wear can be a challenge. Our
                personal style app helps you manage your wardrobe digitally,
                create outfits effortlessly, and receive AI-powered style
                recommendations.
              </p>

              <p>
                The goal is simple: to combine technology and fashion so everyone
                can express their personal style — without needing a stylist.
              </p>

              <p>
                The app also encourages mindful consumption, creativity,
                self-expression, and positive daily inspiration.
              </p>

              <p>
                Ultimately, it transforms getting dressed from a routine task
                into an enjoyable experience of style, confidence, and
                self-discovery.
              </p>
            </div>

          </div>
        </div>

        <div className={styles.heroImage}>
          <img src="/about/hero.webp" alt="About Hero Image" />
        </div>

      </section>
            <Footer />
      
    </div>
  );
}
