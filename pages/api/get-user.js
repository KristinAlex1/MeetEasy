// FILE: pages/api/get-user.js
import { checkUser } from "@/lib/checkUser";

export default async function handler(req, res) {
  try {
    const user = await checkUser();
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("API Route: Error", error);
    res.status(500).json({ error: error.message });
  }
}