// "use client";

// import React, { useState, FC, useCallback } from "react";
// import Image from "next/image";
// import chroma from "chroma-js";
// import styles from "./NewLook.module.css";
// import down from "../../../public/down.png";
// import { useUserStore } from "../../../store/userStore";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { ClothingItem } from "@/types/clothTypes";
// import { LookType } from "@/types/lookTypes";


// type RGB = [number, number, number];

// const COLOR_MAP: Record<string, RGB> = {
//   Red: [255, 0, 0],
//   DarkRed: [139, 0, 0],
//   Pink: [255, 192, 203],
//   Orange: [255, 165, 0],
//   Yellow: [255, 255, 0],
//   SoftYellow: [250, 230, 140],
//   Golden: [228, 205, 125],
//   WarmYellow: [240, 220, 130],
//   Mustard: [204, 153, 0],
//   Green: [0, 128, 0],
//   Blue: [0, 0, 255],
//   DenimBlue: [21, 96, 189],
//   DarkDenim: [10, 45, 100],
//   MediumDenim: [50, 110, 180],
//   LightDenim: [173, 198, 229],
//   LightBlue: [173, 216, 230],
//   Purple: [128, 0, 128],
//   Brown: [121, 85, 61],
//   DarkBrown: [101, 67, 33],
//   Chocolate: [123, 63, 0],
//   Gray: [128, 128, 128],
//   DarkGray: [64, 64, 64],
//   Black: [0, 0, 0],
//   White: [255, 255, 255],
//   Beige: [245, 245, 220],
//   Navy: [0, 0, 128],
//   Indigo: [75, 0, 130],
//   Burgundy: [128, 0, 32],
//   Olive: [85, 107, 47],
//   Teal: [0, 128, 128],
//   Turquoise: [64, 224, 208],
// };


// function isGrayRGB([r, g, b]: RGB): boolean {
//   return Math.max(r, g, b) - Math.min(r, g, b) < 20 && r > 50 && r < 200;
// }

// function isYellowRGB([r, g, b]: RGB): boolean {
//   return r > 180 && g > 150 && b < 100;
// }

// function isBrownRGB([r, g, b]: RGB): boolean {
//   return r > 100 && g > 50 && g < 120 && b < 80;
// }

// function isCyanRGB([r, g, b]: RGB): boolean {
//   return b > 150 && g > 120 && r < 100;
// }

// function isPinkRGB([r, g, b]: RGB): boolean {
//   return r > 200 && g < 150 && b < 180;
// }

// function isDenimRGB([r, g, b]: RGB): boolean {
//   if (b > r && b > g && b - r >= 20 && b - g >= 10 && r >= 60 && g >= 60 && b >= 60 && b <= 185)
//     return true;
//   if (b > r && b > g && b - r >= 10 && b - g >= 5 && r >= 120 && g >= 140 && b >= 160 && b <= 200)
//     return true;
//   return false;
// }

// function isGreenRGB([r, g, b]: RGB): boolean {
//   return g > r && g > b && g >= 80 && g <= 200 && r <= 150 && b <= 150;
// }

// function isBurgundyRGB([r, g, b]: RGB): boolean {
//   return r > 50 && r < 150 && g < 60 && b < 70;
// }

// function isRedRGB([r, g, b]: RGB): boolean {
//   return r > 150 && g < 80 && b < 80;
// }

// function closestColorLAB(rgb: RGB): string {
//   if (isDenimRGB(rgb)) return "Blue";
//   if (isGreenRGB(rgb)) return "Green";
//   if (isRedRGB(rgb)) return "Red";
//   if (isBurgundyRGB(rgb)) return "Burgundy";
//   if (isGrayRGB(rgb)) return "Gray";
//   if (isYellowRGB(rgb)) return "Yellow";
//   if (isBrownRGB(rgb)) return "Brown";
//   if (isCyanRGB(rgb)) return "LightBlue";
//   if (isPinkRGB(rgb)) return "Pink";

//   const [r, g, b] = rgb;
//   if (r >= 150 && g >= 60 && g <= 150 && b <= 40) return "Orange";
//   if (r >= 150 && g < 60 && b < 60) return "Red";
//   if (b > r && b > g && r < 60 && g < 60 && b < 70) return "Blue";
//   if (r < 70 && g < 70 && b < 70) return "Brown";

//   const lab = chroma(rgb).lab();
//   const L = lab[0];
//   const a = lab[1];
//   const bLab = lab[2];

