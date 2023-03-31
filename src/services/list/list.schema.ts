// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'

// Main data model schema
export const listSchema = Type.Object(
  {
    id: Type.Number(),
    text: Type.String()
  },
  { $id: 'List', additionalProperties: false }
)
export type List = Static<typeof listSchema>
export const listValidator = getValidator(listSchema, dataValidator)
export const listResolver = resolve<List, HookContext>({})

export const listExternalResolver = resolve<List, HookContext>({})

// Schema for creating new entries
export const listDataSchema = Type.Pick(listSchema, ['text'], {
  $id: 'ListData'
})
export type ListData = Static<typeof listDataSchema>
export const listDataValidator = getValidator(listDataSchema, dataValidator)
export const listDataResolver = resolve<List, HookContext>({})

// Schema for updating existing entries
export const listPatchSchema = Type.Partial(listSchema, {
  $id: 'ListPatch'
})
export type ListPatch = Static<typeof listPatchSchema>
export const listPatchValidator = getValidator(listPatchSchema, dataValidator)
export const listPatchResolver = resolve<List, HookContext>({})

// Schema for allowed query properties
export const listQueryProperties = Type.Pick(listSchema, ['id', 'text'])
export const listQuerySchema = Type.Intersect(
  [
    querySyntax(listQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type ListQuery = Static<typeof listQuerySchema>
export const listQueryValidator = getValidator(listQuerySchema, queryValidator)
export const listQueryResolver = resolve<ListQuery, HookContext>({})
