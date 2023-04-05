import { Knex } from 'knex';


export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('list', (table) => {
    table.increments('id');

    table.uuid('listid').unique().notNullable();
    table.uuid('owner').notNullable();

    table.string('name').notNullable();
    table.string('description');

    table.specificType('entries', 'JSON[]');
    table.specificType('checkedEntries', 'JSON[]');

    table.string('backgroundURI').nullable();
  });
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('list');
}

