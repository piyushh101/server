// backend/server.js
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";

const app = express();
app.use(express.json());
app.use(cors());

// Dummy storage (replace with DB later)
let messages = [];

// --- Login Route ---
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  // Use env vars for real security
  if (
    username === process.env.ADMIN_USER &&
    password === process.env.ADMIN_PASS
  ) {
    const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    return res.json({ token });
  }

  res.status(401).json({ error: "Unauthorized" });
});

// --- Middleware to check JWT ---
function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.sendStatus(403);

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403);
    req.user = decoded;
    next();
  });
}

// --- Save contact message (public) ---
app.post("/api/contact", (req, res) => {
  const { name, email, subject, message } = req.body;
  const newMsg = {
    id: Date.now(),
    name,
    email,
    subject,
    message,
  };
  messages.push(newMsg);
  res.json({ success: true, msg: "Message stored" });
});

// --- Fetch contact messages (protected) ---
app.get("/api/contact", verifyToken, (req, res) => {
  res.json(messages);
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
