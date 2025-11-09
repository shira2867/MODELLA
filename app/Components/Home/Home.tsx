"use client";
import React, { useState, useEffect } from "react";
import { CldImage } from "next-cloudinary";
import styles from "./Home.module.css";
import Footer from "../Footer/Footer";
import Header from "../Header/Header";
import WeatherWidget from "../WeatherWidget/WeatherWidget";

type StepProps = {
  title: string;
  description: string;
  imageUrl?: string;
  reverse?: boolean;
};
const heroImages = [
  "slider_1_jcj9jm",
  "slider_2_w6kq3n",
  "slider_3_cya9bm",
  "slider_4_vhhgxa",
  "slider_5_z5v73p",
  "slider_6_fpl8b5",
  "slider_7_e93yg3",
];
const videos = [
  "/videos/snaptik_7480615445620378902_v2.mp4",
  "/videos/Casual Winter Outfit.mp4",
  "/videos/An outfit I’ve been loving recently.mp4",

  "/videos/Heute gibt es mal wieder ganz klassisch meine Ralph Lauren Old money fits.mp4",

  "/videos/BELLE שמלות ערב2.mp4",
];
function Step({ title, description, imageUrl, reverse }: StepProps) {
  return (
    <section
      className={`${styles.stepSection} ${reverse ? styles.reverse : ""}`}
    >
      {imageUrl && (
        <div className={styles.stepImageWrapper}>
          <CldImage
            src={imageUrl}
            width={500}
            height={500}
            crop="fill"
            className={styles.stepImage}
            alt={title}
          />
        </div>
      )}
      <div className={styles.stepContent}>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </section>
  );
}

export default function HomePage() {
  const stepsData = [
    {
      title: "Step 1: Your Closet",
      description:
        "Quickly add all your favorite clothes into the app, and keep them organized in one place.",
      imageUrl: "step_1_kgktj8",
    },
    {
      title: "Step 2: Daily Outfits",
      description:
        "Expertly styled outfits every day, personalized for your weather and activities. Choose a recommended outfit, edit the ones you like, or build your own. You can even plan outfits.",
      imageUrl: "step_2_b4kjht",
    },
    {
      title: "Step 3: Love What You Wear",
      description:
        "Save time, clear the clutter, and stop spending money. Be free to be you. Sustainable fashion is about knowing your personal style so you can be more intentional.",
      imageUrl: "step_3_hggv5q",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);
  return (
    <div className={styles.container}>
      <Header />

      <section className={styles.heroSection}>
        <div className={styles.sliderWrapper}>
          <CldImage
            src={heroImages[currentIndex]}
            width="1920"
            height="1080"
            alt={`Hero ${currentIndex + 1}`}
            className={styles.heroImage}
            crop={{ type: "fill" }}
            gravity="auto"
          />
          <div className={styles.dots}>
            {heroImages.map((_, index) => (
              <span
                key={index}
                className={`${styles.dot} ${
                  index === currentIndex ? styles.activeDot : ""
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>

          <div className={styles.weatherBanner}>
            <WeatherWidget />
          </div>
        </div>
      </section>
      <section className={styles.stepsWrapper} id="steps">
        {stepsData.map((step, index) => (
          <Step
            key={index}
            title={step.title}
            description={step.description}
            imageUrl={step.imageUrl}
            reverse={index % 2 !== 0}
          />
        ))}
      </section>

      <section className={styles.aboutSection} id="about">
        <h2>About YourCloset</h2>
        <p>
          YourCloset helps you organize your wardrobe, create daily outfit
          combinations, and make fashion fun and effortless. No more stress in
          choosing what to wear – your perfect style is just a click away.
        </p>
      </section>
      <div className={styles.videosWrapper}>
        <h2 className={styles.title}>Daily Outfit Inspo ✨</h2>
        <div className={styles.videosRow}>
          {videos.map((video, index) => (
            <video
              key={index}
              src={video}
              muted
              loop
              className={styles.videoItem}
              onMouseEnter={(e) => e.currentTarget.play()}
              onMouseLeave={(e) => e.currentTarget.pause()}
            />
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
