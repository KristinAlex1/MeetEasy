// FILE: pages/api/updateUsername.js
import { updateUsername } from "@/actions/users";

export default async function handler(req, res) {
  console.log('API Route: Received request', { 
    method: req.method,
    body: req.body 
  });

  if (req.method === "POST") {
    try {
      const { username } = req.body; 
      console.log('API Route: Processing username', username);
      
      const result = await updateUsername(req, username); // Pass the req object
      console.log('API Route: Success', result);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('API Route: Error', error);
      
      if (error.message === "Username is already taken.") {
        res.status(409).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}