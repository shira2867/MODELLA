// // "use client";

// // import React, { useState } from "react";
// // import { useMutation, useQueryClient } from "@tanstack/react-query";
// // import axios from "axios";
// // import { useRouter } from "next/navigation";
// // import Header from "../Header/Header";
// // import Footer from "../Footer/Footer";
// // import styles from "./NewCloth.module.css";
// // import { uploadToCloudinary } from "@/services/server/cloudinary";
// // import { ClothingItemPayload } from "@/types/clothTypes";
// // import chroma from "chroma-js";

// // type NewClothProps = { userId: string };
// // type RGB = [number, number, number];

// // const COLOR_MAP: Record<string, RGB> = {
// //   Red: [255, 0, 0],
// //   DarkRed: [139, 0, 0],
// //   Pink: [255, 192, 203],
// //   Orange: [255, 165, 0],

// //   // גווני צהוב–זהוב מתוקנים
// //   Yellow: [255, 255, 0],
// //   SoftYellow: [250, 230, 140],
// //   Golden: [228, 205, 125],      // ← הגוון שנתת
// //   WarmYellow: [240, 220, 130],
// //   Mustard: [204, 153, 0],

// //   Green: [0, 128, 0],
// //   Blue: [0, 0, 255],
// //   DenimBlue: [21, 96, 189],
// //   DarkDenim: [10, 45, 100],
// //   MediumDenim: [50, 110, 180],
// //   LightDenim: [173, 198, 229],
// //   LightBlue: [173, 216, 230],
// //   Purple: [128, 0, 128],
// //   Brown: [121, 85, 61],
// //   DarkBrown: [101, 67, 33],
// //   Chocolate: [123, 63, 0],
// //   Gray: [128, 128, 128],
// //   DarkGray: [64, 64, 64],
// //   Black: [0, 0, 0],
// //   White: [255, 255, 255],
// //   Beige: [245, 245, 220],
// //   Navy: [0, 0, 128],
// //   Indigo: [75, 0, 130],
// //   Burgundy: [128, 0, 32],
// //   Olive: [85, 107, 47],
// //   Teal: [0, 128, 128],
// //   Turquoise: [64, 224, 208],
// // };

// // function closestColorLAB(rgb: RGB): string {
// //   const [r, g, b] = rgb;

// //   if (r > 150 && g < 80 && b < 80) return "Red";

// //   const lab = chroma(rgb).lab();
// //   const L = lab[0];
// //   const a = lab[1];
// //   const bLab = lab[2];

// //   if (L > 95) return "White";
// //   if (L < 10 && Math.abs(a) < 5 && Math.abs(bLab) < 5) return "Black";

// //   let closest = "";
// //   let minDistance = Infinity;

// //   for (const [colorName, colorRgb] of Object.entries(COLOR_MAP)) {
// //     const distance = chroma.distance(rgb, colorRgb, "lab");
// //     if (distance < minDistance) {
// //       minDistance = distance;
// //       closest = colorName;
// //     }
// //   }

// //   // כחולים וג'ינסים → Blue
// //   const blueShades = ["Blue", "DenimBlue", "DarkDenim", "MediumDenim", "LightDenim", "Navy", "Indigo"];
// //   if (blueShades.includes(closest)) return "Blue";

// //   // חומים → Brown
// //   const brownShades = ["Brown", "DarkBrown", "Chocolate", "DarkGray"];
// //   if (brownShades.includes(closest)) return "Brown";

// //   // צהובים–זהובים → Yellow
// //   const yellowShades = ["Yellow", "SoftYellow", "Golden", "WarmYellow", "Mustard", "Orange"];
// //   if (yellowShades.includes(closest)) return "Yellow";

// //   return closest;
// // }

// // function getDominantColorsFromCenter(img: HTMLImageElement, size = 100, topN = 5): RGB[] {
// //   const canvas = document.createElement("canvas");
// //   canvas.width = img.width;
// //   canvas.height = img.height;
// //   const ctx = canvas.getContext("2d");
// //   if (!ctx) return [];

// //   ctx.drawImage(img, 0, 0);
// //   const centerX = Math.floor(img.width / 2);
// //   const centerY = Math.floor(img.height / 2);

// //   const colorCounts: Record<string, { rgb: RGB; count: number }> = {};

