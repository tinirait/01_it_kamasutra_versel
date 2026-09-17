import { Request, Response, Router } from "express";
import { HttpStatus } from "../../core/types/http-statuses";
import { createErrorsMessages } from "../../core/utils/errors-messages.utils";
import { db } from "../../db/in-memory.db";
import { CreateVideoInputDto } from "../dto/create-video.input-dto";
import { UpdateVideoInputDto } from "../dto/update-video.input-dto";
import { Video } from "../types/video";
import { validateCreateVideoInputDto, validateUpdateVideoInputDto } from "../validation/videos.validation";

export const videosRouter = Router({});

videosRouter
  .get("", (req: Request, res: Response) => {
    res.status(HttpStatus.Ok).send(db.videos);
  })
  .post("", (req: Request, res: Response) => {
    const input: CreateVideoInputDto = req.body;
    const errors = validateCreateVideoInputDto(input);
    if (errors.length > 0) {
      res.status(HttpStatus.BadRequest).send(createErrorsMessages(errors));
      return;
    }

    const nextId = db.videos.length > 0 ? db.videos[db.videos.length - 1].id + 1 : 1;
    const now = new Date();
    const video: Video = {
      id: nextId,
      title: input.title,
      author: input.author,
      availableResolutions: input.availableResolutions,
      canBeDownloaded: false,
      minAgeRestriction: null,
      createdAt: now.toISOString(),
      publicationDate: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
    };

    db.videos.push(video);
    res.status(HttpStatus.Created).send(video);
  })
  .get("/:id", (req: Request, res: Response) => {
    const foundVideo = db.videos.find((v) => v.id === +req.params.id);
    if (!foundVideo) {
      res.sendStatus(HttpStatus.NotFound);
      return;
    }
    res.status(HttpStatus.Ok).send(foundVideo);
  })
  .put("/:id", (req: Request, res: Response) => {
    const foundVideo = db.videos.find((v) => v.id === +req.params.id);
    if (!foundVideo) {
      res.sendStatus(HttpStatus.NotFound);
      return;
    }

    const input: UpdateVideoInputDto = req.body;
    const errors = validateUpdateVideoInputDto(input);
    if (errors.length > 0) {
      res.status(HttpStatus.BadRequest).send(createErrorsMessages(errors));
      return;
    }

    foundVideo.title = input.title;
    foundVideo.author = input.author;
    foundVideo.availableResolutions = input.availableResolutions;
    foundVideo.canBeDownloaded = input.canBeDownloaded;
    foundVideo.minAgeRestriction = input.minAgeRestriction;
    foundVideo.publicationDate = input.publicationDate;

    res.sendStatus(HttpStatus.NoContent);
  })
  .delete("/:id", (req: Request, res: Response) => {
    const index = db.videos.findIndex((v) => v.id === +req.params.id);
    if (index === -1) {
      res.sendStatus(HttpStatus.NotFound);
      return;
    }
    db.videos.splice(index, 1);
    res.sendStatus(HttpStatus.NoContent);
  });