//   if (L > 95) return "White";
//   if (L < 10 && Math.abs(a) < 5 && Math.abs(bLab) < 5) return "Black";

//   let closest = "";
//   let minDistance = Infinity;
//   for (const [colorName, colorRgb] of Object.entries(COLOR_MAP)) {
//     const distance = chroma.distance(rgb, colorRgb, "lab");
//     if (distance < minDistance) {
//       minDistance = distance;
//       closest = colorName;
//     }
//   }

//   const blueShades = ["Blue", "DenimBlue", "DarkDenim", "MediumDenim", "LightDenim", "Navy", "Indigo","LightBlue"];
//   if (blueShades.includes(closest)) return "Blue";

//   const brownShades = ["Brown", "DarkBrown", "Chocolate"];
//   if (brownShades.includes(closest)) return "Brown";

//   const yellowShades = ["Yellow", "SoftYellow", "Golden", "WarmYellow", "Mustard", "Orange"];
//   if (yellowShades.includes(closest)) return "Yellow";

//   return closest;
// }

// function getDominantColorsFromCenter(
//   img: HTMLImageElement,
//   size = 200,
//   topN = 4
// ): RGB[] {
//   const canvas = document.createElement("canvas");
//   canvas.width = img.width;
//   canvas.height = img.height;
//   const ctx = canvas.getContext("2d");
//   if (!ctx) return [];

//   ctx.drawImage(img, 0, 0);
//   const centerX = Math.floor(img.width / 2);
//   const centerY = Math.floor(img.height / 2);

//   const pixels: RGB[] = [];

//   for (let x = centerX - size; x < centerX + size; x++) {
//     for (let y = centerY - size; y < centerY + size; y++) {
//       if (x < 0 || x >= img.width || y < 0 || y >= img.height) continue;

//       const data = ctx.getImageData(x, y, 1, 1).data;
//       const rgb: RGB = [data[0], data[1], data[2]];

//       const [L] = chroma(rgb).lab();
//       const saturation = chroma(rgb).hsl()[1];

//       if (L > 95) continue; 
//       if (saturation < 0.05 && L > 20) continue;

//       pixels.push(rgb);
//     }
//   }

//   if (!pixels.length) return [[0, 0, 0]];

//   const mergeSimilar = (colors: RGB[], threshold = 15) => {
//     const result: RGB[] = [];
//     for (const c of colors) {
//       if (!result.some(r => chroma.distance(c, r, "lab") < threshold)) {
//         result.push(c);
//       }
//     }
//     return result;
//   };

//   const colorMap: Record<string, { rgb: RGB; count: number }> = {};
//   pixels.forEach((rgb) => {
//     const key = rgb.join(",");
//     if (!colorMap[key]) colorMap[key] = { rgb, count: 0 };
//     colorMap[key].count++;
//   });

//   let sortedColors = Object.values(colorMap)
//     .sort((a, b) => b.count - a.count)
//     .map(c => c.rgb);

//   sortedColors = mergeSimilar(sortedColors);

//   const finalColors = sortedColors.slice(0, topN);
//   while (finalColors.length < topN) finalColors.push(sortedColors[0]);

//   return finalColors;
// }


// const postLook = async (look: LookType) => {
//   const res = await fetch("/api/looks", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(look),
//   });
//   if (!res.ok) {
//     const errorData = await res.json();
//     throw new Error(errorData.error || "Failed to save look");
//   }
//   return res.json();
// };


// interface NewLookProps {
//   setInspirationColors: (colors: string[]) => void;
//   lookMode: "default" | "inspiration";
//   onModeChange: (mode: "default" | "inspiration") => void;
// }

// const NewLook: FC<NewLookProps> = ({ setInspirationColors, lookMode, onModeChange }) => {
//   const [selectedItems, setSelectedItems] = useState<ClothingItem[]>([]);
//   const [isOpen, setIsOpen] = useState(false);
//   const [uploadedImage, setUploadedImage] = useState<string | null>(null);
//   const [isAnalyzing, setIsAnalyzing] = useState(false);

//   const userId = useUserStore((state) => state.userId);
//   const queryClient = useQueryClient();

//   const handleOpen = useCallback(
//     (mode: "default" | "inspiration") => {
//       onModeChange(mode);
//       setIsOpen(true);
//       setUploadedImage(null);
//       setInspirationColors([]);
//     },
//     [onModeChange, setInspirationColors]
//   );

//   const handleClose = useCallback(() => {
//     setIsOpen(false);
//     onModeChange("default");
//     setUploadedImage(null);
//     setInspirationColors([]);
//   }, [onModeChange, setInspirationColors]);

