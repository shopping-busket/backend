// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema';
import type { Static } from '@feathersjs/typebox';
import { getValidator, querySyntax, Type } from '@feathersjs/typebox';

import type { HookContext } from '../../declarations';
import { dataValidator, queryValidator } from '../../validators';
import { app } from '../../app';
import { BadRequest, Forbidden } from '@feathersjs/errors';
import { WhitelistedUsersParams } from './whitelisted-users.class';
import { List } from '../list/list.schema';

// Main data model schema
export const whitelistedUsersSchema = Type.Object(
  {
    id: Type.Number(),
    user: Type.Optional(Type.String({ format: 'uuid' })),
    inviteEmail: Type.Optional(Type.String({ format: 'email' })),
    listId: Type.String({ format: 'uuid' }),
    inviteSecret: Type.Optional(Type.String({ format: 'uuid' })),

    canEditEntries: Type.Optional(Type.Boolean({ default: true })),
    canDeleteEntries: Type.Optional(Type.Boolean({ default: false })),
  },
  { $id: 'WhitelistedUsers', additionalProperties: false },
);
export type WhitelistedUsers = Static<typeof whitelistedUsersSchema>;
export const whitelistedUsersResolver = resolve<WhitelistedUsers, HookContext>({});

export const whitelistedUsersExternalResolver = resolve<WhitelistedUsers, HookContext>({
  inviteSecret: async () => undefined,
});

// Schema for creating new entries
export const whitelistedUsersDataSchema = Type.Pick(whitelistedUsersSchema, ['inviteEmail', 'listId'], {
  $id: 'WhitelistedUsersData',
});
export type WhitelistedUsersData = Static<typeof whitelistedUsersDataSchema>;
export const whitelistedUsersDataValidator = getValidator(whitelistedUsersDataSchema, dataValidator);
export const whitelistedUsersDataResolver = resolve<WhitelistedUsers, HookContext>({
  inviteEmail: async (value, whitelist) => {
    if (!value) throw new Error('error: inviteEmail not defined on create (whitelisted-users)[whitelistedUsersDataResolver]: this should not be possible because of typebox validation!');
    const knex = app.get('postgresqlClient');

    const rowsWithSameEmail = await knex('whitelisted-users').select('listId').where({
      inviteEmail: value,
    } as Partial<WhitelistedUsers>) as Pick<WhitelistedUsers, 'listId'>[];

    let allowContinue = true;
    rowsWithSameEmail.forEach(({ listId }) => {
      if (listId === whitelist.listId) allowContinue = false; // there is already an invitation with the same email on this list
    });

    if (allowContinue) return value;
    throw new BadRequest('There is already a whitelisted user with the same email on the same list. There can only be one at a time!');
  },
});

// Schema for updating existing entries
export const whitelistedUsersPatchSchema = Type.Pick(whitelistedUsersSchema, ['inviteSecret', 'canDeleteEntries', 'canEditEntries'] as (keyof WhitelistedUsers)[], {
  $id: 'WhitelistedUsersPatch',
});
export type WhitelistedUsersPatch = Static<typeof whitelistedUsersPatchSchema>;
export const whitelistedUsersPatchValidator = getValidator(whitelistedUsersPatchSchema, dataValidator);
export const whitelistedUsersPatchResolver = resolve<WhitelistedUsers, HookContext>({
  user: async (value, whitelist, ctx) => {
    if (!ctx.id) throw new BadRequest('db id has to be present!');

    const knex = app.get('postgresqlClient');
    const whitelisted = await knex('whitelisted-users').select('user').where({
      id: ctx.id,
    }).first() as WhitelistedUsers;

    if (Object.keys(ctx.data as Partial<WhitelistedUsers>).includes('inviteSecret' as keyof WhitelistedUsers)) {
      if (whitelisted.user != null) throw new Forbidden('This share link is already used by another person. Cannot override user!');
      return (ctx.params as WhitelistedUsersParams).user?.uuid;
    } else if (whitelist.user == null) return undefined;
    throw new Error('Only the invited user (not the list\'s creator) is allowed to edit his uuid. If you are the invited user, pass the inviteSecret for first time patch to user!');
  },
  inviteSecret: async (value, whitelist, ctx) => {
    const id = ctx.arguments[0];
    if (id == null) throw new BadRequest('whitelist.id not allowed to be null at this point: whitelistedUsersPatchResolver.inviteSecret()');

    const knex = app.get('postgresqlClient');

    const whitelistedUser = await knex('whitelisted-users').select().where({
      id: id,
    }).first() as WhitelistedUsers | null;
    if (whitelistedUser == null) throw new Forbidden('inviteSecret expired.');

    const { owner: listOwner } = await knex('list').select('owner').where({
      listid: whitelistedUser.listId,
    }).first() as Pick<List, 'owner'>;

    let allow = true;
    Object.keys(ctx.arguments[1] as WhitelistedUsers).forEach((key) => {
      if (key !== 'canEditEntries' && key !== 'canDeleteEntries') allow = false;
      else if (listOwner !== (ctx.params as WhitelistedUsersParams).user?.uuid) allow = false;
    });

    if (allow || whitelistedUser.user != null) return undefined;
    if (value != null) return undefined;
    throw new BadRequest('inviteSecret shouldn\'t be null or undefined until user uuid is set!');
  },
});

// Schema for allowed query properties
export const whitelistedUsersQueryProperties = Type.Pick(whitelistedUsersSchema, ['listId']);
export const whitelistedUsersQuerySchema = Type.Intersect(
  [
    querySyntax(whitelistedUsersQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false }),
  ],
  { additionalProperties: false },
);
export type WhitelistedUsersQuery = Static<typeof whitelistedUsersQuerySchema>;
export const whitelistedUsersQueryValidator = getValidator(whitelistedUsersQuerySchema, queryValidator);
export const whitelistedUsersQueryResolver = resolve<WhitelistedUsersQuery, HookContext>({
  listId: async (value, whitelist, ctx) => {
    if (ctx.method != 'find') return value;
    if (value == null) throw new Error('this shouldn\'t be possible: whitelistedUsersQueryResolver.listId.value is null or undefined! check chain!');

    const knex = app.get('postgresqlClient');
    const { owner: listOwner } = await knex('list').select('owner').where({
      listid: value,
    } as Partial<List>).first() as Pick<List, 'owner'>;

    if (!listOwner) throw new Error('this shouldn\'t be possible: whitelistedUsersQueryResolver.listId.listOwner is null or undefined! check chain!');

    if (listOwner === (ctx.params as WhitelistedUsersParams).user?.uuid) return value;
    throw new BadRequest('You are not allowed to access this content! Only the list\'s owner is allowed to query this.');
  },
});
