import { createBookSchema } from './create-book.dto';

export const updateBookSchema = createBookSchema.fork(
  [
    'title',
    'isbn',
    'authorId',
    'genreIds',
    'publishedDate',
    'pages',
    'description',
    'language',
  ],
  (schema) => schema.optional(),
);

export interface UpdateBookDto {
  title?: string;
  isbn?: string;
  authorId?: string;
  genreIds?: string[];
  publishedDate?: string;
  pages?: number;
  description?: string;
  language?: string;
}
