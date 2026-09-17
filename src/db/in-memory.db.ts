import { Driver } from "../drivers/types/driver";
import { Video } from "../videos/types/video";

export const db: { drivers: Driver[]; videos: Video[] } = {
  drivers: [],
  videos: [],
};
