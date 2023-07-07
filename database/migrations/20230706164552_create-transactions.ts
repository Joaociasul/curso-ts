import { Knex } from 'knex'

const tablename = 'transactions'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(tablename, (table) => {
    table.uuid('id').primary()
    table.text('title').notNullable()
    table.decimal('amount', 15, 2)
    table.timestamp('create_at').defaultTo(knex.fn.now()).notNullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(tablename)
}
