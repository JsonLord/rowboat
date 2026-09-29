import { afterEach, describe, expect, it } from 'vitest';
import { LocalTokenAuthDriver } from '../src/auth-local.js';
import type { RunningHarbor } from '../src/server.js';
import { startTestHarbor } from './helpers.js';

const key = 'a'.repeat(64);
let harbor: RunningHarbor | undefined;
afterEach(async () => { await harbor?.close(); harbor = undefined; });

describe('single-owner local access', () => {
  it('requires a substantial secret', () => {
    expect(() => new LocalTokenAuthDriver('short', 'owner')).toThrow(/32 characters/);
  });

  it('authenticates only the configured owner key on the wire and links to the public host', async () => {
    harbor = await startTestHarbor({
      auth: new LocalTokenAuthDriver(key, 'owner'),
      address: 'leon4gr45-rowboat.hf.space',
      seedMembers: [{ id: 'owner', displayName: 'Owner' }],
      seedSpaces: [{ name: 'Personal', creator: 'owner' }],
    });
    const url = harbor.url;
    const get = async (token?: string) => fetch(`${url}/v1/spaces`, {
      headers: token ? { authorization: `Bearer ${token}` } : {},
    });
    expect((await get()).status).toBe(401);
    expect((await get('dev-owner')).status).toBe(401);
    expect((await get('dev-' + 'b'.repeat(64))).status).toBe(401);
    const ok = await get(`dev-${key}`);
    expect(ok.status).toBe(200);
    expect((await ok.json())?.spaces).toHaveLength(1);
    const landing = await (await fetch(url)).text();
    expect(landing).toContain('org=leon4gr45-rowboat.hf.space');
    expect(landing).not.toContain('org=localhost');
  });
});
