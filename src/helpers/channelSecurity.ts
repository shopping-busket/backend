import { List } from '../services/list/list.schema';
import { Event } from '../services/event/event.schema';
import { WhitelistedUsers } from '../services/whitelisted-users/whitelisted-users.schema';
import { Paginated, Params } from '@feathersjs/feathers';
import { app } from '../app';
import { HookContext } from '../declarations';
import { LibraryParams } from '../services/library/library.class';

export const onlyAllowWhitelistedOrOwner = async (data: List | List[] | Paginated<List> | Event | Event[] | Paginated<Event>) => {
  if (Object.prototype.hasOwnProperty.call(data, 'data')) throw new Error('Pagination not supported by publisher. have to implement');
  if (Array.isArray(data)) throw new Error('arrays not supported by publisher. have to implement');

  const knex = app.get('postgresqlClient');
  const list = Object.prototype.hasOwnProperty.call(data, 'owner') ? data as List : await knex('list').select().where({
    listid: (data as Event).listid,
  }).first() as List;


  const whitelisted = await knex('whitelisted-users').select('user').where({
    listId: list.listid,
  } as Partial<WhitelistedUsers>) as Pick<WhitelistedUsers, 'user'>[];
  const whitelistedUsers = whitelisted.map(w => w.user)

  return app.channel(app.channels).filter(conn => conn.user.uuid != null && (conn.user.uuid === list.owner || whitelistedUsers.includes(conn.user.uuid)));
};

export const requireDataToBeObject = <T>(data: T | T[] | Paginated<T>): T => {
  if (Object.prototype.hasOwnProperty.call(data, 'total')) throw new Error('Pagination not supported by this publisher!');
  if (Array.isArray(data)) throw new Error('Arrays are not supported by this publisher!');
  return data as T;
};

export const calledInternally = (ctx: HookContext) => {
  return (ctx.params as Params).provider === undefined;
}
