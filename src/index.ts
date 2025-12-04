import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { html } from './html'
import { NWCClient } from './nwc'

type Bindings = {
    NWC_URI: string
    PRICE_SATS: string
    TURNSTILE_SITE_KEY: string
    TURNSTILE_SECRET_KEY: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/*', cors())

app.get('/', (c) => {
    return c.html(html(c.env.TURNSTILE_SITE_KEY, c.env.PRICE_SATS || '1000'))
})

app.post('/api/invoice', async (c) => {
    const { name, contact, message, 'cf-turnstile-response': token } = await c.req.json()

    if (!name || !contact || !message) {
        return c.json({ error: 'Missing fields' }, 400)
    }

    const nwcUri = c.env.NWC_URI
    const price = parseInt(c.env.PRICE_SATS || '100')

    if (!nwcUri) {
        return c.json({ error: 'Server configuration error (NWC_URI)' }, 500)
    }

    // Verify Turnstile Token
    const ip = c.req.header('CF-Connecting-IP')
    const formData = new FormData()
    formData.append('secret', c.env.TURNSTILE_SECRET_KEY)
    formData.append('response', token)
    formData.append('remoteip', ip || '')

    const url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
    const result = await fetch(url, {
        body: formData,
        method: 'POST',
    })

    const outcome = await result.json() as any
    if (!outcome.success) {
        return c.json({ error: 'Invalid CAPTCHA' }, 403)
    }

    try {
        const nwc = new NWCClient(nwcUri)
        // Embed message details directly in the invoice description
        const description = `Message from ${name} (${contact}): ${message}`
        const invoice = await nwc.makeInvoice(price, description)

        return c.json(invoice)
    } catch (err: any) {
        return c.json({ error: err.message }, 500)
    }
})

app.get('/api/check/:hash', async (c) => {
    const hash = c.req.param('hash')
    const nwcUri = c.env.NWC_URI

    if (!nwcUri) {
        return c.json({ error: 'Server configuration error (NWC_URI)' }, 500)
    }

    try {
        console.log('Checking payment for hash:', hash)
        const nwc = new NWCClient(nwcUri)
        const status = await nwc.lookupInvoice(hash)
        console.log('Payment status:', status)

        return c.json({ paid: status.paid })
    } catch (err: any) {
        return c.json({ error: err.message }, 500)
    }
})

export default app
