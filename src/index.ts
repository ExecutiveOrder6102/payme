import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { html } from './html'
import { NWCClient } from './nwc'
import { finalizeEvent, getPublicKey, nip04, SimplePool } from 'nostr-tools'

type Bindings = {
    PAYME_KV: KVNamespace
    NWC_URI: string
    PRICE_SATS: string
    OWNER_PUBKEY: string
    APP_PRIVKEY: string
    TURNSTILE_SITE_KEY: string
    TURNSTILE_SECRET_KEY: string
}

function hexToBytes(hex: string): Uint8Array {
    if (hex.length % 2 !== 0) throw new Error('Invalid hex string')
    const bytes = new Uint8Array(hex.length / 2)
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(hex.substr(i * 2, 2), 16)
    }
    return bytes
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
        const description = `Message from ${name}`
        const invoice = await nwc.makeInvoice(price, description)

        // Check if invoice already exists
        const existing = await c.env.PAYME_KV.get(invoice.payment_hash)
        let shouldUpdate = true

        if (existing) {
            const existingData = JSON.parse(existing)
            if (existingData.status === 'paid') {
                shouldUpdate = false
                console.log('Invoice already paid, skipping KV overwrite')
            }
        }

        if (shouldUpdate) {
            // Store message in KV with payment hash as key
            // We store it as pending
            const data = {
                name,
                contact,
                message,
                status: 'pending',
                created_at: Date.now()
            }
            await c.env.PAYME_KV.put(invoice.payment_hash, JSON.stringify(data), { expirationTtl: 3600 }) // 1 hour expiry
        }

        return c.json(invoice)
    } catch (err: any) {
        return c.json({ error: err.message }, 500)
    }
})

app.get('/api/check/:hash', async (c) => {
    const hash = c.req.param('hash')
    const dataStr = await c.env.PAYME_KV.get(hash)

    if (!dataStr) {
        return c.json({ error: 'Invoice not found or expired' }, 404)
    }

    const data = JSON.parse(dataStr)
    if (data.status === 'paid') {
        return c.json({ paid: true })
    }

    const nwcUri = c.env.NWC_URI
    try {
        console.log('Checking payment for hash:', hash)
        const nwc = new NWCClient(nwcUri)
        const status = await nwc.lookupInvoice(hash)
        console.log('Payment status:', status)

        if (status.paid) {
            // Update status
            data.status = 'paid'
            await c.env.PAYME_KV.put(hash, JSON.stringify(data))

            // Send DM in background
            c.executionCtx.waitUntil(sendDM(c.env, data))

            return c.json({ paid: true })
        }

        return c.json({ paid: false })
    } catch (err: any) {
        return c.json({ error: err.message }, 500)
    }
})

async function sendDM(env: Bindings, data: any) {
    if (!env.APP_PRIVKEY || !env.OWNER_PUBKEY) {
        console.error('Missing Nostr keys for DM')
        return
    }

    const sk = hexToBytes(env.APP_PRIVKEY)
    const pk = getPublicKey(sk)
    const recipient = env.OWNER_PUBKEY

    const content = `New Paid Message!
From: ${data.name}
Contact: ${data.contact}

${data.message}`

    // Encrypt content
    const encrypted = await nip04.encrypt(sk, recipient, content)

    const event = {
        kind: 4,
        created_at: Math.floor(Date.now() / 1000),
        tags: [['p', recipient]],
        content: encrypted,
        pubkey: pk,
    }

    const signedEvent = finalizeEvent(event, sk)

    // Publish to a few default relays
    const relays = ['wss://relay.damus.io', 'wss://relay.primal.net', 'wss://nos.lol']

    try {
        const pool = new SimplePool()
        await Promise.any(pool.publish(relays, signedEvent))
        pool.close(relays)
        console.log('DM sent successfully')
    } catch (err) {
        console.error('Failed to send DM:', err)
    }
}

export default app
