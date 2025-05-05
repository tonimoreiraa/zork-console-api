import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

// Auth resource
const AuthController = () => import('#controllers/auth_controller')

router.post('/auth/sign-in', [AuthController, 'signIn'])
router.post('/auth/sign-up', [AuthController, 'signUp'])
const AccountsController = () => import('#controllers/accounts_controller')

router.post('/accounts/:id/deploy', [AccountsController, 'deploySettings'])


const PaymentsController = () => import('#controllers/payments_controller')

router.group(() => {

  // Accounts resource
  router.resource('/accounts', AccountsController)
    .only(['store', 'index'])
    .use('*', middleware.auth())

  // Account members resource
  const AccountMembersController = () => import('#controllers/account_members_controller')
  router.resource('/account-members', AccountMembersController)
    .only(['store', 'destroy', 'index'])
  router.post('/account-members/many', [AccountMembersController, 'storeMany'])

  // Account Teams resource
  const AccountTeamsController = () => import('#controllers/account_teams_controller')
  router.resource('/account-teams', AccountTeamsController)
  router.post('/account-teams/many', [AccountTeamsController, 'storeMany'])

  // WhatsApp Resource
  const WhatsAppsController = () => import('#controllers/whatsapps_controller')
  router.get('/whatsapps', [WhatsAppsController, 'index'])
  router.post('/whatsapps', [WhatsAppsController, 'createInstance'])
  router.get('/whatsapps/:id/status', [WhatsAppsController, 'getStatus'])
  router.delete('/whatsapps/:id', [WhatsAppsController, 'destroy'])

  // Payment
  router.post('/payments/create-payment-intent', [PaymentsController, 'createPaymentIntent'])
  // router.get('/payments/stripe-webhook', [PaymentsController, 'stripeWebhook'])

  router.get('/auth/session', [AuthController, 'getSession'])

}).middleware(middleware.auth())

router.get('/plans', [PaymentsController, 'listPlans'])