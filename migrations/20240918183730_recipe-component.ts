// For more information about this file see https://dove.feathersjs.com/guides/cli/knexfile.html
import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('recipe-component', (table) => {
    table.increments('id').notNullable().primary();

    table.integer('recipeId').notNullable();
    table.foreign('recipeId').references('recipe.id').onDelete('CASCADE').onUpdate('CASCADE');

    table.enum('type', ['ul', 'ol', 'text', 'subtitle', 'image']);
    /**
     * The [type] col of the table decides what the value in content is for.
     * ul, ol → content will be null
     * text, subtitle → content will be the text or subtitle string
     * image → content will be the image's path
     */
    table.string('content').nullable();
    /**
     * When [type] is ul or ol, each entry in the array will be one list bulletin
     */
    table.specificType('listContent', 'VARCHAR(255)[]').nullable();

    // Optional note for images displayed as gray text below the image
    table.string('note').nullable();

    table.integer('sortingOrder').notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('recipe-component');
}
