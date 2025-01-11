import { evolution } from '#config/evolution'
import InboxWhatsapp from '#models/inbox_whatsapp'
import type { HttpContext } from '@adonisjs/core/http'

export default class WhatsAppsController {

    async createInstance({ request, bouncer, response, auth }: HttpContext) {
        const accountId = request.input('accountId')
        const user = auth.getUserOrFail()

        if (await bouncer.denies('editAccount', accountId)) {
            return response.status(403).send({
                message: 'Você não tem permissão para editar essa conta.'
            })
        }

        try {
            const instanceResponse = await evolution.post('instance/create', {
                instanceName: `zork-${user.id}-${accountId}`,
                qrcode: true,
                integration: 'WHATSAPP-BAILEYS',
            })
            const whatsapp = await InboxWhatsapp.create({
                accountId,
                hash: instanceResponse.data.hash,
                instanceName: instanceResponse.data.instance.instanceName,
                instanceId: instanceResponse.data.instance.instanceId,
                server: evolution.defaults.baseURL,
            })

            return {
                ...whatsapp.serialize(),
                code: instanceResponse.data.qrcode.code,
            };
        } catch (e) {
            console.log(e);
        }
    }
}