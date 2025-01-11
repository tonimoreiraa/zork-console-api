import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'inbox_whatsapps'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('account_id').unsigned().references('id').inTable('accounts').onDelete('CASCADE')
      table.string('instance_name').notNullable()
      table.string('instance_id').notNullable()
      table.string('hash').notNullable()
      table.string('server').notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}