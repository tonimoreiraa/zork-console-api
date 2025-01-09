import vine from '@vinejs/vine'
import { accountIdValidator } from './account.js'

export const createAccountMember = vine.compile(
    vine.object({
        name: vine.string(),
        email: vine.string(),
        role: vine.enum(['admin', 'member']),
        accountId: accountIdValidator,
    })
)