// //   for (let x = centerX - size; x < centerX + size; x++) {
// //     for (let y = centerY - size; y < centerY + size; y++) {
// //       if (x < 0 || x >= img.width || y < 0 || y >= img.height) continue;

// //       const pixel = ctx.getImageData(x, y, 1, 1).data;
// //       const rgb: RGB = [pixel[0], pixel[1], pixel[2]];

// //       const [L, a, b] = chroma(rgb).lab();
// //       const saturation = chroma(rgb).hsl()[1];

// //       if (L > 95) continue;
// //       if (saturation < 0.05 && L > 20) continue;

// //       const key = rgb.join(",");
// //       if (!colorCounts[key]) colorCounts[key] = { rgb, count: 0 };
// //       colorCounts[key].count++;
// //     }
// //   }

// //   const sorted = Object.values(colorCounts).sort((a, b) => b.count - a.count).slice(0, topN);

// //   if (sorted.length === 0) return [[0, 0, 0]];

// //   return [sorted[0].rgb];
// // }

// // const NewCloth: React.FC<NewClothProps> = ({ userId }) => {
// //   const [category, setCategory] = useState<string>("");
// //   const [thickness, setThickness] = useState<"light" | "medium" | "heavy">("light");
// //   const [style, setStyle] = useState<string>("");
// //   const [imageFile, setImageFile] = useState<File | null>(null);
// //   const [imagePreview, setImagePreview] = useState<string | null>(null);
// //   const [loading, setLoading] = useState(false);
// //   const router = useRouter();
// //   const queryClient = useQueryClient();

// //   const categories = ["shirt", "pants", "Jacket&coat", "dress", "Skirts", "Shoes", "Accessories"];
// //   const styleOptions = ["casual", "formal", "sporty", "party"];
// //   const thicknessOptions: ("light" | "medium" | "heavy")[] = ["light", "medium", "heavy"];

// //   const mutation = useMutation<void, Error, ClothingItemPayload>({
// //     mutationFn: async (newCloth) => await axios.post("/api/clothing", newCloth),
// //     onSuccess: () => {
// //       alert("Item added successfully!");
// //       queryClient.invalidateQueries({ queryKey: ["clothes", userId] });
// //       router.push("/mycloset");
// //     },
// //     onError: () => alert("Something went wrong!"),
// //   });

// //   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// //     const file = e.target.files?.[0] || null;
// //     setImageFile(file);
// //     setImagePreview(file ? URL.createObjectURL(file) : null);
// //   };

// //   const handleSubmit = async (e: React.FormEvent) => {
// //     e.preventDefault();
// //     if (!category || !thickness || !style || !imageFile) {
// //       alert("Please fill all fields and upload an image!");
// //       return;
// //     }

// //     setLoading(true);
// //     try {
// //       const imageUrl = await uploadToCloudinary(imageFile);

// //       const img = new Image();
// //       img.crossOrigin = "anonymous";
// //       img.src = imageUrl;
// //       img.onload = () => {
// //         const topColors = getDominantColorsFromCenter(img, 50, 5);
// //         const mainColor = topColors[0];
// //         const colorName = closestColorLAB(mainColor);

// //         console.log("Detected color:", colorName);
// //         console.log("rgb", `rgb(${mainColor[0]}, ${mainColor[1]}, ${mainColor[2]})`);

// //         mutation.mutate({
// //           userId,
// //           category,
// //           thickness,
// //           style,
// //           imageUrl,
// //           color: `rgb(${mainColor[0]}, ${mainColor[1]}, ${mainColor[2]})`,
// //           colorName,
// //         });
// //       };
// //     } catch (err) {
// //       console.error(err);
// //       alert("Upload failed!");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <div className={styles.container}>
// //       <Header />
// //       <div className={styles.pageWrapper}>
// //         <h1 className={styles.pageTitle}>Add a New Item</h1>
// //         <p className={styles.subtitle}>Let’s make your closet even more fabulous 🖤</p>

