import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'account_teams'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('chatwoot_team_id')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('chatwoot_team_id')
    })
  }
}