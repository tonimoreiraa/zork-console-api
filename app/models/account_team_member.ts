import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import AccountTeam from './account_team.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import AccountMember from './account_member.js'

export default class AccountTeamMember extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare teamId: number

  @belongsTo(() => AccountTeam)
  declare team: BelongsTo<typeof AccountTeam>

  @column()
  declare memberId: number

  @belongsTo(() => AccountMember)
  declare member: BelongsTo<typeof AccountMember>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}