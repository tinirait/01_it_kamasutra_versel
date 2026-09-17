import express from "express";
import { setupApp } from "../src/setup-app";

let appInstance: ReturnType<typeof express> | null = null;

const getApp = () => {
  if (appInstance) return appInstance;
  const app = express();
  setupApp(app);
  appInstance = app;
  return app;
};

export default (req: any, res: any) => {
  try {
    const app = getApp();
    return app(req, res);
  } catch (e) {
    console.error("Function startup failed:", e);
    res.statusCode = 500;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ message: "Internal Server Error" }));
  }
};