// //         <form className={styles.fieldsArea} onSubmit={handleSubmit}>
// //           <label className={styles.imageBox}>
// //             {imagePreview ? (
// //               <img src={imagePreview} className={styles.previewImage} />
// //             ) : (
// //               <div className={styles.placeholder}>
// //                 <span className={styles.plusIcon}>+</span>
// //                 <p>Click to upload image</p>
// //               </div>
// //             )}
// //             <input type="file" accept="image/*" onChange={handleImageChange} />
// //           </label>

// //           <div className={styles.field}>
// //             <label>Category</label>
// //             <select value={category} onChange={(e) => setCategory(e.target.value)}>
// //               <option value="">Select category</option>
// //               {categories.map((c) => (
// //                 <option key={c}>{c}</option>
// //               ))}
// //             </select>
// //           </div>

// //           <div className={styles.field}>
// //             <label>Thickness</label>
// //             <select value={thickness} onChange={(e) => setThickness(e.target.value as "light" | "medium" | "heavy")}>
// //               <option value="">Select thickness</option>
// //               {thicknessOptions.map((c) => (
// //                 <option key={c}>{c}</option>
// //               ))}
// //             </select>
// //           </div>

// //           <div className={styles.field}>
// //             <label>Style</label>
// //             <select value={style} onChange={(e) => setStyle(e.target.value)}>
// //               <option value="">Select style</option>
// //               {styleOptions.map((c) => (
// //                 <option key={c}>{c}</option>
// //               ))}
// //             </select>
// //           </div>

// //           <button type="submit" className={styles.submitBtn} disabled={loading}>
// //             {loading ? "Uploading..." : "Add Item"}
// //           </button>
// //         </form>
// //       </div>
// //       <Footer />
// //     </div>
// //   );
// // };

// // export default NewCloth;


// "use client";

// import React, { useState } from "react";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import axios from "axios";
// import { useRouter } from "next/navigation";
// import Header from "../Header/Header";
// import Footer from "../Footer/Footer";
// import styles from "./NewCloth.module.css";
// import { uploadToCloudinary } from "@/services/server/cloudinary";
// import { ClothingItemPayload } from "@/types/clothTypes";
// import chroma from "chroma-js";

// type NewClothProps = { userId: string };
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
//   const maxDiff = Math.max(r, g, b) - Math.min(r, g, b);
//   return maxDiff < 20 && r > 50 && r < 200;
// }

// // גווני צהוב – גם אם קצת כתום/חום
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
//   if (b > r && b > g && b - r >= 20 && b - g >= 10 && r >= 60 && g >= 60 && b >= 60 && b <= 185) return true;
//   if (b > r && b > g && b - r >= 10 && b - g >= 5 && r >= 120 && g >= 140 && b >= 160 && b <= 200) return true;
//   return false;
// }
// function isGreenRGB([r, g, b]: RGB): boolean {

//   return (
//     g > r &&
//     g > b &&
//     g >= 80 &&
//     g <= 200 &&
//     r <= 150 &&
//     b <= 150
//   );
// }
// function isBurgundyRGB([r, g, b]: RGB): boolean {
//   return (
//     r > 50 && r < 150 &&
//     g < 60 &&
//     b < 70
//   );
// }

// function isRedRGB([r, g, b]: RGB): boolean {
//   return r > 150 && g < 80 && b < 80;
// }
// function closestColorLAB(rgb: RGB): string {
//   if (isDenimRGB(rgb)) return "Blue";
//   if (isGreenRGB(rgb)) return "Green"
//   if (isRedRGB(rgb)) return "Red"
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

//   // חום כהה במקום אפור כהה
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

//   const blueShades = ["Blue", "DenimBlue", "DarkDenim", "MediumDenim", "LightDenim", "Navy", "Indigo"];
//   if (blueShades.includes(closest)) return "Blue";

//   const brownShades = ["Brown", "DarkBrown", "Chocolate"];
//   if (brownShades.includes(closest)) return "Brown";

//   const yellowShades = ["Yellow", "SoftYellow", "Golden", "WarmYellow", "Mustard", "Orange"];
//   if (yellowShades.includes(closest)) return "Yellow";

//   return closest;
// }

// function getDominantColorsFromCenter(img: HTMLImageElement, size = 100, topN = 5): RGB[] {
//   const canvas = document.createElement("canvas");
//   canvas.width = img.width;
//   canvas.height = img.height;
//   const ctx = canvas.getContext("2d");
//   if (!ctx) return [];

