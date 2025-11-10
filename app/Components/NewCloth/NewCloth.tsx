// components/NewCloth.tsx
"use client";

import { useState } from "react";
import axios from "axios";
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

        try {
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

        <label className={styles.label}>
          Thickness:
          <select
            className={styles.select}
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

        <label className={styles.label}>
          Style:
          <select
            className={styles.select}
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            required
          >
            <option value="">Select style</option>
            {styleOptions.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.label}>
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
