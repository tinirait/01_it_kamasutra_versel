import express from "express";
import { setupApp } from "../src/setup-app";

const app = express();
setupApp(app);

export = app;
