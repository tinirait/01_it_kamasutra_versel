const express = require("express");

const app = express();
app.use(express.json());

const RESOLUTIONS = ["P144", "P240", "P360", "P480", "P720", "P1080", "P1440", "P2160"];
const db = {
  videos: [],
};

const createErrorsMessages = (errors) => ({ errorsMessages: errors });

const isTrimmedStringInRange = (value, min, max) => {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  return trimmed.length >= min && trimmed.length <= max;
};

const isValidResolutions = (value) =>
  Array.isArray(value) && value.every((r) => typeof r === "string" && RESOLUTIONS.includes(r));

const isValidIsoDate = (value) => {
  if (typeof value !== "string") return false;
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString() === value;
};

const validateCreateVideoInput = (data) => {
  const errors = [];
  if (!isTrimmedStringInRange(data?.title, 1, 40)) {
    errors.push({ field: "title", message: "Invalid title" });
  }
  if (!isTrimmedStringInRange(data?.author, 1, 20)) {
    errors.push({ field: "author", message: "Invalid author" });
  }
  if (!isValidResolutions(data?.availableResolutions)) {
    errors.push({ field: "availableResolutions", message: "Invalid availableResolutions" });
  }
  return errors;
};

const validateUpdateVideoInput = (data) => {
  const errors = validateCreateVideoInput(data);
  if (typeof data?.canBeDownloaded !== "boolean") {
    errors.push({ field: "canBeDownloaded", message: "Invalid canBeDownloaded" });
  }
  if (
    data?.minAgeRestriction !== null &&
    (typeof data?.minAgeRestriction !== "number" ||
      !Number.isInteger(data.minAgeRestriction) ||
      data.minAgeRestriction < 1 ||
      data.minAgeRestriction > 18)
  ) {
    errors.push({ field: "minAgeRestriction", message: "Invalid minAgeRestriction" });
  }
  if (!isValidIsoDate(data?.publicationDate)) {
    errors.push({ field: "publicationDate", message: "Invalid publicationDate" });
  }
  return errors;
};

app.get("/", (req, res) => {
  res.status(200).send("Hello world!");
});

const mountVideosRoutes = (base) => {
  app.get(`${base}/videos`, (req, res) => {
    res.status(200).send(db.videos);
  });

  app.post(`${base}/videos`, (req, res) => {
    const errors = validateCreateVideoInput(req.body);
    if (errors.length) {
      res.status(400).send(createErrorsMessages(errors));
      return;
    }

    const nextId = db.videos.length ? db.videos[db.videos.length - 1].id + 1 : 1;
    const now = new Date();
    const video = {
      id: nextId,
      title: req.body.title,
      author: req.body.author,
      canBeDownloaded: false,
      minAgeRestriction: null,
      createdAt: now.toISOString(),
      publicationDate: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      availableResolutions: req.body.availableResolutions,
    };
    db.videos.push(video);
    res.status(201).send(video);
  });

  app.get(`${base}/videos/:id`, (req, res) => {
    const found = db.videos.find((v) => v.id === +req.params.id);
    if (!found) {
      res.sendStatus(404);
      return;
    }
    res.status(200).send(found);
  });

  app.put(`${base}/videos/:id`, (req, res) => {
    const found = db.videos.find((v) => v.id === +req.params.id);
    if (!found) {
      res.sendStatus(404);
      return;
    }
    const errors = validateUpdateVideoInput(req.body);
    if (errors.length) {
      res.status(400).send(createErrorsMessages(errors));
      return;
    }
    found.title = req.body.title;
    found.author = req.body.author;
    found.availableResolutions = req.body.availableResolutions;
    found.canBeDownloaded = req.body.canBeDownloaded;
    found.minAgeRestriction = req.body.minAgeRestriction;
    found.publicationDate = req.body.publicationDate;
    res.sendStatus(204);
  });

  app.delete(`${base}/videos/:id`, (req, res) => {
    const idx = db.videos.findIndex((v) => v.id === +req.params.id);
    if (idx === -1) {
      res.sendStatus(404);
      return;
    }
    db.videos.splice(idx, 1);
    res.sendStatus(204);
  });
};

const mountTestingRoutes = (base) => {
  app.delete(`${base}/testing/all-data`, (req, res) => {
    db.videos = [];
    res.sendStatus(204);
  });
};

mountVideosRoutes("/hometask_01/api");
mountTestingRoutes("/hometask_01/api");

module.exports = app;
