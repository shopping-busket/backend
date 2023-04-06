// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema';
import type { Static } from '@feathersjs/typebox';
import { getValidator, querySyntax, Type } from '@feathersjs/typebox';

import type { HookContext } from '../../declarations';
import { dataValidator, queryValidator } from '../../validators';
import { app } from '../../app';
import { BadRequest } from '@feathersjs/errors';
import { WhitelistedUsersParams } from './whitelisted-users.class';
import { List } from '../list/list.schema';

// Main data model schema
export const whitelistedUsersSchema = Type.Object(
  {
    id: Type.Number(),
    user: Type.Optional(Type.String({ format: 'uuid' })),
    inviteEmail: Type.Optional(Type.String({ format: 'email' })),
    listId: Type.String({ format: 'uuid' }),
    inviteSecret: Type.String({ format: 'uuid' }),

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
export const whitelistedUsersPatchSchema = Type.Pick(whitelistedUsersSchema, ['user', 'canDeleteEntries', 'canEditEntries'] as (keyof WhitelistedUsers)[], {
  $id: 'WhitelistedUsersPatch',
});
export type WhitelistedUsersPatch = Static<typeof whitelistedUsersPatchSchema>;
export const whitelistedUsersPatchValidator = getValidator(whitelistedUsersPatchSchema, dataValidator);
export const whitelistedUsersPatchResolver = resolve<WhitelistedUsers, HookContext>({
  user: async (value, whitelist, ctx) => {
    if ((ctx.params as WhitelistedUsersParams).user?.uuid === value || value == null) return value;
    throw new BadRequest('Only the user this whitelist entry belongs to (not the list\'s creator) can edit the user column!');
  },
  inviteSecret: async (value, whitelist, ctx) => {
    const id = ctx.arguments[0];
    if (id == null) throw new BadRequest('whitelist.id not allowed to be null at this point: whitelistedUsersPatchResolver.inviteSecret()');

    const knex = app.get('postgresqlClient');

    const whitelistedUser = await knex('whitelisted-users').select().where({
      id: id,
    }).first() as WhitelistedUsers;
    const { owner: listOwner } = await knex('list').select('owner').where({
      listid: whitelistedUser.listId,
    }).first() as Pick<List, 'owner'>;

    let allow = true;
    Object.keys(ctx.arguments[1] as WhitelistedUsers).forEach((key) => {
      if (key !== 'canEditEntries' && key !== 'canDeleteEntries') allow = false;
      else if (listOwner !== (ctx.params as WhitelistedUsersParams).user?.uuid) allow = false;
    });

    if (allow || (whitelistedUser.user != null || value != null)) return undefined;
    throw new BadRequest('inviteSecret shouldn\'t be null or undefined until user uuid is set!');
  },
});

// Schema for allowed query properties
export const whitelistedUsersQueryProperties = Type.Pick(whitelistedUsersSchema, ['id', 'user', 'listId']);
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
export const whitelistedUsersQueryResolver = resolve<WhitelistedUsersQuery, HookContext>({});
