// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema';
import type { Static } from '@feathersjs/typebox';
import { getValidator, querySyntax, Type } from '@feathersjs/typebox';

import type { HookContext } from '../../declarations';
import { dataValidator, queryValidator } from '../../validators';


const entryProperties = {
  id: Type.Number(),
  name: Type.String(),
  done: Type.Optional(Type.Boolean()),
};
// Main data model schema
export const listSchema = Type.Object(
  {
    id: Type.Number(),
    listid: Type.String(),

    owner: Type.String(),

    name: Type.String(),
    description: Type.String(),

    entries: Type.Array(Type.Object(entryProperties)),
    checkedEntries: Type.Array(Type.Object(entryProperties)),

    backgroundURI: Type.Optional(Type.String()),
  },
  { $id: 'List', additionalProperties: false },
);
export type List = Static<typeof listSchema>
export const listValidator = getValidator(listSchema, dataValidator);
export const listResolver = resolve<List, HookContext>({});

export const listExternalResolver = resolve<List, HookContext>({});

// Schema for creating new entries
export const listDataSchema = Type.Pick(listSchema, ['listid', 'owner', 'name', 'description', 'entries', 'checkedEntries', 'backgroundURI'], {
  $id: 'ListData',
});
export type ListData = Static<typeof listDataSchema>
export const listDataValidator = getValidator(listDataSchema, dataValidator);
export const listDataResolver = resolve<List, HookContext>({});

// Schema for updating existing entries
export const listPatchSchema = Type.Partial(listSchema, {
  $id: 'ListPatch',
});
export type ListPatch = Static<typeof listPatchSchema>
export const listPatchValidator = getValidator(listPatchSchema, dataValidator);
export const listPatchResolver = resolve<List, HookContext>({});

// Schema for allowed query properties
export const listQueryProperties = Type.Pick(listSchema, ['id', 'listid', 'owner', 'name', 'description', 'entries', 'checkedEntries', 'backgroundURI']);
export const listQuerySchema = Type.Intersect(
  [
    querySyntax(listQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false }),
  ],
  { additionalProperties: false },
);
export type ListQuery = Static<typeof listQuerySchema>
export const listQueryValidator = getValidator(listQuerySchema, queryValidator);
export const listQueryResolver = resolve<ListQuery, HookContext>({});
