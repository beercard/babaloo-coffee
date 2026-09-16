/**
 * Development helper: prints a login token for a LOCAL user (no password involved), so automated
 * browser checks can open the admin as that user. Refuses to run against a remote database.
 *
 *   node src/scripts/dev-token.ts editor@example.com
 */
import 'dotenv/config';
import { randomUUID } from 'crypto';
import { getFieldsToSign, getPayload, jwtSign } from 'payload';
import config from '../payload.config';

const email = process.argv[2];
if (!email) throw new Error('Usage: dev-token.ts <email>');
if (!(process.env.DATABASE_URL ?? 'file:').startsWith('file:')) throw new Error('dev-token only works with a local SQLite file');

const payload = await getPayload({ config });
const collection = payload.collections.users.config;
const { docs } = await payload.find({ collection: 'users', where: { email: { equals: email } }, limit: 1, depth: 0, showHiddenFields: true });
const user = docs[0] as (typeof docs)[number] & { sessions?: { id: string; createdAt: string; expiresAt: string }[] };
if (!user) throw new Error(`No user ${email}`);

const tokenExpiration = collection.auth.tokenExpiration;
const sid = randomUUID();
const now = new Date();
const sessions = [...(user.sessions ?? []), { id: sid, createdAt: now.toISOString(), expiresAt: new Date(now.getTime() + tokenExpiration * 1000).toISOString() }];
await payload.db.updateOne({ collection: 'users', id: user.id, data: { sessions } as never, req: undefined as never });

const fieldsToSign = getFieldsToSign({ collectionConfig: collection, email, sid, user: { ...user, collection: 'users' } as never });
const { token } = await jwtSign({ fieldsToSign, secret: payload.secret, tokenExpiration });
console.log(token);
process.exit(0);
