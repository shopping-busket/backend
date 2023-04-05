// For more information about this file see https://dove.feathersjs.com/guides/cli/knexfile.html
import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('share-link-user', (table) => {
    table.increments('id');

    table.uuid('user');
    table.uuid('shareLink');

    table.foreign('user').references('users.uuid');
    table.foreign('shareLink').references('share-link.uri');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('share-link-user');
}
