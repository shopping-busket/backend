// For more information about this file see https://dove.feathersjs.com/guides/cli/knexfile.html
import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('whitelisted-users', (table) => {
    table.increments('id');

    table.uuid('user').nullable();
    table.foreign('user').references('users.uuid');

    table.uuid('listId').notNullable();
    table.foreign('listId').references('list.listid');

    table.string('inviteEmail').nullable();

    table.boolean('canEditEntries').notNullable().defaultTo(true);
    table.boolean('canDeleteEntries').notNullable().defaultTo(false);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('whitelisted-users');
}
