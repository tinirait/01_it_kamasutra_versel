import express, { Express } from "express";
import { HttpStatus } from "./core/types/http-statuses";
import { testingRouter } from "./testing/routers/testing.router";
import { videosRouter } from "./videos/routers/videos.router";
import { setupSwagger } from "./swagger/setup-swagger";

export const setupApp = (app: Express) => {
  app.use(express.json());

  app.get("/", (req, res) => {
    res.status(HttpStatus.Ok).send("Hello world!");
  });

  app.use("/api/videos", videosRouter);
  app.use("/api/testing", testingRouter);

  // alias used by homework checker in production
  app.use("/hometask_01/api/videos", videosRouter);
  app.use("/hometask_01/api/testing", testingRouter);

  if (!process.env.VERCEL) {
    setupSwagger(app);
  }

  return app;
};
