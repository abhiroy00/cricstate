import { api } from "./api";

export async function getHomeFeed() {
  const response = await api.get("/home/feed");
  return response.data.data;
}
