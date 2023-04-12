// For more information about this file see https://dove.feathersjs.com/guides/cli/knexfile.html
import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('whitelisted-users', (table) => {
    table.increments('id');

    table.uuid('user').nullable();
    table.foreign('user').references('users.uuid').onUpdate('CASCADE').onDelete('CASCADE');

    table.uuid('listId').notNullable();
    table.foreign('listId').references('list.listid').onUpdate('CASCADE').onDelete('CASCADE');

    table.string('inviteEmail').nullable();

    table.boolean('canEditEntries').notNullable().defaultTo(true);
    table.boolean('canDeleteEntries').notNullable().defaultTo(false);

    table.uuid('inviteSecret').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('whitelisted-users');
}
