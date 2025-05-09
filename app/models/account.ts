import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import AccountMember from './account_member.js'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import AccountTeam from './account_team.js'

export default class Account extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @column()
  declare name: string

  @column()
  declare cnpj: string

  @hasMany(() => AccountMember)
  declare members: HasMany<typeof AccountMember>

  @hasMany(() => AccountTeam)
  declare teams: HasMany<typeof AccountTeam>

  @column()
  declare chatwootAccountId: number

  @column()
  declare priceId: string

  @column()
  declare subscriptionId: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}