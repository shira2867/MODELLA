// lib/cloudinary.ts
import axios from "axios";

export async function uploadToCloudinary(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "snapfit_unsigned");

  const res = await axios.post(
    "https://api.cloudinary.com/v1_1/dfrgvh4hf/image/upload",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  return res.data.secure_url as string;
}
