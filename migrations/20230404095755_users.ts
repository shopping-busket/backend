import { Knex } from 'knex';


export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table) => {
    table.increments('id');
    table.uuid('uuid').unique();

    table.string('email');
    table.string('password');

    table.string('fullName');
    table.string('avatarURI');

    table.string('preferredLanguage');
    table.boolean('prefersDarkMode');
    table.boolean('prefersMiniDrawer');

    table.string('googleId');
    table.string('githubId');
  });
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('users');
}

