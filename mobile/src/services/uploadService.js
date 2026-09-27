import { api } from "./api";

const MIME_BY_EXT = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

function guessType(uri) {
  const ext = (uri.split("?")[0].split(".").pop() || "jpg").toLowerCase();
  return MIME_BY_EXT[ext] || "image/jpeg";
}

// Uploads a local image (file:// or content:// URI) and returns { url, path }.
// Content-Type is left for the runtime to set so the multipart boundary is
// handled automatically.
export async function uploadImage(uri) {
  const type = guessType(uri);
  const ext = type.split("/")[1];
  const form = new FormData();
  form.append("file", { uri, name: `upload.${ext}`, type });
  const response = await api.post("/uploads", form);
  return response.data.data;
}
