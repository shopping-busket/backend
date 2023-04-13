// For more information about this file see https://dove.feathersjs.com/guides/cli/knexfile.html
import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('library', (table) => {
    table.increments('id');

    table.uuid('user');
    table.foreign('user').references('users.uuid').onUpdate('CASCADE').onDelete('CASCADE');

    table.uuid('listId');
    table.foreign('listId').references('list.listid').onUpdate('CASCADE').onDelete('CASCADE');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('library');
}

