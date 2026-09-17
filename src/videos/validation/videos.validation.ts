import { ValidationError } from "../../core/types/validation-error";
import { CreateVideoInputDto } from "../dto/create-video.input-dto";
import { UpdateVideoInputDto } from "../dto/update-video.input-dto";
import { RESOLUTIONS_VALUES } from "../types/resolutions";

const isTrimmedStringInRange = (value: unknown, min: number, max: number): boolean => {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  return trimmed.length >= min && trimmed.length <= max;
};

const isValidResolutions = (value: unknown): boolean => {
  return (
    Array.isArray(value) &&
    value.every((resolution) => typeof resolution === "string" && RESOLUTIONS_VALUES.includes(resolution as never))
  );
};

const isValidIsoDate = (value: unknown): boolean => {
  if (typeof value !== "string") return false;
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString() === value;
};

export const validateCreateVideoInputDto = (data: CreateVideoInputDto): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!isTrimmedStringInRange(data.title, 1, 40)) {
    errors.push({ field: "title", message: "Invalid title" });
  }

  if (!isTrimmedStringInRange(data.author, 1, 20)) {
    errors.push({ field: "author", message: "Invalid author" });
  }

  if (!isValidResolutions(data.availableResolutions)) {
    errors.push({ field: "availableResolutions", message: "Invalid availableResolutions" });
  }

  return errors;
};

export const validateUpdateVideoInputDto = (data: UpdateVideoInputDto): ValidationError[] => {
  const errors = validateCreateVideoInputDto(data);

  if (typeof data.canBeDownloaded !== "boolean") {
    errors.push({ field: "canBeDownloaded", message: "Invalid canBeDownloaded" });
  }

  if (
    data.minAgeRestriction !== null &&
    (typeof data.minAgeRestriction !== "number" ||
      !Number.isInteger(data.minAgeRestriction) ||
      data.minAgeRestriction < 1 ||
      data.minAgeRestriction > 18)
  ) {
    errors.push({ field: "minAgeRestriction", message: "Invalid minAgeRestriction" });
  }

  if (!isValidIsoDate(data.publicationDate)) {
    errors.push({ field: "publicationDate", message: "Invalid publicationDate" });
  }

  return errors;
};
