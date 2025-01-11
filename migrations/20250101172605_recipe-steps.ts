// For more information about this file see https://dove.feathersjs.com/guides/cli/knexfile.html
import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('recipe-components');
  await knex.schema.createTable('recipe-steps', (table) => {
    table.increments('id').primary().notNullable();

    table.integer('recipeId').notNullable();
    table.foreign('recipeId').references('recipe.id').onDelete('CASCADE').onUpdate('CASCADE');

    // The greater the number, the further down the step is. Step 1 is the first step of each recipe
    table.integer('stepNumber').unsigned().notNullable();

    table.string('title').notNullable();
    // Rich content: innerHTML sanitized with colors, lists, ...
    table.string('content').notNullable();

    // file is served from backend, the path should omit host+port+protocol e.g. `/[...]`
    table.string('headerImagePath').nullable();
    table.string('headerImageAlt').nullable();
    table.string('headerImageNote').nullable();
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('recipe-steps')
}
