import { finalizeEvent, getPublicKey, nip04, Relay } from 'nostr-tools'

export interface NWCConfig {
    uri: string
}

export interface InvoiceResponse {
    payment_request: string
    payment_hash: string
}

function hexToBytes(hex: string): Uint8Array {
    if (hex.length % 2 !== 0) throw new Error('Invalid hex string')
    const bytes = new Uint8Array(hex.length / 2)
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(hex.substr(i * 2, 2), 16)
    }
    return bytes
}

export class NWCClient {
    private relayUrl: string
    private walletPubkey: string
    private secret: string | undefined

    constructor(uri: string) {
        const { relayUrl, walletPubkey, secret } = this.parseURI(uri)
        this.relayUrl = relayUrl
        this.walletPubkey = walletPubkey
        this.secret = secret
    }

    private parseURI(uri: string) {
        if (!uri.startsWith('nostr+walletconnect://')) {
            throw new Error('Invalid NWC URI')
        }
        const url = new URL(uri.replace('nostr+walletconnect://', 'https://'))
        const walletPubkey = url.host
        const relayUrl = url.searchParams.get('relay')
        const secret = url.searchParams.get('secret')

        if (!relayUrl || !walletPubkey || !secret) {
            throw new Error('Invalid NWC URI components')
        }

        return { relayUrl, walletPubkey, secret }
    }

    async makeInvoice(amountSats: number, description: string): Promise<InvoiceResponse> {
        const payload = {
            method: 'make_invoice',
            params: {
                amount: amountSats * 1000, // msats
                description,
            },
        }

        const result = await this.sendRequest(payload)
        if (result.error) {
            throw new Error(result.error.message)
        }
        return {
            payment_request: result.result.invoice,
            payment_hash: result.result.payment_hash
        }
    }

    async lookupInvoice(paymentHash: string): Promise<{ paid: boolean }> {
        const payload = {
            method: 'lookup_invoice',
            params: {
                payment_hash: paymentHash,
            },
        }

        const result = await this.sendRequest(payload)
        if (result.error) {
            console.error('NWC lookup error:', result.error)
            throw new Error(result.error.message)
        }

        console.log('NWC lookup result:', JSON.stringify(result))
        const invoiceData = result.result
        const paid = !!invoiceData.settled_at
        return { paid }
    }

    private async sendRequest(payload: any): Promise<any> {
        if (!this.secret) throw new Error('No secret in NWC URI')

        const sk = hexToBytes(this.secret)
        const pk = getPublicKey(sk)

        const event = {
            kind: 23194, // NIP-47 Request
            created_at: Math.floor(Date.now() / 1000),
            tags: [['p', this.walletPubkey]],
            content: await nip04.encrypt(sk, this.walletPubkey, JSON.stringify(payload)),
            pubkey: pk,
        }

        const signedEvent = finalizeEvent(event, sk)

        const relay = await Relay.connect(this.relayUrl)

        try {
            return await new Promise<any>((resolve, reject) => {
                const timeout = setTimeout(() => {
                    relay.close()
                    reject(new Error('NWC Timeout'))
                }, 10000)

                relay.subscribe([
                    {
                        kinds: [23195], // NIP-47 Response
                        authors: [this.walletPubkey],
                        '#p': [pk],
                        since: Math.floor(Date.now() / 1000) - 5
                    }
                ], {
                    onevent: async (e) => {
                        if (e.tags.find(t => t[0] === 'e' && t[1] === signedEvent.id)) {
                            clearTimeout(timeout)
                            const decrypted = await nip04.decrypt(sk, this.walletPubkey, e.content)
                            resolve(JSON.parse(decrypted))
                            relay.close()
                        }
                    }
                })

                relay.publish(signedEvent)
            })
        } catch (e) {
            relay.close()
            throw e
        }
    }
}
