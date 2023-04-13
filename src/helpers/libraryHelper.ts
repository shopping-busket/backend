import { app } from '../app';
import { LibraryData, libraryPath } from '../services/library/library.shared';

export const addToLibrary = async (user: string, listId: string) => {
  await app.service(libraryPath).create({
    user,
    listId
  } as LibraryData);
};
