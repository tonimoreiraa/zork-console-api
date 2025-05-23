import { evolution } from '#config/evolution'
import InboxWhatsapp from '#models/inbox_whatsapp'
import { cuid } from '@adonisjs/core/helpers'
import type { HttpContext } from '@adonisjs/core/http'

export default class WhatsAppsController {

    async index({ request }: HttpContext)
    {
        const accountId = request.input('accountId', 1)
        const whatsapps = await InboxWhatsapp.query()
            .where('account_id', accountId)
        const instancesResponse = await evolution.get('/instance/fetchInstances')
        const instancesMap = new Map(instancesResponse.data.map((instance: any) => [
            instance.name,
            {
                connectionStatus: instance.connectionStatus,
                profileName: instance.profileName,
                profilePicUrl: instance.profilePicUrl,
                integration: instance.integration,
                ownerJid: instance.ownerJid,
            }
        ]))

        const withStatuses = await Promise.all(whatsapps.map(async (whatsapp) => {
            return {
                ...whatsapp.serialize(),
                status: instancesMap.get(whatsapp.instanceName)
            }
        }))

        return withStatuses
    }

    async createInstance({ request, bouncer, response, auth }: HttpContext) {
        const accountId = request.input('accountId', 1)
        const user = auth.getUserOrFail()

        if (await bouncer.denies('editAccount', accountId)) {
            return response.status(403).send({
                message: 'Você não tem permissão para editar essa conta.'
            })
        }

        const instanceName = `zork-${user.id}-${accountId}-` + cuid()
        const instanceResponse = await evolution.post('instance/create', {
            instanceName,
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
    }

    async getStatus({ request }: HttpContext) {
        const whatsappId = request.param('id')
        const inbox = await InboxWhatsapp.findOrFail(whatsappId)

        const response = await evolution.get('/instance/connectionState/' + inbox.instanceName)

        if (response.data.instance.state == 'connecting') {
            const qrcodeResponse = await evolution.get('/instance/connect/' + inbox.instanceName)
            return {
                ...response.data.instance,
                qrcode: qrcodeResponse.data
            }
        }

        if (response.data.instance.state == 'open') {
            const instancesResponse = await evolution.get('/instance/fetchInstances')
            const instanceData = instancesResponse.data.find((i: any) => i.id == inbox.instanceId)
            return {
                ...response.data.instance,
                instanceData
            }
        }

        return response.data.instance;
    }

    async destroy({ request }: HttpContext) {
        const whatsappId = request.param('id')
        const inbox = await InboxWhatsapp.findOrFail(whatsappId)

        await evolution.delete('/instance/logout/' + inbox.instanceName)
            .catch(_ => { })
        await evolution.delete('/instance/delete/' + inbox.instanceName)
        await inbox.delete()

        return { message: 'OK' }
    }
}