//   const handleImageUpload: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
//     const file = event.target.files?.[0];
//     if (!file) return;

//     const reader = new FileReader();
//     reader.onloadend = () => setUploadedImage(reader.result as string);
//     reader.readAsDataURL(file);

//     setIsAnalyzing(true);
//     setInspirationColors([]);

//     try {
//       const img = document.createElement('img');
//       img.src = URL.createObjectURL(file);
//       img.onload = () => {
//         const topColorsRGB = getDominantColorsFromCenter(img, 150, 4);
//         const colorNames = topColorsRGB.map(closestColorLAB);
//         setInspirationColors(colorNames);
//         console.log("Detected colors:", colorNames);
//         setIsAnalyzing(false);
//       };
//     } catch (error) {
//       console.error("Image analysis failed", error);
//       alert("Failed to analyze image colors.");
//       setInspirationColors([]);
//       setIsAnalyzing(false);
//     }
//   };

//   const mutation = useMutation({
//     mutationFn: postLook,
//     onSuccess: () => {
//       setSelectedItems([]);
//       handleClose();
//       alert("Look saved successfully!");
//       queryClient.invalidateQueries({ queryKey: ["looks"] });
//     },
//     onError: (error: any) => {
//       console.error("Error saving Look:", error.message);
//       alert("Failed to save Look.");
//     },
//   });

//   const handleDrop: React.DragEventHandler<HTMLDivElement> = (event) => {
//     event.preventDefault();
//     const data = event.dataTransfer.getData("application/json");
//     if (!data) return;

//     try {
//       const item: ClothingItem = JSON.parse(data);
//       if (!selectedItems.some((i) => i._id === item._id)) {
//         setSelectedItems((prev) => [...prev, item]);
//       }
//     } catch (err) {
//       console.error("Invalid dragged item data", err);
//     }
//   };

//   const handleDragOver: React.DragEventHandler<HTMLDivElement> = (event) => {
//     event.preventDefault();
//   };

//   const removeItem = (id: string) => setSelectedItems((prev) => prev.filter((i) => i._id !== id));

//   const saveLook = () => {
//     if (!userId) return alert("User not found. Please log in.");
//     if (selectedItems.length === 0) return alert("Add at least one clothing item before saving!");

//     const look: LookType = {
//       _id: "",
//       userId,
//       items: selectedItems,
//       createdAt: new Date(),
//     };

//     mutation.mutate(look);
//   };

//   const selectedCount = selectedItems.length;
//   const hasItems = selectedCount > 0;

//   return (
//     <section className={styles.container} aria-live="polite">
//       <div className={styles.shell}>
//         {!isOpen ? (
//           <div className={styles.introCard}>
//             <div className={styles.introContent}>
//               <div className={styles.introCopy}>
//                 <p className={styles.cardEyebrow}>Create a look</p>
//                 <h1 className={styles.cardTitle}>Craft your next outfit</h1>
//                 <p className={styles.cardHint}>Drag pieces from My Closet into the builder.</p>
//               </div>
//               <Image src={down} alt="Open look builder" width={56} height={56} className={styles.introIcon} />
//             </div>

//             <div className={styles.introActions}>
//               <button className={`${styles.ctaButton} ${styles.primaryCta}`} onClick={() => handleOpen("default")}>
//                 Create New Look
//               </button>
//               <button className={`${styles.ctaButton} ${styles.secondaryCta}`} onClick={() => handleOpen("inspiration")}>
//                 Look From Inspiration
//               </button>
//             </div>
//           </div>
//         ) : (
//           <div id="create-look-panel" className={styles.builderCard}>
//             <header className={styles.panelHeader}>
//               <div>
//                 <p className={styles.panelEyebrow}>Create look</p>
//                 <h3 className={styles.panelTitle}>Build a balanced outfit</h3>
//                 <p className={styles.panelMeta}>
//                   {hasItems ? `${selectedCount} item${selectedCount === 1 ? "" : "s"} selected` : "No items yet"}
//                 </p>
//               </div>
//               <button type="button" className={styles.closeBtn} onClick={handleClose} aria-label="Close look builder">
//                 ✕
//               </button>
//             </header>

//             <div className={styles.scrollRegion}>
//               <p className={styles.helperText}>Drag &amp; drop garments from your closet grid. Remove items any time.</p>

