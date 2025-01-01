import type { Knex } from 'knex';


export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('recipe', (table) => {
    table.string('description').notNullable().defaultTo("")
  });
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('recipe', (table) => {
    table.dropColumn('description');
  })
}

