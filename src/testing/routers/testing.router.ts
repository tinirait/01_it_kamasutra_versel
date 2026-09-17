import { Router, Request, Response } from "express";
import { db } from "../../db/in-memory.db";
import { HttpStatus } from "../../core/types/http-statuses";

export const testingRouter = Router();

testingRouter.delete("/all-data", (req: Request, res: Response) => {
  db.videos = [];
  res.sendStatus(HttpStatus.NoContent);
});
