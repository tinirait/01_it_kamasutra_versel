import request from "supertest";
import express from "express";
import { setupApp } from "../../../src/setup-app";
import { Resolutions } from "../../../src/videos/types/resolutions";
import { HttpStatus } from "../../../src/core/types/http-statuses";

describe("Videos API", () => {
  const app = express();
  setupApp(app);

  const validCreateBody = {
    title: "How to ride",
    author: "Valentin",
    availableResolutions: [Resolutions.P144, Resolutions.P720],
  };

  beforeAll(async () => {
    await request(app).delete("/api/testing/all-data").expect(HttpStatus.NoContent);
  });

  it("should create video; POST /videos", async () => {
    const response = await request(app)
      .post("/api/videos")
      .send(validCreateBody)
      .expect(HttpStatus.Created);

    expect(response.body).toEqual({
      id: expect.any(Number),
      title: validCreateBody.title,
      author: validCreateBody.author,
      canBeDownloaded: false,
      minAgeRestriction: null,
      createdAt: expect.any(String),
      publicationDate: expect.any(String),
      availableResolutions: validCreateBody.availableResolutions,
    });
  });

  it("should return videos list; GET /videos", async () => {
    await request(app)
      .post("/api/videos")
      .send({ ...validCreateBody, title: "Video 1" })
      .expect(HttpStatus.Created);

    await request(app)
      .post("/api/videos")
      .send({ ...validCreateBody, title: "Video 2" })
      .expect(HttpStatus.Created);

    const listResponse = await request(app).get("/api/videos").expect(HttpStatus.Ok);

    expect(listResponse.body).toBeInstanceOf(Array);
    expect(listResponse.body.length).toBeGreaterThanOrEqual(2);
  });

  it("should return video by id; GET /videos/:id", async () => {
    const createResponse = await request(app)
      .post("/api/videos")
      .send({ ...validCreateBody, title: "Video by ID" })
      .expect(HttpStatus.Created);

    const getResponse = await request(app)
      .get(`/api/videos/${createResponse.body.id}`)
      .expect(HttpStatus.Ok);

    expect(getResponse.body).toEqual({
      ...createResponse.body,
      id: expect.any(Number),
      createdAt: expect.any(String),
      publicationDate: expect.any(String),
    });
  });

  it("should update video; PUT /videos/:id", async () => {
    const createResponse = await request(app).post("/api/videos").send(validCreateBody).expect(HttpStatus.Created);

    const bodyToUpdate = {
      title: "Updated title",
      author: "Updated author",
      availableResolutions: [Resolutions.P1080],
      canBeDownloaded: true,
      minAgeRestriction: 18,
      publicationDate: new Date().toISOString(),
    };

    await request(app).put(`/api/videos/${createResponse.body.id}`).send(bodyToUpdate).expect(HttpStatus.NoContent);

    const getResponse = await request(app).get(`/api/videos/${createResponse.body.id}`).expect(HttpStatus.Ok);
    expect(getResponse.body).toMatchObject(bodyToUpdate);
  });

  it("should delete video; DELETE /videos/:id", async () => {
    const createResponse = await request(app).post("/api/videos").send(validCreateBody).expect(HttpStatus.Created);

    await request(app).delete(`/api/videos/${createResponse.body.id}`).expect(HttpStatus.NoContent);
    await request(app).get(`/api/videos/${createResponse.body.id}`).expect(HttpStatus.NotFound);
  });

  it("should not create video when incorrect body passed; POST /videos", async () => {
    const invalidCreateResponse = await request(app)
      .post("/api/videos")
      .send({
        title: "",
        author: " ",
        availableResolutions: ["P999"],
      })
      .expect(HttpStatus.BadRequest);

    expect(invalidCreateResponse.body.errorsMessages).toEqual(
      expect.arrayContaining([
        { field: "title", message: "Invalid title" },
        { field: "author", message: "Invalid author" },
        { field: "availableResolutions", message: "Invalid availableResolutions" },
      ]),
    );
  });

  it("should not update video when incorrect body passed; PUT /videos/:id", async () => {
    const createResponse = await request(app).post("/api/videos").send(validCreateBody).expect(HttpStatus.Created);

    const invalidUpdateResponse = await request(app)
      .put(`/api/videos/${createResponse.body.id}`)
      .send({
        title: "ok",
        author: "ok",
        availableResolutions: [Resolutions.P240],
        canBeDownloaded: "yes",
        minAgeRestriction: 22,
        publicationDate: "bad date",
      })
      .expect(HttpStatus.BadRequest);

    expect(invalidUpdateResponse.body.errorsMessages).toEqual(
      expect.arrayContaining([
        { field: "canBeDownloaded", message: "Invalid canBeDownloaded" },
        { field: "minAgeRestriction", message: "Invalid minAgeRestriction" },
        { field: "publicationDate", message: "Invalid publicationDate" },
      ]),
    );
  });

  it("should return 404 for unknown id; GET/PUT/DELETE", async () => {
    await request(app).get("/api/videos/9999").expect(HttpStatus.NotFound);
    await request(app)
      .put("/api/videos/9999")
      .send({
        title: "A",
        author: "B",
        availableResolutions: [Resolutions.P144],
        canBeDownloaded: false,
        minAgeRestriction: null,
        publicationDate: new Date().toISOString(),
      })
      .expect(HttpStatus.NotFound);
    await request(app).delete("/api/videos/9999").expect(HttpStatus.NotFound);
  });
});
