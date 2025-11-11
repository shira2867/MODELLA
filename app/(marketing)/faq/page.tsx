"use client";

import styles from "./FAQ.module.css";
import Header from "../../Components/Header/Header";
import Footer from "../../Components/Footer/Footer";

export default function FAQPage() {
  return (
    <div className={styles.page}>
      <Header />

      <section className={styles.hero}>
        <div className={styles.heroText}>
          <div className={styles.heroTextInner}>
            <h1 className={styles.title}>FAQ</h1>

            <div className={styles.lead}>
              <p>
                Welcome to the Help Center. Here you’ll find answers to common
                questions about managing your digital closet, creating outfits,
                and getting AI-powered recommendations.
              </p>
              <p>
                If you don’t see your question here, reach out to us via the
                support link inside the app.
              </p>
            </div>
          </div>
        </div>

        <div className={styles.heroImage}>
          <img src="/faq/3.jpg" alt="About Hero Image" />
        </div>
      </section>

      <section className={styles.faqSection}>
        <div className={styles.faqInner}>
          <ul className={styles.faqList}>
            <li className={styles.faqItem}>
              <details>
                <summary className={styles.q}>
                  What is this app and who is it for?
                </summary>
                <div className={styles.a}>
                  It’s a personal style app that helps you organize your
                  wardrobe, create outfits, and get AI suggestions tailored to
                  your preferences. It’s great for anyone who wants a smarter,
                  simpler way to get dressed.
                </div>
              </details>
            </li>

            <li className={styles.faqItem}>
              <details>
                <summary className={styles.q}>
                  How do I add items to my digital closet?
                </summary>
                <div className={styles.a}>
                  Go to <strong>Items → Add</strong>, upload a photo, and fill
                  in the basics (category, color, season, tags). For best
                  results, shoot the item on a clean background with good light.
                </div>
              </details>
            </li>

            <li className={styles.faqItem}>
              <details>
                <summary className={styles.q}>
                  Can the AI recommend outfits from my own items?
                </summary>
                <div className={styles.a}>
                  Yes. Choose a template from the general looks library or start
                  a custom request. The AI will match your saved items by color,
                  category, and style to build a personalized look.
                </div>
              </details>
            </li>

            <li className={styles.faqItem}>
              <details>
                <summary className={styles.q}>
                  How does the “Templates Library” work?
                </summary>
                <div className={styles.a}>
                  Templates are ready-made outfit ideas (e.g., “Casual Summer,”
                  “Smart Office”). Pick one and tap <em>Personalize</em> to let
                  the AI swap in items from your closet that fit the vibe.
                </div>
              </details>
            </li>

            <li className={styles.faqItem}>
              <details>
                <summary className={styles.q}>
                  Do you store my photos and data securely?
                </summary>
                <div className={styles.a}>
                  We store only what’s needed to run the app (item photos,
                  tags, and your account details). Recommendations use concise
                  item descriptions (e.g., “white shirt, navy pants”) rather
                  than raw photos. You can delete your account and data anytime
                  from <strong>Profile → Settings</strong>.
                </div>
              </details>
            </li>

            <li className={styles.faqItem}>
              <details>
                <summary className={styles.q}>
                  Tips for better item photos?
                </summary>
                <div className={styles.a}>
                  Use a plain background, natural light, and center the item in
                  the frame. Avoid heavy shadows or filters so colors remain
                  true.
                </div>
              </details>
            </li>

            <li className={styles.faqItem}>
              <details>
                <summary className={styles.q}>
                  Can I get recommendations based on weather or events?
                </summary>
                <div className={styles.a}>
                  Absolutely. In the Recommendations screen, select{" "}
                  <em>Weather</em> or <em>Occasion</em> (e.g., wedding, work,
                  weekend). The AI will suggest suitable outfits from your
                  closet.
                </div>
              </details>
            </li>

            <li className={styles.faqItem}>
              <details>
                <summary className={styles.q}>
                  How do I edit or remove an item or outfit?
                </summary>
                <div className={styles.a}>
                  Open the item or outfit page and choose{" "}
                  <strong>Edit</strong> or <strong>Delete</strong>. Changes are
                  saved instantly and reflected in future recommendations.
                </div>
              </details>
            </li>

            <li className={styles.faqItem}>
              <details>
                <summary className={styles.q}>
                  Can I share outfits with friends?
                </summary>
                <div className={styles.a}>
                  Yes. On any saved outfit, tap <strong>Share</strong> to
                  generate a link or image you can send via your favorite apps.
                </div>
              </details>
            </li>

            <li className={styles.faqItem}>
              <details>
                <summary className={styles.q}>
                  I forgot my password — what should I do?
                </summary>
                <div className={styles.a}>
                  Go to the login screen and select{" "}
                  <strong>Forgot Password</strong>. We’ll email you a secure
                  link to reset it.
                </div>
              </details>
            </li>

            <li className={styles.faqItem}>
              <details>
                <summary className={styles.q}>
                  Is the app free? Will there be premium features?
                </summary>
                <div className={styles.a}>
                  The core experience is free. We plan optional premium features
                  (advanced analytics, unlimited templates, pro export tools) in
                  the future.
                </div>
              </details>
            </li>

            <li className={styles.faqItem}>
              <details>
                <summary className={styles.q}>
                  How can I contact support?
                </summary>
                <div className={styles.a}>
                  Open <strong>Profile → Help & Support</strong> and send us a
                  message. We usually reply within 1–2 business days.
                </div>
              </details>
            </li>
          </ul>
        </div>
      </section>
            <Footer />
      
    </div>
  );
}
