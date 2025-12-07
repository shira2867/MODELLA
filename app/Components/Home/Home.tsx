"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CldImage } from "next-cloudinary";
import Image from "next/image";
import styles from "./Home.module.css";
import Footer from "../Footer/Footer";
import Header from "../Header/Header";
import { useUserStore } from "@/store/userStore";
import { FiStar } from "react-icons/fi";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import arrowDown from "../../../public/img/down.png";
import sunIcon from "../../../public/img/sunny_17145991.png";
import WeatherWidget from "../WeatherWidget/WeatherWidget";
import { StepProps } from "@/types/types";

const heroImages = [
  "slider_6_fpl8b5",
  "slider_5_z5v73p",
  "slider_7_e93yg3",
  // "slider_9_j36kbz.avif",
  "slider_8_lgv50b.avif",
  "oejxpjs8o2viabihjkyx.webp",
  "f469db1182d3b9da38c505eb2d7db785_j1g48w.jpg",
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
      // imageUrl: "step_1_kgktj8",
      img: "/home/360dd27e6cd686b81e0c3a1ad5ebec8a_1000x.webp",

      bullets: [
        "Add clothes in 2 clicks",
        "Organize by category or season",
        "Snap photos for easy reference",
      ],
    },
    {
      title: "Step 2: Daily Outfits",
      description:
        "Expertly styled outfits every day, personalized for your weather and activities. Choose a recommended outfit, edit the ones you like, or build your own.",
      // imageUrl: "step_2_b4kjht",
      img: "/home/as.jpg",
      bullets: [
        "Receive daily outfit suggestions",
        "Customize with your favorites",
        "Plan ahead for the week",
      ],
    },
    {
      title: "Step 3: Love What You Wear",
      description:
        "Save time, clear the clutter, and stop spending money. Be free to be you. Sustainable fashion is about knowing your personal style so you can be more intentional.",
      // imageUrl: "step_3_hggv5q",
      img: "/home/aa.jpg",

      bullets: [
        "Feel confident every day",
        "Stay sustainable & intentional",
        "Simplify your wardrobe decisions",
      ],
    },
  ];

  const user = useUserStore((state) => state.user);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showPopup, setShowPopup] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const rowRef = useRef<HTMLDivElement>(null);

  const stepsSectionRef = useRef<HTMLElement | null>(null);
  const router = useRouter();

  const handleClick = () => {
    router.push("/newcloth"); // כתובת העמוד של יצירת פריט חדש
  };
  const nextVideo = () => {
    if (activeIndex !== null)
      setActiveIndex((prev) => (prev! + 1) % videos.length);
  };

  const prevVideo = () => {
    if (activeIndex !== null)
      setActiveIndex((prev) => (prev! - 1 + videos.length) % videos.length);
  };
  // const getCloudinaryUrl = (id: string) =>
  //   `https://res.cloudinary.com/dfrgvh4hf/image/upload/v123456/${id}.jpg`;

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

  const scrollToSteps = useCallback(() => {
    stepsSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);
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
    <div className={styles.page}>
      <Header />

      {/* {showPopup && user && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupContent}>
            <button
              className={styles.closeButton}
              onClick={() => setShowPopup(false)}
            ></button>
            <div className={styles.welcomeIconWrapper}>
              <FiStar className={styles.welcomeIcon} />
            </div>
            <h1 className={styles.title}>Hello, {user?.name} </h1>
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
      )} */}

      <main className={styles.content}>
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
            <div className={styles.heroOverlay}>
              <div className={styles.heroCopy}>
                <p className={styles.heroEyebrow}>
                  Personal styling for real life
                </p>
                <h1>Luxury wardrobe planning without the fuss</h1>
                <p className={styles.heroSubcopy}>
                  Organize your closet, browse curated outfits, and let the
                  weather-ready stylist guide your mornings.
                </p>
                <div className={styles.heroActions}>
                  <button
                    type="button"
                    className={styles.heroPrimary}
                    onClick={scrollToSteps}
                  >
                    Explore the experience
                  </button>
                  <button
                    type="button"
                    className={styles.heroSecondary}
                    onClick={() => setIsOpen((prev) => !prev)}
                    aria-pressed={isOpen}
                  >
                    Check today&apos;s weather{" "}
                    <Image
                      src={sunIcon}
                      alt="sun icon"
                      width={56}
                      height={56}
                      className={styles.bounceIcon}
                    />
                  </button>
                </div>
              </div>
              {isOpen && (
                <div className={styles.weatherBannerWrapper}>
                  <div className={styles.weatherContainer}>
                    <button
                      className={styles.closeBtn}
                      onClick={() => setIsOpen(false)}
                      aria-label="Close weather widget"
                    >
                      ✕
                    </button>
                    <WeatherWidget />
                  </div>
                </div>
              )}
            </div>
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
          </div>
        </section>

        {/* <section className={styles.stepsShell} id="steps" ref={stepsSectionRef}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>How it works</p>
            <h2>Our three-step styling ritual</h2>
            <p>
              Each feature feels handcrafted so you can glide from inspiration
              to outfit planning without losing your signature taste.
            </p>
          </div>
          <div className={styles.stepsWrapper}>
            {stepsData.map((step, index) => (
              <Step
                key={index}
                title={step.title}
                description={step.description}
                imageUrl={step.imageUrl}
                reverse={index % 2 !== 0}
              />
            ))}
          </div>
        </section> */}
        {/* <section className={styles.stepsShell} id="steps">
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>How it works</p>
            <h2>Our three-step styling ritual</h2>
            <p className={styles.stepsIntro}>
              Glide from inspiration to outfit planning effortlessly. Each step
              is designed to make your mornings luxurious and intentional.
            </p>
          </div>

          <div className={styles.stepsWrapper}>
            {stepsData.map((step, index) => (
              <Step
                key={index}
                title={step.title}
                description={step.description}
                imageUrl={step.imageUrl}
                reverse={index % 2 !== 0}
                bullets={step.bullets}
              />
            ))}
          </div>

          <div className={styles.stepsCTA}>
            <button className={styles.heroPrimary}>Start Styling</button>
          </div>
        </section> */}
        <section className={styles.stepsShell} id="steps">
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>How it works</p>
            <h2>Our three-step styling ritual</h2>
            <p className={styles.stepsIntro}>
              Glide from inspiration to outfit planning effortlessly. Each step
              is designed to make your mornings luxurious and intentional.
            </p>
          </div>

          <div className={styles.stepsWrapper}>
            {stepsData.map((step, index) => (
              <div
                key={index}
                className={`${styles.stepSection} ${
                  index % 2 !== 0 ? styles.reverse : ""
                }`}
              >
                <div className={styles.stepImageWrapper}>
                  <img
                    // src={getCloudinaryUrl(step.imageUrl)}
                    src={step.img}
                    className={styles.stepImageWide}
                  />
                </div>
                <div className={styles.stepContent}>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                  {step.bullets && (
                    <ul className={styles.stepBullets}>
                      {step.bullets.map((bullet, idx) => (
                        <li key={idx}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.stepsCTA}>
            <button className={styles.heroPrimary} onClick={handleClick}>
              Start Styling
            </button>
          </div>
        </section>

        {/* <section className={styles.aboutSection} id="about">
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>About</p>
            <h2>Effortless luxury every morning</h2>
            <p>
              YourCloset curates what you own, suggests weather-ready looks, and
              keeps inspiration close so every outfit feels intentional.
            </p>
          </div>
          <div className={styles.aboutCard}>
            <p>
              Organize garments, drag pieces into new combinations, and let our
              styling guidance do the hard work. Stay sustainable, feel
              polished, and reclaim your time.
            </p>
          </div>
        </section> */}
        <section className={styles.testimonialsSection}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>What people say</p>
            <h2>Real experiences from real users</h2>
            <p>YourCloset is already transforming morning routines.</p>
          </div>

          <div className={styles.testimonialsGrid}>
            {[
              {
                name: "Sarah M.",
                text: "This app changed the way I choose outfits. I save so much time and feel more confident every day.",
                stars: 5,
                img: "/people/premium_photo-1688572454849-4348982edf7d.avif",
              },
              {
                name: "Emily R.",
                text: "Never realized how many clothes I had until I organized them here. The daily looks are spot-on!",
                stars: 5,
                img: "/people/images (1).jpg",
              },
              {
                name: "Julia K.",
                text: "Feels like having my own stylist. Simple, elegant, and genuinely useful.",
                stars: 4,
                img: "/people/images.jpg",
              },
            ].map((item, index) => (
              <div key={index} className={styles.testimonialCard}>
                <img
                  src={item.img}
                  alt={item.name}
                  className={styles.testimonialAvatar}
                />
                <p className={styles.testimonialText}>"{item.text}"</p>
                <div className={styles.starsRow}>
                  {Array.from({ length: item.stars }).map((_, i) => (
                    <FiStar key={i} className={styles.starIcon} />
                  ))}
                </div>
                <h4 className={styles.testimonialName}>– {item.name}</h4>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.videosWrapper}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Inspiration</p>
            <h2>Daily outfit films</h2>
            <p>
              Tap to expand full screen and explore seasonal looks captured by
              our community.
            </p>
          </div>
          <div className={styles.carouselContainer}>
            <button
              className={styles.arrowLeft}
              onClick={scrollLeft}
              aria-label="Scroll looks left"
            >
              ◀
            </button>
            <div className={styles.videosRow} ref={rowRef}>
              {videos.map((video, index) => (
                <video
                  key={index}
                  src={video}
                  muted
                  loop
                  playsInline
                  className={styles.videoItem}
                  onMouseEnter={(e) => e.currentTarget.play()}
                  onMouseLeave={(e) => e.currentTarget.pause()}
                  onClick={() => setActiveIndex(index)}
                />
              ))}
            </div>
            <button
              className={styles.arrowRight}
              onClick={scrollRight}
              aria-label="Scroll looks right"
            >
              ▶
            </button>
          </div>
        </section>
      </main>

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
