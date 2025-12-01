import { useState, useEffect, useRef } from "react";
import NewLook from "@/app/Components/NewLook/NewLook";
import styles from "./MobileNewLookBanner.module.css";
import down from "../../../public/down.png";
import Image from "next/image";

export default function MobileNewLookBanner({
  setInspirationColors,
  lookMode,
  onModeChange,
}: {
  setInspirationColors: React.Dispatch<React.SetStateAction<string[]>>;
  lookMode: "default" | "inspiration";
  onModeChange: (mode: "default" | "inspiration") => void;
}) {
  const [open, setOpen] = useState(false);
  const [bottomOffset, setBottomOffset] = useState(20);
  const footerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    footerRef.current = document.querySelector("footer");

    const handleScroll = () => {
      if (!footerRef.current) return;

      const footerTop = footerRef.current.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;
      const spaceBelow = footerTop - windowHeight;

      setBottomOffset(spaceBelow < 20 ? 20 - spaceBelow : 20);
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);
    handleScroll(); 
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
   <div>
    <div className={styles.container}>
      {!open && (
        <div
          className={styles.downFixed}
          style={{ bottom: `${bottomOffset}px` }}
          onClick={() => setOpen(true)}
        >
          <Image
            src={down}
            alt="Open look builder"
            width={56}
            height={56}
            className={styles.introIcon}
          />
        </div>
      )}

      <div
        className={styles.newLookMobileBanner}
        style={{ bottom: `${bottomOffset}px` }}
        onClick={() => setOpen(!open)}
      >
        <div className={styles.text}>
          <span>create your next outfit</span>
        </div>
      </div>
</div>
      <div
        className={`${styles.newLookMobilePanel} ${open ? styles.open : ""}`}
        style={{ bottom: `${bottomOffset + 70}px` }} 
      >
        <NewLook
          setInspirationColors={setInspirationColors}
          lookMode={lookMode}
          onModeChange={onModeChange}
        />
      </div>
   </div>
  );
}
