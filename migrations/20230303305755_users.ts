import { Knex } from 'knex';


export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (table) => {
    table.increments('id');
    table.uuid('uuid').unique().notNullable();

    table.string('email').unique().notNullable();
    table.string('password').notNullable();

    table.string('fullName').notNullable();
    table.string('avatarURI').notNullable();

    table.string('preferredLanguage').defaultTo('en');
    table.boolean('prefersDarkMode').defaultTo(false);
    table.boolean('prefersMiniDrawer').defaultTo(false);

    table.string('googleId');
    table.string('githubId');

    table.boolean('verifiedEmail').notNullable().defaultTo(false);
  });
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('users');
}

