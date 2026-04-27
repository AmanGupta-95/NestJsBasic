import * as Joi from 'joi';

export const createAuthorSchema = Joi.object({
  name: Joi.string().required().messages({
    'any.required': 'Name is required',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Email must be a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required',
  }),
  bio: Joi.string().optional(),
  birthDate: Joi.date().iso().optional().messages({
    'date.format': 'Birth date must be a valid ISO date string',
  }),
  nationality: Joi.string().optional(),
});

export interface CreateAuthorDto {
  name: string;
  email: string;
  password: string;
  bio?: string;
  birthDate?: string;
  nationality?: string;
}
