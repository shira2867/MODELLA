"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Footer from "../Footer/Footer";
import Header from "../Header/Header";
import styles from "./NewCloth.module.css";
import { getDominantColorFromCenter } from "../../../services/server/colorUtils";
import { uploadToCloudinary } from "@/services/server/cloudinary";
const NewCloth = ({ userId }: { userId: string }) => {
  const [category, setCategory] = useState("");
  const [thickness, setThickness] = useState("");
  const [style, setStyle] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const categories = [
    "shirt",
    "pants",
    "Jacket&coat",
    "dress",
    "Skirts",
    "Shoes",
    "Accessories",
  ];
  const thicknesses = ["light", "medium", "heavy"];
  const styleOptions = ["casual", "formal", "sporty", "party"];
  type RGB = [number, number, number];

  const COLOR_MAP: Record<string, RGB> = {
    Red: [255, 0, 0],
    Pink: [255, 192, 203],
    Orange: [255, 165, 0],
    Yellow: [255, 255, 0],
    Green: [0, 128, 0],
    Blue: [0, 0, 255],
    Purple: [128, 0, 128],
    Brown: [165, 42, 42],
    Gray: [128, 128, 128],
    Black: [0, 0, 0],
    White: [255, 255, 255],
    Beige: [245, 245, 220],
  };

  function closestColor(rgb: RGB): string {
    let closest = "";
    let minDistance = Infinity;

    for (const [colorName, colorRgb] of Object.entries(COLOR_MAP)) {
      const distance = Math.sqrt(
        (rgb[0] - colorRgb[0]) ** 2 +
          (rgb[1] - colorRgb[1]) ** 2 +
          (rgb[2] - colorRgb[2]) ** 2
      );
      if (distance < minDistance) {
        minDistance = distance;
        closest = colorName;
      }
    }

    return closest;
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !thickness || !style) {
      alert("Please fill all fields!");
      setLoading(false);
      return;
    }
    if (!imageFile) {
      alert("Please upload an image!");
      return;
    }

    setLoading(true);

    try {
      const imageUrl = await uploadToCloudinary(imageFile);
      console.log("Image uploaded to Cloudinary:", imageUrl);

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageUrl;
      img.onload = async () => {
        const dominantColor = getDominantColorFromCenter(img);
        console.log("Detected dominant color:", dominantColor);
        const rgbMatch = dominantColor.match(/\d+/g);
        let colorName = "Unknown";
        if (rgbMatch) {
          const rgbArray: RGB = [
            parseInt(rgbMatch[0]),
            parseInt(rgbMatch[1]),
            parseInt(rgbMatch[2]),
          ];
          colorName = closestColor(rgbArray);
        }
        console.log("Mapped color name:", colorName);
        try {
          await axios.post("/api/clothing", {
            userId,
            category,
            thickness,
            style,
            imageUrl,
            color: dominantColor,
            colorName,
          });

          alert("Item added successfully!");

          router.push("/mycloset");

          setCategory("");
          setThickness("");
          setStyle("");
          setImageFile(null);
          setImagePreview(null);
        } catch (err) {
          console.error("MongoDB error:", err);
          alert("Something went wrong saving to the database!");
        } finally {
          setLoading(false);
        }
      };
    } catch (err) {
      console.error("Cloudinary error:", err);
      alert("Something went wrong uploading the image!");
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.pageWrapper}>
        <h1 className={styles.pageTitle}>Add a New Item</h1>
        <p className={styles.subtitle}>
          Let’s make your closet even more fabulous 🖤
        </p>
        <form className={styles.fieldsArea} onSubmit={handleSubmit}>
          <label className={styles.imageBox}>
            {imagePreview ? (
              <img src={imagePreview} className={styles.previewImage} />
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
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label>Thickness</label>
            <select
              value={thickness}
              onChange={(e) => setThickness(e.target.value)}
            >
              <option value="">Select thickness</option>
              {thicknesses.map((c) => (
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
