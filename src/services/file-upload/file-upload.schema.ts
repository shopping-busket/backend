import { getValidator, Static, Type } from '@feathersjs/typebox';
import { dataValidator } from '../../validators';

export enum FileUploadCategory {
  RECIPE_HEADER = 'recipe-header',
  RECIPE_STEP_HEADER = 'recipe-step-header',
}

// Schema for creating generic entries
export const fileUploadSchema = Type.Object(
  {
    category: Type.Enum(FileUploadCategory),
  },
  { $id: 'FileUploadSchema', additionalProperties: false },
);
type FileUploadSchema = Static<typeof fileUploadSchema>;

export const fileUploadValidator = getValidator(fileUploadSchema, dataValidator);

// Schema for removing generic entries
export const fileUploadRemove = Type.Object(
  {
    category: Type.Enum(FileUploadCategory),
  },
  { $id: 'FileUploadRemove', additionalProperties: false },
);
type FileUploadRemove = Static<typeof fileUploadRemove>;

export const fileUploadRemoveValidator = getValidator(fileUploadRemove, dataValidator);


// Schema for creating recipe-header entries
export const fileUploadRecipeHeaderSchema = Type.Object(
  {
    category: Type.Enum(FileUploadCategory),
    recipeId: Type.Number(),
    alt: Type.String(),
    note: Type.String(),
  },
  { $id: 'FileUploadRecipeHeaderSchema', additionalProperties: false },
);
type FileUploadRecipeHeaderSchema = Static<typeof fileUploadRecipeHeaderSchema>;
export const fileUploadRecipeHeaderValidator = getValidator(fileUploadRecipeHeaderSchema, dataValidator);


type FileUpload = any
type FileUploadPatch = any
type FileUploadQuery = any

export type {
  FileUpload,
  FileUploadSchema,
  FileUploadRemove,
  FileUploadRecipeHeaderSchema,
  FileUploadPatch,
  FileUploadQuery,
};
