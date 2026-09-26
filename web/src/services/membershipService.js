import { api } from "./api";

export async function listPlans() {
  const response = await api.get("/memberships/plans");
  return response.data.data;
}

export async function getMyMembership() {
  const response = await api.get("/memberships/me");
  return response.data.data;
}

export async function subscribe(planCode) {
  const response = await api.post("/memberships/subscribe", { plan_code: planCode });
  return response.data.data;
}
