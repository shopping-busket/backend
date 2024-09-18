// For more information about this file see https://dove.feathersjs.com/guides/cli/knexfile.html
import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('ingredients', (table) => {
    table.increments('id').notNullable().primary();

    table.integer('recipeId').notNullable();
    table.foreign('recipeId').references('recipe.id').onDelete('CASCADE').onUpdate('CASCADE');

    table.string('name').notNullable();
    table.string('hint').nullable();

    table.float('amount').nullable();
    table.string('unit').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('ingredients');
}
