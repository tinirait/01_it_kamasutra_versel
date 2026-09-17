import { Resolutions } from "../types/resolutions";

export type CreateVideoInputDto = {
  title: string;
  author: string;
  availableResolutions: Resolutions[];
};
