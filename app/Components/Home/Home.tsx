"use client";
import React, { useState, useEffect, useRef } from "react";
import { CldImage } from "next-cloudinary";
import Image from "next/image";
import styles from "./Home.module.css";
import Footer from "../Footer/Footer";
import Header from "../Header/Header";
import { FiStar } from "react-icons/fi";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import arrowDown from "../../../public/img/down.png";
import sunIcon from "../../../public/img/sunny_17145991.png";
import WeatherWidget from "../WeatherWidget/WeatherWidget";

type StepProps = {
  title: string;
  description: string;
  imageUrl?: string;
  reverse?: boolean;
};
const heroImages = [
  "slider_1_jcj9jm",
  "slider_5_z5v73p",
  "slider_6_fpl8b5",
  "slider_7_e93yg3",
  "slider_9_j36kbz.avif",
  "slider_8_lgv50b.avif",
];
const videos = [
  "  https://res.cloudinary.com/dfrgvh4hf/video/upload/v1762951355/video_1_jln9qa.mp4",
  "https://res.cloudinary.com/dfrgvh4hf/video/upload/v1762951802/video_2_u2glay.mp4",
  "https://res.cloudinary.com/dfrgvh4hf/video/upload/v1762951777/video_3_axlytt.mp4",
  "https://res.cloudinary.com/dfrgvh4hf/video/upload/v1762952514/video_4_b0l3sb.mp4",
  "https://res.cloudinary.com/dfrgvh4hf/video/upload/v1762951817/video_5_cgo17i.mp4",
  "https://res.cloudinary.com/dfrgvh4hf/video/upload/v1763296347/video_8_uby9kc.mp4",
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
  const [showPopup, setShowPopup] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const rowRef = useRef<HTMLDivElement>(null);

  const nextVideo = () => {
    if (activeIndex !== null)
      setActiveIndex((prev) => (prev! + 1) % videos.length);
  };

  const prevVideo = () => {
    if (activeIndex !== null)
      setActiveIndex((prev) => (prev! - 1 + videos.length) % videos.length);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (activeIndex !== null) {
        if (e.key === "ArrowDown") nextVideo();
        else if (e.key === "ArrowUp") prevVideo();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeIndex]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (activeIndex === null) return;
      if (e.deltaY > 10) nextVideo();
      else if (e.deltaY < -10) prevVideo();
    };
    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [activeIndex]);
  useEffect(() => {
    if (activeIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [activeIndex]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).classList.contains(styles.overlay)) {
      setActiveIndex(null);
    }
  };
  const scrollLeft = () => {
    rowRef.current?.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = () => {
    rowRef.current?.scrollBy({ left: 300, behavior: "smooth" });
  };
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    const timer = setTimeout(() => setShowPopup(false), 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className={styles.container}>
      <Header />

      {showPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupContent}>
            <button
              className={styles.closeButton}
              onClick={() => setShowPopup(false)}
            ></button>
            <div className={styles.welcomeIconWrapper}>
              <FiStar className={styles.welcomeIcon} />
            </div>
            <h1 className={styles.title}>Good morning, Rachel </h1>
            <p className={styles.subtitle}>Ready to style your day?</p>
            <div className={styles.buttonContainer}>
              <button
                className={styles.button}
                onClick={() => setShowPopup(false)}
              >
                Let's go!
              </button>
            </div>
          </div>
        </div>
      )}

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
          <div className={styles.weatherBannerWrapper}>
            <div className={styles.weatherContainer}>
              {!isOpen ? (
                <div className={styles.closed}>
                  <h1 className={styles.title}>
                    What’s the weather today? <br /> Style your outfit
                    accordingly!
                  </h1>
                  <div className={styles.iconsRow}>
                    <Image
                      src={arrowDown}
                      alt="down arrow"
                      width={40}
                      height={40}
                      className={styles.bounce}
                    />
                  </div>
                  <button onClick={() => setIsOpen(true)}>
                    <Image
                      src={sunIcon}
                      alt="sun icon"
                      width={60}
                      height={60}
                      className={styles.bounce}
                    />
                  </button>
                </div>
              ) : (
                <div className={styles.opened}>
                  <button
                    className={styles.closeBtn}
                    onClick={() => setIsOpen(false)}
                  >
                    ✕
                  </button>
                  <WeatherWidget />
                </div>
              )}
            </div>
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
        <h2 className={styles.title}>Daily Outfit Inspo </h2>
        <div className={styles.carouselContainer}>
          <button className={styles.arrowLeft} onClick={scrollLeft}>
            ◀
          </button>
          <div className={styles.videosRow} ref={rowRef}>
            {videos.map((video, index) => (
              <video
                key={index}
                src={video}
                muted
                loop
                className={styles.videoItem}
                onMouseEnter={(e) => e.currentTarget.play()}
                onMouseLeave={(e) => e.currentTarget.pause()}
                onClick={() => setActiveIndex(index)}
              />
            ))}
          </div>
          <button className={styles.arrowRight} onClick={scrollRight}>
            ▶
          </button>
        </div>
      </div>

      {activeIndex !== null && (
        <div className={styles.overlay} onClick={handleOverlayClick}>
          <div className={styles.fullscreenContainer}>
            <video
              key={activeIndex}
              src={videos[activeIndex]}
              className={styles.fullscreenVideo}
              autoPlay
              loop
              muted
              playsInline
            />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
