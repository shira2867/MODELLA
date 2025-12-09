
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