import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import schoolRoutes from "./routes/schools";
import progressRoutes from "./routes/progress";
import reportRoutes from "./routes/reports";
import adminRoutes from "./routes/admin";

dotenv.config();
const app = express();
const port = Number(process.env.PORT) || 4000;

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000" }));
app.use(express.json({ limit: '15mb' }))
app.use(express.urlencoded({ limit: '15mb', extended: true }))

app.use("/api/schools", schoolRoutes);
app.post("/api/direct-test", (req, res) => res.json({ ok: true })) // ← add this
app.use("/api/progress", progressRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.listen(port, () => {
  console.log(`Backend running on port ${port}`);
}); 

export default app;