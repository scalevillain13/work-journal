import cors from "cors";
import express from "express";
import entriesRouter from "./routes/entries";
import workTypesRouter from "./routes/workTypes";

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/work-types", workTypesRouter);
app.use("/api/entries", entriesRouter);

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err);
    res.status(500).json({
      errors: [{ field: "root", message: "Внутренняя ошибка сервера" }],
    });
  }
);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
