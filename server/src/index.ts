import express, { Request, Response, Application } from "express";

const app: Application = express();
const PORT = process.env.PORT || 5000;

app.get("/", (req: Request, res: Response) => {
    res.send("Hello");
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));