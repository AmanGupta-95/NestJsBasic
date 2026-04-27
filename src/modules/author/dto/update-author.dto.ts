import { createAuthorSchema } from './create-author.dto';

export const updateAuthorSchema = createAuthorSchema.fork(
  ['name', 'email', 'password', 'bio', 'birthDate', 'nationality'],
  (schema) => schema.optional(),
);

export interface UpdateAuthorDto {
  name?: string;
  email?: string;
  password?: string;
  bio?: string;
  birthDate?: string;
  nationality?: string;
}
