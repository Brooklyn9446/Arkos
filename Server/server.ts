import express from "express";
import cors from "cors";
import multer from "multer";

import scansRouter from "./routes/scans";
import findingsRouter from "./routes/findings";
import projectsRouter from "./routes/projects";
import webhooksRouter from "./routes/webhooks";
import policiesRouter from "./routes/policies";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Legacy simulator endpoint for testing
const upload = multer({ dest: "uploads/" });
app.post("/api/upload", upload.single("repo"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  res.json({ message: "File uploaded successfully.", file: req.file.filename });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// v2 API routes
app.use("/api/scans", scansRouter);
app.use("/api/findings", findingsRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/webhooks", webhooksRouter);
app.use("/api/policies", policiesRouter);

// Start server
app.listen(PORT, () => {
  console.log(`[BACKEND] Server running on http://localhost:${PORT}`);
});
