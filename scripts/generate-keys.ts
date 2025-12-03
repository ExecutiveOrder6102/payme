import { generateSecretKey, getPublicKey, nip19 } from 'nostr-tools'
import { bytesToHex } from '@noble/hashes/utils'

const sk = generateSecretKey()
const pk = getPublicKey(sk)

console.log('--- PayMe Nostr Keys ---')
console.log('Private Key (Hex):', bytesToHex(sk))
console.log('Private Key (nsec):', nip19.nsecEncode(sk))
console.log('Public Key (Hex):', pk)
console.log('Public Key (npub):', nip19.npubEncode(pk))
console.log('------------------------')
console.log('Save the Private Key (Hex or nsec) in your wrangler.toml or Cloudflare Dashboard secrets!')
console.log('Note: The app currently expects HEX for APP_PRIVKEY in wrangler.toml, but you can use nsec if you decode it.')
