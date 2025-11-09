// components/NewCloth.tsx
"use client";

import { useState } from "react";
import axios from "axios";
import Footer from "../Footer/Footer";
import Header from "../Header/Header";
import styles from "./NewCloth.module.css";

const NewCloth = ({ userId }: { userId: string }) => {
  const [category, setCategory] = useState("");
  const [thickness, setThickness] = useState("");
  const [style, setStyle] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  const handleStyleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(
      (o) => o.value
    );
    setStyle(selectedOptions);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const getDominantColorFromCenter = (image: HTMLImageElement) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return "#ffffff";

    const size = 100;
    canvas.width = size;
    canvas.height = size;

    const cropSize = Math.min(image.width, image.height) / 2;
    const sx = (image.width - cropSize) / 2;
    const sy = (image.height - cropSize) / 2;

    ctx.drawImage(image, sx, sy, cropSize, cropSize, 0, 0, size, size);

    const imageData = ctx.getImageData(0, 0, size, size);
    const data = imageData.data;

    let r = 0,
      g = 0,
      b = 0,
      count = 0;
    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3];
      if (alpha === 0) continue;
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      count++;
    }

    r = Math.round(r / count);
    g = Math.round(g / count);
    b = Math.round(b / count);

    return `rgb(${r}, ${g}, ${b})`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      alert("Please upload an image!");
      return;
    }

    setLoading(true);

    try {
      // --- 1️⃣ העלאת תמונה ל-Cloudinary ---
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("upload_preset", "snapfit_unsigned"); // שנה לפי ה-upload preset שלך

      const cloudRes = await axios.post(
        "https://api.cloudinary.com/v1_1/dfrgvh4hf/image/upload",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const imageUrl = cloudRes.data.secure_url;
      console.log("Image uploaded to Cloudinary:", imageUrl);

      // --- 2️⃣ זיהוי צבע עיקרי בעזרת canvas (מרכז התמונה) ---
      const img = new Image();
      img.crossOrigin = "anonymous"; // מונע בעיית CORS
      img.src = imageUrl;
      img.onload = async () => {
        const dominantColor = getDominantColorFromCenter(img);
        console.log("Detected dominant color:", dominantColor);

        try {
          // --- 3️⃣ שליחה ל-Backend ומונגו ---
          await axios.post("/api/clothing", {
            userId,
            category,
            thickness,
            style,
            imageUrl,
            color: dominantColor,
          });

          alert("Item added successfully!");
          setCategory("");
          setThickness("");
          setStyle([]);
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
    <div>
      <Header />
      <form className={styles.formContainer} onSubmit={handleSubmit}>
        <label className={styles.label}>
          Category:
          <select
            className={styles.select}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </label>

        <label>
          Thickness:
          <select
            value={thickness}
            onChange={(e) => setThickness(e.target.value)}
            required
          >
            <option value="">Select thickness</option>
            {thicknesses.map((th) => (
              <option key={th} value={th}>
                {th}
              </option>
            ))}
          </select>
        </label>

        <label>
          Style:
          <select value={style} onChange={handleStyleChange}>
            <option value="">Select style</option>
            {styleOptions.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </label>

        <label>
          Image:
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            required
          />
        </label>

        {imagePreview && (
          <div>
            <p>Preview:</p>
            <img
              src={imagePreview}
              alt="Preview"
              style={{ maxWidth: "100%", maxHeight: "200px" }}
            />
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Uploading..." : "Add Item"}
        </button>
      </form>
      <Footer />
    </div>
  );
};

export default NewCloth;