//               {lookMode === "inspiration" && (
//                 <div className={styles.inspirationArea}>
//                   {uploadedImage ? (
//                     <div className={styles.uploadedImageContent}>
//                       <img src={uploadedImage} alt="Inspiration" className={styles.uploadedImage} />
//                       <button className={styles.resetImageBtn} onClick={() => { setUploadedImage(null); setInspirationColors([]); }}>
//                         Change Image
//                       </button>
//                     </div>
//                   ) : (
//                     <>
//                       <div className={styles.inspirationText}>
//                         <h3>Look From Inspiration</h3>
//                         <p>Upload a mood image to pull guiding colors.</p>
//                       </div>

//                       <label className={styles.fileField}>
//                         <span>{isAnalyzing ? "Analyzing..." : "Upload image"}</span>
//                         <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isAnalyzing} />
//                       </label>

//                       {isAnalyzing && <p className={styles.analysisStatus}>Analyzing image... Hang tight! ⏳</p>}
//                     </>
//                   )}
//                 </div>
//               )}

//               <div className={`${styles.lookArea} ${hasItems ? styles.lookAreaFilled : ""}`} onDrop={handleDrop} onDragOver={handleDragOver}>
//                 {hasItems ? (
//                   selectedItems.map((item) => (
//                     <div key={item._id} className={styles.lookItem}>
//                       <img src={item.imageUrl} alt={item.category} loading="lazy" />
//                       <button type="button" onClick={() => removeItem(item._id)} aria-label={`Remove ${item.category}`}>
//                         Remove
//                       </button>
//                     </div>
//                   ))
//                 ) : (
//                   <div className={styles.emptyState}>
//                     <p>Drag garments here to start styling.</p>
//                     <span>Tip: mix textures &amp; tones for balance.</span>
//                   </div>
//                 )}
//               </div>
//             </div>

//             <div className={styles.actionBar}>
//               <button type="button" onClick={saveLook} disabled={mutation.isPending}>
//                 {mutation.isPending ? "Saving..." : "Save look"}
//               </button>
//               <button type="button" onClick={() => setSelectedItems([])} disabled={!hasItems || mutation.isPending}>
//                 Reset
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </section>
//   );
// };

// export default NewLook;
"use client";

import React, { useState, FC, useCallback } from "react";
import Image from "next/image";
import styles from "./NewLook.module.css";
import down from "../../../public/down.png";
import { useUserStore } from "../../../store/userStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ClothingItem } from "@/types/clothTypes";
import { LookType } from "@/types/lookTypes";
import { RGB, closestColorLAB, getDominantColorsKMeans } from "@/services/server/colorUtils"; 



const postLook = async (look: LookType) => {
  const res = await fetch("/api/looks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(look),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to save look");
  }
  return res.json();
};


interface NewLookProps {
  setInspirationColors: (colors: string[]) => void;
  lookMode: "default" | "inspiration";
  onModeChange: (mode: "default" | "inspiration") => void;
}

