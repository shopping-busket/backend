// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#custom-services
import type { NullableId, Params, ServiceInterface } from '@feathersjs/feathers';

import type { Application } from '../../declarations';
import { BadRequest, NotFound } from '@feathersjs/errors';
import path from 'node:path';
import fsp from 'fs/promises';
import multer from '@koa/multer';
import {
  FileUpload,
  FileUploadCategory,
  FileUploadPatch,
  FileUploadQuery,
  FileUploadRecipeHeaderSchema,
  FileUploadRemove,
  FileUploadSchema,
} from './file-upload.schema';
import { app } from '../../app';
import { Recipe } from '../recipe/recipe.schema';
import _ from 'lodash';

export interface FileUploadServiceOptions {
  app: Application;
}

export interface FileUploadParams extends Params<FileUploadQuery> {
  file: multer.File;
}

// This is a skeleton for a custom service class. Remove or add the methods you need here
export class FileUploadService<ServiceParams extends FileUploadParams = FileUploadParams>
  implements ServiceInterface<FileUpload, FileUploadSchema, ServiceParams, FileUploadPatch> {
  constructor(public options: FileUploadServiceOptions) {
  }

  async create(data: FileUploadSchema, params?: ServiceParams): Promise<FileUpload>
  async create(data: FileUploadSchema[], params?: ServiceParams): Promise<FileUpload[]>
  async create(
    data: FileUploadSchema | FileUploadSchema[],
    params?: ServiceParams,
  ): Promise<FileUpload | FileUpload[]> {
    if (Array.isArray(data)) {
      return Promise.all(data.map((current) => this.create(current, params)));
    }


    if (!params) throw new BadRequest('No params received');

    if (!data.category) throw new BadRequest('Multipart form has to include a \'category\' text field');
    if (!Object.values(FileUploadCategory).includes(data.category)) {
      throw new BadRequest(`Multipart form 'category' field has to be one of: ${Object.values(FileUploadCategory).join(', ')}`);
    }

    const fileDir = path.join(process.cwd(), 'public', 'file-upload', data.category);

    console.log(params.file);
    await fsp.mkdir(fileDir, { recursive: true });

    console.log(data);
    switch (data.category) {
    case FileUploadCategory.RECIPE_HEADER:
      console.log('FileUploadCategory.RECIPE_HEADER');
      const recipe = data as unknown as FileUploadRecipeHeaderSchema;
      const filePath = path.join(fileDir, recipe.recipeId + '.jpg');

      await app.service('recipe').patch(recipe.recipeId, {
        headerImagePath: `file-upload/${data.category}/${recipe.recipeId}.jpg`,
        headerImageAlt: recipe.alt,
        headerImageNote: recipe.note,
      } as Partial<Recipe>, params);

      await fsp.writeFile(filePath, params.file.buffer);
      break;
    case FileUploadCategory.RECIPE_STEP_HEADER:
      break;
    }

    return {
      id: 0,
      ...data,
    };
  }

  // This method has to be added to the 'methods' option to make it available to clients
  async update(id: NullableId, data: FileUploadSchema, _params?: ServiceParams): Promise<FileUpload> {
    return {
      id: 0,
      ...data,
    };
  }

  async remove(id: NullableId, _params?: ServiceParams): Promise<FileUpload> {
    console.log('remove with id: ', id, _params?.query);
    if (typeof id !== 'number') throw new BadRequest('Id must be typeof number');

    const data = (_params!.query as FileUploadRemove);

    const removeAt = path.join(
      process.cwd(),
      'public',
      'file-upload',
      data.category,
      `${id.toString()}.jpg`,
    );

    switch (data.category) {
    case FileUploadCategory.RECIPE_HEADER:
      await app.service('recipe').patch(id, {
        headerImagePath: null,
        headerImageAlt: null,
        headerImageNote: null,
      } as Partial<Recipe>, _.omit(_params, ['query.category']));

      try {
        await fsp.rm(removeAt);
      } catch (e) {
        throw new NotFound('The resource to-be-deleted could not be found!');
      }
      break;
    case FileUploadCategory.RECIPE_STEP_HEADER:
      break;
    }

    return {
      id,
      path: removeAt,
    };
  }
}

export const getOptions = (app: Application) => {
  return { app };
};
