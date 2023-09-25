// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema';
import type { Static } from '@feathersjs/typebox';
import { getValidator, querySyntax, Type } from '@feathersjs/typebox';

import type { HookContext } from '../../declarations';
import { dataValidator, queryValidator } from '../../validators';
import { app } from '../../app';
import { WhitelistedUsers } from '../whitelisted-users/whitelisted-users.schema';
import { List } from '../list/list.schema';
import { EventParams } from './event.class';
import { BadRequest, Forbidden, NotAuthenticated, NotFound } from '@feathersjs/errors';
import { EventType } from './eventReceiver.types';

// Main data model schema
export const eventSchema = Type.Object(
  {
    listid: Type.String({ format: 'uuid' }),
    eventData: Type.Object({
      id: Type.Optional(Type.Number()),
      event: Type.Enum(EventType),
      entryId: Type.String({ format: 'uuid' }),
      state: Type.Object({
        name: Type.String(),
        /**
         * @deprecated
         */
        done: Type.Optional(Type.Boolean()),
        markAsDone: Type.Optional(Type.Boolean()),

        aboveEntry: Type.Optional(Type.String()),
        belowEntry: Type.Optional(Type.String()),

        index: Type.Optional(Type.Number()),
        oldIndex: Type.Optional(Type.Number()),
        newIndex: Type.Optional(Type.Number()),
      }),
      isoDate: Type.String(),
      sender: Type.String({ format: 'uuid' }),
    }),
  },
  { $id: 'Event', additionalProperties: false },
);
export type Event = Static<typeof eventSchema>
export const eventValidator = getValidator(eventSchema, dataValidator);
export const eventResolver = resolve<Event, HookContext>({});

export const eventExternalResolver = resolve<Event, HookContext>({});

// Schema for creating new entries
export const eventDataSchema = Type.Pick(eventSchema, ['listid', 'eventData'], {
  $id: 'EventData',
});
export type EventData = Static<typeof eventDataSchema>
export const eventDataValidator = getValidator(eventDataSchema, dataValidator);
export const eventDataResolver = resolve<Event, HookContext>({
  listid: async (value, event, ctx) => {
    const knex = app.get('postgresqlClient');
    const whitelisted = await knex('whitelisted-users').select('user').where({
      listId: event.listid,
    } as Partial<WhitelistedUsers>) as Pick<WhitelistedUsers, 'user'>[];
    const whitelistedUsers = whitelisted.map(w => w.user);

    const list = await knex('list').select('owner').where({
      listid: event.listid,
    } as Partial<List>).first() as Pick<List, 'owner'> | undefined;
    if (list === undefined) throw new NotFound(`List with id ${event.listid} not found!`);


    const loggedInUser = (ctx.params as EventParams).user?.uuid;
    if (!loggedInUser) throw new NotAuthenticated();

    if (loggedInUser === list.owner || whitelistedUsers.includes(loggedInUser)) return value;
    throw new Forbidden('You are not permitted to access this content!');
  },
  eventData: async (value, event, ctx) => {
    if (!value) throw new BadRequest('eventData shall not be undefined!');
    if (value.state.name.trim().length <= 0) throw new BadRequest('eventData.state.name must include more than 0 non-whitespace characters!');

    return {
      ...value,
      isoDate: new Date().toISOString(),
    };
  },
});

// Schema for updating existing entries
export const eventPatchSchema = Type.Partial(eventSchema, {
  $id: 'EventPatch',
});
export type EventPatch = Static<typeof eventPatchSchema>
export const eventPatchValidator = getValidator(eventPatchSchema, dataValidator);
export const eventPatchResolver = resolve<Event, HookContext>({});

// Schema for allowed query properties
export const eventQueryProperties = Type.Pick(eventSchema, ['listid', 'eventData']);
export const eventQuerySchema = Type.Intersect(
  [
    querySyntax(eventQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false }),
  ],
  { additionalProperties: false },
);
export type EventQuery = Static<typeof eventQuerySchema>
export const eventQueryValidator = getValidator(eventQuerySchema, queryValidator);
export const eventQueryResolver = resolve<EventQuery, HookContext>({});