//   ctx.drawImage(img, 0, 0);
//   const centerX = Math.floor(img.width / 2);
//   const centerY = Math.floor(img.height / 2);

//   const colorCounts: Record<string, { rgb: RGB; count: number }> = {};

//   for (let x = centerX - size; x < centerX + size; x++) {
//     for (let y = centerY - size; y < centerY + size; y++) {
//       if (x < 0 || x >= img.width || y < 0 || y >= img.height) continue;

//       const pixel = ctx.getImageData(x, y, 1, 1).data;
//       const rgb: RGB = [pixel[0], pixel[1], pixel[2]];

//       const [L] = chroma(rgb).lab();
//       const saturation = chroma(rgb).hsl()[1];

//       if (L > 95) continue;
//       if (saturation < 0.05 && L > 20) continue;

//       const key = rgb.join(",");
//       if (!colorCounts[key]) colorCounts[key] = { rgb, count: 0 };
//       colorCounts[key].count++;
//     }
//   }

//   const sorted = Object.values(colorCounts).sort((a, b) => b.count - a.count).slice(0, topN);

//   if (sorted.length === 0) return [[0, 0, 0]];

//   return [sorted[0].rgb];
// }

// const NewCloth: React.FC<NewClothProps> = ({ userId }) => {
//   const [category, setCategory] = useState("");
//   const [thickness, setThickness] = useState<"light" | "medium" | "heavy">("light");
//   const [style, setStyle] = useState("");
//   const [imageFile, setImageFile] = useState<File | null>(null);
//   const [imagePreview, setImagePreview] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const router = useRouter();
//   const queryClient = useQueryClient();

//   const categories = ["shirt", "pants", "Jacket&coat", "dress", "Skirts", "Shoes", "Accessories"];
//   const styleOptions = ["casual", "formal", "sporty", "party"];
//   const thicknessOptions: ("light" | "medium" | "heavy")[] = ["light", "medium", "heavy"];

//   const mutation = useMutation<void, Error, ClothingItemPayload>({
//     mutationFn: async (newCloth) => await axios.post("/api/clothing", newCloth),
//     onSuccess: () => {
//       alert("Item added successfully!");
//       queryClient.invalidateQueries({ queryKey: ["clothes", userId] });
//       router.push("/mycloset");
//     },
//     onError: () => alert("Something went wrong!"),
//   });

