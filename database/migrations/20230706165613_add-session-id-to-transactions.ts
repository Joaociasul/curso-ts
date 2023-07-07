import { Knex } from 'knex'

const tablename = 'transactions'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable(tablename, (table) => {
    table.uuid('session_id').after('id').index()
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable(tablename, (table) => {
    table.dropColumn('session_id')
  })
}
