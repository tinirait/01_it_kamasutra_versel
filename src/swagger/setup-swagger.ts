import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Uber API",
      version: "1.0.0",
      description: "Uber API documentation",
    },
  },
  apis: ["./src/**/*.swagger.yml"],
};

export const setupSwagger = (app: Express) => {
  try {
    const swaggerSpec = swaggerJsdoc(swaggerOptions);
    app.use("/api", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    app.use("/hometask_01/api", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  } catch (e) {
    // Do not crash API startup if docs generation fails in serverless environment.
    console.error("Swagger setup failed:", e);
  }
};