const NewLook: FC<NewLookProps> = ({ setInspirationColors, lookMode, onModeChange }) => {
  const [selectedItems, setSelectedItems] = useState<ClothingItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const userId = useUserStore((state) => state.userId);
  const queryClient = useQueryClient();

  const handleOpen = useCallback(
    (mode: "default" | "inspiration") => {
      onModeChange(mode);
      setIsOpen(true);
      setUploadedImage(null);
      setInspirationColors([]);
    },
    [onModeChange, setInspirationColors]
  );

  const handleClose = useCallback(() => {
    setIsOpen(false);
    onModeChange("default");
    setUploadedImage(null);
    setInspirationColors([]);
  }, [onModeChange, setInspirationColors]);

  const handleImageUpload: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setUploadedImage(reader.result as string);
    reader.readAsDataURL(file);

    setIsAnalyzing(true);
    setInspirationColors([]);

    try {
      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const topColorsRGB = getDominantColorsKMeans(img, 4); 
        const colorNames = topColorsRGB.map(closestColorLAB); 
        setInspirationColors(colorNames);
        console.log("Detected colors:", colorNames);
        setIsAnalyzing(false);
      };
    } catch (error) {
      console.error("Image analysis failed", error);
      alert("Failed to analyze image colors.");
      setInspirationColors([]);
      setIsAnalyzing(false);
    }
  };

  const mutation = useMutation({
    mutationFn: postLook,
    onSuccess: () => {
      setSelectedItems([]);
      handleClose();
      alert("Look saved successfully!");
      queryClient.invalidateQueries({ queryKey: ["looks"] });
    },
    onError: (error: any) => {
      console.error("Error saving Look:", error.message);
      alert("Failed to save Look.");
    },
  });

  const handleDrop: React.DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    const data = event.dataTransfer.getData("application/json");
    if (!data) return;

    try {
      const item: ClothingItem = JSON.parse(data);
      if (!selectedItems.some((i) => i._id === item._id)) {
        setSelectedItems((prev) => [...prev, item]);
      }
    } catch (err) {
      console.error("Invalid dragged item data", err);
    }
  };

  const handleDragOver: React.DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
  };

  const removeItem = (id: string) => setSelectedItems((prev) => prev.filter((i) => i._id !== id));

  const saveLook = () => {
    if (!userId) return alert("User not found. Please log in.");
    if (selectedItems.length === 0) return alert("Add at least one clothing item before saving!");

    const look: LookType = {
      _id: "",
      userId,
      items: selectedItems,
      createdAt: new Date(),
    };

    mutation.mutate(look);
  };

  const selectedCount = selectedItems.length;
  const hasItems = selectedCount > 0;

  return (
    <section className={styles.container} aria-live="polite">
      <div className={styles.shell}>
        {!isOpen ? (
          <div className={styles.introCard}>
            <div className={styles.introContent}>
              <div className={styles.introCopy}>
                <p className={styles.cardEyebrow}>Create a look</p>
                <h1 className={styles.cardTitle}>Craft your next outfit</h1>
                <p className={styles.cardHint}>Drag pieces from My Closet into the builder.</p>
              </div>
              <Image src={down} alt="Open look builder" width={56} height={56} className={styles.introIcon} />
            </div>

            <div className={styles.introActions}>
              <button className={`${styles.ctaButton} ${styles.primaryCta}`} onClick={() => handleOpen("default")}>
                Create New Look
              </button>
              <button className={`${styles.ctaButton} ${styles.secondaryCta}`} onClick={() => handleOpen("inspiration")}>
                Look From Inspiration
              </button>
            </div>
          </div>
        ) : (
          <div id="create-look-panel" className={styles.builderCard}>
            <header className={styles.panelHeader}>
              <div>
                <p className={styles.panelEyebrow}>Create look</p>
                <h3 className={styles.panelTitle}>Build a balanced outfit</h3>
                <p className={styles.panelMeta}>
                  {hasItems ? `${selectedCount} item${selectedCount === 1 ? "" : "s"} selected` : "No items yet"}
                </p>
              </div>
              <button type="button" className={styles.closeBtn} onClick={handleClose} aria-label="Close look builder">
                ✕
              </button>
            </header>

            <div className={styles.scrollRegion}>
              <p className={styles.helperText}>Drag &amp; drop garments from your closet grid. Remove items any time.</p>

              {lookMode === "inspiration" && (
                <div className={styles.inspirationArea}>
                  {uploadedImage ? (
                    <div className={styles.uploadedImageContent}>
                      <img src={uploadedImage} alt="Inspiration" className={styles.uploadedImage} />
                      <button className={styles.resetImageBtn} onClick={() => { setUploadedImage(null); setInspirationColors([]); }}>
                        Change Image
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className={styles.inspirationText}>
                        <h3>Look From Inspiration</h3>
                        <p>Upload a mood image to pull guiding colors.</p>
                      </div>

                      <label className={styles.fileField}>
                        <span>{isAnalyzing ? "Analyzing..." : "Upload image"}</span>
                        <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isAnalyzing} />
                      </label>

                      {isAnalyzing && <p className={styles.analysisStatus}>Analyzing image... Hang tight! ⏳</p>}
                    </>
                  )}
                </div>
              )}

              <div className={`${styles.lookArea} ${hasItems ? styles.lookAreaFilled : ""}`} onDrop={handleDrop} onDragOver={handleDragOver}>
                {hasItems ? (
                  selectedItems.map((item) => (
                    <div key={item._id} className={styles.lookItem}>
                      <img src={item.imageUrl} alt={item.category} loading="lazy" />
                      <button type="button" onClick={() => removeItem(item._id)} aria-label={`Remove ${item.category}`}>
                        Remove
                      </button>
                    </div>
                  ))
                ) : (
                  <div className={styles.emptyState}>
                    <p>Drag garments here to start styling.</p>
                    <span>Tip: mix textures &amp; tones for balance.</span>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.actionBar}>
              <button type="button" onClick={saveLook} disabled={mutation.isPending}>
                {mutation.isPending ? "Saving..." : "Save look"}
              </button>
              <button type="button" onClick={() => setSelectedItems([])} disabled={!hasItems || mutation.isPending}>
                Reset
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default NewLook;