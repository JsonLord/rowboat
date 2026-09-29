import { createHash, timingSafeEqual } from 'node:crypto';
import type { Member } from '@rowboat/spaces-protocol';
import type { AuthDriver, AuthIdentity } from './auth.js';
import { HarborError } from './errors.js';
import type { Store } from './store.js';

/** One locally managed access key for a single-owner Harbor, without an external IdP. */
export class LocalTokenAuthDriver implements AuthDriver {
  private readonly digest: Buffer;

  constructor(token: string, private readonly memberId: string) {
    if (token.length < 32) throw new Error('HARBOR_LOCAL_TOKEN must contain at least 32 characters');
    this.digest = createHash('sha256').update(token).digest();
  }

  async authenticate(authorization: string | undefined, queryToken?: string | null): Promise<AuthIdentity> {
    // The desktop app's Add a dev server dialog sends dev-<entered access key>.
    const raw = authorization?.startsWith('Bearer ') ? authorization.slice(7) : queryToken;
    const candidate = raw?.startsWith('dev-') ? raw.slice(4) : undefined;
    if (!candidate || !timingSafeEqual(this.digest, createHash('sha256').update(candidate).digest())) {
      throw new HarborError('unauthorized', 'invalid local access key');
    }
    return { iss: 'local', sub: this.memberId };
  }

  async resolveMember(store: Store, identity: AuthIdentity): Promise<Member> {
    const member = identity.iss === 'local' && identity.sub === this.memberId
      ? await store.getMember(this.memberId)
      : undefined;
    if (!member) throw new HarborError('not_a_member', 'local owner is not provisioned');
    return member;
  }
}
