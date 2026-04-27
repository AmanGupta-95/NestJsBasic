import * as Joi from 'joi';

export const createGenreSchema = Joi.object({
  name: Joi.string().required().messages({
    'any.required': 'Name is required',
  }),
  description: Joi.string().optional(),
});

export interface CreateGenreDto {
  name: string;
  description?: string;
}
