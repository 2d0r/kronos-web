import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable('tasks', (table) => {
        table.string('mindset');
        table.string('status');
    });

    await knex.schema.createTable('mindsets', (table) => {
        table.string('id', 25).primary();
        table.string('name');
    })

    await knex.schema.createTable('statuses', (table) => {
        table.string('id', 25).primary();
        table.string('name');
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('tasks', (table) => {
        table.dropColumn('mindset');
        table.dropColumn('status');
    });

    await knex.schema.dropTable('mindsets');

    await knex.schema.dropTable('statuses');
}