//   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0] || null;
//     setImageFile(file);
//     setImagePreview(file ? URL.createObjectURL(file) : null);
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!category || !thickness || !style || !imageFile) {
//       alert("Please fill all fields and upload an image!");
//       return;
//     }

//     setLoading(true);
//     try {
//       const imageUrl = await uploadToCloudinary(imageFile);

//       const img = new Image();
//       img.crossOrigin = "anonymous";
//       img.src = imageUrl;
//       img.onload = () => {
//         const topColors = getDominantColorsFromCenter(img, 50, 5);
//         const mainColor = topColors[0];
//         const colorName = closestColorLAB(mainColor);

//         console.log("Detected color:", colorName);
//         console.log("rgb", `rgb(${mainColor[0]}, ${mainColor[1]}, ${mainColor[2]})`);

//         mutation.mutate({
//           userId,
//           category,
//           thickness,
//           style,
//           imageUrl,
//           color: `rgb(${mainColor[0]}, ${mainColor[1]}, ${mainColor[2]})`,
//           colorName,
//         });
//       };
//     } catch (err) {
//       console.error(err);
//       alert("Upload failed!");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className={styles.container}>
//       <Header />
//       <div className={styles.pageWrapper}>
//         <h1 className={styles.pageTitle}>Add a New Item</h1>
//         <p className={styles.subtitle}>Let’s make your closet even better</p>

//         <form className={styles.fieldsArea} onSubmit={handleSubmit}>
//           <label className={styles.imageBox}>
//             {imagePreview ? (
//               <img src={imagePreview} className={styles.previewImage} />
//             ) : (
//               <div className={styles.placeholder}>
//                 <span className={styles.plusIcon}>+</span>
//                 <p>Click to upload image</p>
//               </div>
//             )}
//             <input type="file" accept="image/*" onChange={handleImageChange} />
//           </label>

//           <div className={styles.field}>
//             <label>Category</label>
//             <select value={category} onChange={(e) => setCategory(e.target.value)}>
//               <option value="">Select category</option>
//               {categories.map((c) => (
//                 <option key={c}>{c}</option>
//               ))}
//             </select>
//           </div>

//           <div className={styles.field}>
//             <label>Thickness</label>
//             <select value={thickness} onChange={(e) => setThickness(e.target.value as any)}>
//               <option value="">Select thickness</option>
//               {thicknessOptions.map((c) => (
//                 <option key={c}>{c}</option>
//               ))}
//             </select>
//           </div>

//           <div className={styles.field}>
//             <label>Style</label>
//             <select value={style} onChange={(e) => setStyle(e.target.value)}>
//               <option value="">Select style</option>
//               {styleOptions.map((c) => (
//                 <option key={c}>{c}</option>
//               ))}
//             </select>
//           </div>

//           <button type="submit" className={styles.submitBtn} disabled={loading}>
//             {loading ? "Uploading..." : "Add Item"}
//           </button>
//         </form>
//       </div>
//       <Footer />
//     </div>
//   );
// };

// export default NewCloth;



"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import styles from "./NewCloth.module.css";
import { uploadToCloudinary } from "@/services/server/cloudinary";
import { ClothingItemPayload } from "@/types/clothTypes";
import { closestColorLAB, getDominantColorsFromCenter } from "@/services/server/colorUtils"; 


type NewClothProps = { userId: string };

const NewCloth: React.FC<NewClothProps> = ({ userId }) => {
  const [category, setCategory] = useState("");
  const [thickness, setThickness] = useState<"light" | "medium" | "heavy">("light");
  const [style, setStyle] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const categories = ["shirt", "pants", "Jacket&coat", "dress", "Skirts", "Shoes", "Accessories"];
  const styleOptions = ["casual", "formal", "sporty", "party"];
  const thicknessOptions: ("light" | "medium" | "heavy")[] = ["light", "medium", "heavy"];

  const mutation = useMutation<void, Error, ClothingItemPayload>({
    mutationFn: async (newCloth) => await axios.post("/api/clothing", newCloth),
    onSuccess: () => {
      alert("Item added successfully!");
      queryClient.invalidateQueries({ queryKey: ["clothes", userId] });
      router.push("/mycloset");
    },
    onError: () => alert("Something went wrong!"),
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !thickness || !style || !imageFile) {
      alert("Please fill all fields and upload an image!");
      return;
    }

    setLoading(true);
    try {
      const imageUrl = await uploadToCloudinary(imageFile);

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageUrl;
      img.onload = () => {
      
        const topColors = getDominantColorsFromCenter(img, 100, 1);
        const mainColor = topColors[0];
        const colorName = closestColorLAB(mainColor);

        console.log("Detected color:", colorName);
        console.log("rgb", `rgb(${mainColor[0]}, ${mainColor[1]}, ${mainColor[2]})`);

        mutation.mutate({
          userId,
          category,
          thickness,
          style,
          imageUrl,
          color: `rgb(${mainColor[0]}, ${mainColor[1]}, ${mainColor[2]})`,
          colorName,
        });
      };
    } catch (err) {
      console.error(err);
      alert("Upload failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.pageWrapper}>
        <h1 className={styles.pageTitle}>Add a New Item</h1>
        <p className={styles.subtitle}>Let’s make your closet even better</p>

        <form className={styles.fieldsArea} onSubmit={handleSubmit}>
          <label className={styles.imageBox}>
            {imagePreview ? (
              <img src={imagePreview} alt="Clothing Preview" className={styles.previewImage} />
            ) : (
              <div className={styles.placeholder}>
                <span className={styles.plusIcon}>+</span>
                <p>Click to upload image</p>
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleImageChange} />
          </label>

          <div className={styles.field}>
            <label>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label>Thickness</label>
            <select value={thickness} onChange={(e) => setThickness(e.target.value as "light" | "medium" | "heavy")}>
              <option value="">Select thickness</option>
              {thicknessOptions.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label>Style</label>
            <select value={style} onChange={(e) => setStyle(e.target.value)}>
              <option value="">Select style</option>
              {styleOptions.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Uploading..." : "Add Item"}
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default NewCloth;