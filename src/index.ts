import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import * as mongoose from "mongoose";
import { productRouter } from "./routers/productRouter.js";
import { seedRouter } from "./routers/seedRouter.js";
import { userRouter } from "./routers/userRouter.js";
import { orderRouter } from "./routers/orderRouter.js";
import categoryRouter from "./routers/categoryRouter.js";

const app = express();

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI_ATLZ;

if (!MONGODB_URI) {
  console.error("MONGODB_URI_ATLZ is not defined in your environment variables.");
  process.exit(1); // Exit the application if the MongoDB URI is missing
}

mongoose.set("strictQuery", true);
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error.message);
  });

app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:5173"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/products", productRouter);
app.use("/api/seed", seedRouter);
app.use("/api/users", userRouter);
app.use("/api/orders", orderRouter);
app.use("/api/categories", categoryRouter);

const PORT = 5050;
app.listen(PORT, () => {
  console.log(`Server is listening at ${PORT}`);
});
