/*
|--------------------------------------------------------------------------
| Bouncer abilities
|--------------------------------------------------------------------------
|
| You may export multiple abilities from this file and pre-register them
| when creating the Bouncer instance.
|
| Pre-registered policies and abilities can be referenced as a string by their
| name. Also they are must if want to perform authorization inside Edge
| templates.
|
*/

import Account from '#models/account'
import User from '#models/user'
import { Bouncer } from '@adonisjs/bouncer'

export const editAccount = Bouncer.ability(async (user: User, accountId: number) => {
  const account = await Account.findOrFail(accountId);

  return account.userId == user.id;
})