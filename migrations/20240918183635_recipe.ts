// For more information about this file see https://dove.feathersjs.com/guides/cli/knexfile.html
import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('recipe', (table) => {
    table.increments('id').notNullable().primary();

    table.string('title').notNullable();

    table.uuid('ownerId').notNullable();
    table.foreign('ownerId').references('users.uuid').onUpdate('CASCADE').onDelete('CASCADE');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('recipe');
}
