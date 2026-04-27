import { createGenreSchema } from './create-genre.dto';

export const updateGenreSchema = createGenreSchema.fork(
  ['name', 'description'],
  (schema) => schema.optional(),
);

export interface UpdateGenreDto {
  name?: string;
  description?: string;
}
