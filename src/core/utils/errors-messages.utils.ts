import { ValidationError } from "../types/validation-error";

export const createErrorsMessages = (errors: ValidationError[]) => {
  return { errorsMessages: errors };
};
