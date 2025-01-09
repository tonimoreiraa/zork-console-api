import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

const AuthController = () => import('#controllers/auth_controller')
const AccountsController = () => import('#controllers/accounts_controller')

router.post('/auth/sign-in', [AuthController, 'signIn'])
router.post('/auth/sign-up', [AuthController, 'signUp'])

router.post('/accounts', [AccountsController, 'store'])
  .middleware(middleware.auth())