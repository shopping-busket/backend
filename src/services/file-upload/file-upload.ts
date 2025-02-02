// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication';

import type { Application } from '../../declarations';
import { FileUploadService, getOptions } from './file-upload.class';
import { fileUploadMethods, fileUploadPath } from './file-upload.shared';
import multer from '@koa/multer';
import { BadRequest } from '@feathersjs/errors';
import {
  FileUpload,
  FileUploadCategory,
  fileUploadRecipeHeaderValidator,
  fileUploadRemoveValidator,
} from './file-upload.schema';
import { hooks as schemaHooks } from '@feathersjs/schema';

export * from './file-upload.class';

// @ts-ignore
const upload = multer();


// A configure function that registers the service and its hooks via `app.configure`
export const fileUpload = (app: Application) => {
  // Register our service on the Feathers application
  app.use(fileUploadPath, new FileUploadService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: fileUploadMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    koa: {
      before: [
        upload.single('file') as any,
        async (ctx, next) => {
          (ctx.feathers as any).file = ctx.file;
          await next();
        },
      ],
    },
  });

  // Initialize hooks
  app.service(fileUploadPath).hooks({
    around: {
      all: [authenticate('jwt')],
    },
    before: {
      all: [],
      create: [
        (ctx) => {
          const data = ctx.data as FileUpload;
          if (!data.category) throw new BadRequest('Multipart form has to include a \'category\' text field');
          if (!Object.values(FileUploadCategory).includes(data.category)) {
            throw new BadRequest(`Multipart form 'category' field has to be one of: ${Object.values(FileUploadCategory).join(', ')}`);
          }

          switch (data.category) {
          case FileUploadCategory.RECIPE_HEADER:
            (ctx.data! as Record<string, any>).recipeId = parseInt((ctx.data! as Record<string, string>).recipeId);
            return schemaHooks.validateData(fileUploadRecipeHeaderValidator)(ctx);
          }

          throw new Error('category not mapped to validation!');
        },
      ],
      update: [],
      remove: [
        schemaHooks.validateQuery(fileUploadRemoveValidator)
      ],
    },
    after: {
      all: [],
    },
    error: {
      all: [],
    },
  });
};

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [fileUploadPath]: FileUploadService;
  }
}
