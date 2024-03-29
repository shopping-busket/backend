// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema';
import type { Static } from '@feathersjs/typebox';
import { getValidator, querySyntax, Type } from '@feathersjs/typebox';

import type { HookContext } from '../../declarations';
import { dataValidator, queryValidator } from '../../validators';
import { User } from '../users/users.schema';
import { BadRequest, Forbidden } from '@feathersjs/errors';
import { app } from '../../app';
import { WhitelistedUsers } from '../whitelisted-users/whitelisted-users.schema';
import { ListParams } from './list.class';
import { randomUUID } from 'crypto';
import { calledInternally, onlyAllowInternalValue } from '../../helpers/channelSecurity';
import { IShoppingListItem } from '../../shoppinglist/ShoppingList';
import _ from 'lodash';


const entryProperties = Type.Object({
  id: Type.String({ format: 'uuid' }),
  name: Type.String(),
});

// Main data model schema
export const listSchema = Type.Object(
  {
    id: Type.Number(),
    listid: Type.String({ format: 'uuid' }),

    owner: Type.String({ format: 'uuid' }),

    name: Type.String({ minLength: 1 }),
    description: Type.String(),

    entries: Type.Array(entryProperties),
    checkedEntries: Type.Array(entryProperties),

    backgroundURI: Type.Optional(Type.String()),
  },
  { $id: 'List', additionalProperties: false },
);
export type List = Static<typeof listSchema>
export const listValidator = getValidator(listSchema, dataValidator);
export const listResolver = resolve<List, HookContext>({});

export const listExternalResolver = resolve<List, HookContext>({});

// Schema for creating new entries
export const listDataSchema = Type.Pick(listSchema, ['name', 'description', 'entries', 'checkedEntries', 'backgroundURI'], {
  $id: 'ListData',
});
export type ListData = Static<typeof listDataSchema>
export const listDataValidator = getValidator(listDataSchema, dataValidator);
/*export const internalListDataSchema = Type.Intersect([
  listSchema,
  serverInternalEntryProperties,
]);*/
// type InternalListDataSchema = Static<typeof internalListDataSchema>;
export const listDataResolver = resolve<List, HookContext>({
  listid: async () => randomUUID(),
  owner: async (value, list, ctx) => (ctx.params as ListParams).user?.uuid,
  entries: async (value) => ({ items: _.castArray(value) } as unknown as IShoppingListItem[]),
  checkedEntries: async (value) => ({ items: _.castArray(value) } as unknown as IShoppingListItem[])
});

// Schema for updating existing entries
export const listPatchSchema = Type.Partial(listSchema, {
  $id: 'ListPatch',
});
export type ListPatch = Static<typeof listPatchSchema>
export const listPatchValidator = getValidator(listPatchSchema, dataValidator);

const checkIfOwner = async <T>(value: T | undefined, list: Partial<List>, ctx: HookContext): Promise<T | undefined> => {
  if (!value || calledInternally(ctx)) return value;
  if (!(ctx.params.query as List).listid) throw new Error('Patch only allowed with listid as query arg!');
  const knex = app.get('postgresqlClient');

  const { owner: listOwner } = await knex('list').select('owner').where({
    listid: (ctx.params.query as List).listid,
  } as Partial<List>).first() as Pick<List, 'owner'>;

  if (listOwner !== (ctx.params as ListParams).user?.uuid) throw new Error('Only the list\'s owner is allowed to edit the list\'s name!');
  return value;
};

export const listPatchResolver = resolve<List, HookContext>({
  name: checkIfOwner<string>,
  description: checkIfOwner<string>,
  backgroundURI: checkIfOwner<string>,
  entries: onlyAllowInternalValue<any>,
  checkedEntries: onlyAllowInternalValue<any>,
});

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
export type ListQuery = Static<typeof listQuerySchema>;
export const listQueryValidator = getValidator(listQuerySchema, queryValidator);
export const listQueryResolver = resolve<ListQuery, HookContext>({
  id: async (value, shoppingList, context) => {
    if (context.method === 'create' || calledInternally(context)) return value;
    value = context.id as number | undefined;

    const knex = app.get('postgresqlClient');
    const userUUID = (context.params.user as User).uuid;
    if (!userUUID) return;

    const where: Partial<List> = {};
    if (value) where.id = value as number;
    else if (shoppingList.listid) where.listid = shoppingList.listid as string;
    else throw new BadRequest('Either listId or id have to be present! Neither are...');

    const { owner } = (await knex('list').select('owner').where(where).first() as {
      owner: string
    } | null) ?? { owner: null };

    if (owner && owner === userUUID) return value;
    else if (shoppingList.listid) {
      const whitelist = await knex('whitelisted-users').select('user', 'listId').where({
        listId: shoppingList.listid,
      }) as Pick<WhitelistedUsers, 'user' | 'listId'>[];

      let isWhitelisted = false;
      whitelist.forEach((whitelist) => {
        if (!isWhitelisted && whitelist.user === userUUID) isWhitelisted = true;
      });

      if (isWhitelisted || (owner != null && owner === userUUID)) return value;
    }
    throw new Forbidden('You are not allowed to access this content.');
  },
});
