import type { Knex } from 'knex';


export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('recipe', (table) => {
    table.string('headerImagePath').nullable();
    table.string('headerImageAlt').nullable();
    table.string('headerImageNote').nullable();
  });
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('recipe', (table) => {
    table.dropColumns('headerImagePath', 'headerImageAlt', 'headerImageNote');
  });
}

