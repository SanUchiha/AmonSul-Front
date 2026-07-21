import axios from "axios";

const CLOUD_NAME = "agyewc29";
const UPLOAD_PRESET = "amonsul_listas";
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

export const uploadImageToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const response = await axios.post(UPLOAD_URL, formData);
  return response.data.secure_url as string;
};
