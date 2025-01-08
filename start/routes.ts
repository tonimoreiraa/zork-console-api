import router from '@adonisjs/core/services/router'
router.get('/', async () => {
  return {
    hello: 'world',
  }
})

const AuthController = () => import('#controllers/auth_controller')

router.post('/auth/sign-in', [AuthController, 'signIn'])
router.post('/auth/sign-up', [AuthController, 'signUp'])