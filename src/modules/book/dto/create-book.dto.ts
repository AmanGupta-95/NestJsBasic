import * as Joi from 'joi';

export const createBookSchema = Joi.object({
  title: Joi.string().required().messages({
    'any.required': 'Title is required',
  }),
  isbn: Joi.string().optional(),
  authorId: Joi.string().required().messages({
    'any.required': 'Author ID is required',
  }),
  genreIds: Joi.array().items(Joi.string()).min(1).required().messages({
    'array.min': 'At least one genre ID is required',
    'any.required': 'Genre IDs are required',
  }),
  publishedDate: Joi.date().iso().optional().messages({
    'date.format': 'Published date must be a valid ISO date string',
  }),
  pages: Joi.number().integer().min(1).optional().messages({
    'number.min': 'Pages must be at least 1',
  }),
  description: Joi.string().optional(),
  language: Joi.string().optional(),
});

export interface CreateBookDto {
  title: string;
  isbn?: string;
  authorId: string;
  genreIds: string[];
  publishedDate?: string;
  pages?: number;
  description?: string;
  language?: string;
}
