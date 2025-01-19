import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import Account from './account.js'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import AccountTeamMember from './account_team_member.js'

export default class AccountTeam extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare accountId: number

  @belongsTo(() => Account)
  declare account: BelongsTo<typeof Account>

  @column()
  declare name: string

  @column()
  declare description: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column()
  declare chatwootTeamId: number

  @hasMany(() => AccountTeamMember, {
    foreignKey: 'teamId',
  })
  declare members: HasMany<typeof AccountTeamMember>

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}