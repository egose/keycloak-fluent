import { expect, test } from 'vitest';
import type UserHandle from '../src/user';
import { withEnsuredMasterRealm } from './test-utils';

async function waitForSessions(userHandle: UserHandle, predicate: (count: number) => boolean) {
  for (let attempt = 0; attempt < 10; attempt++) {
    const sessions = await userHandle.listSessions();
    if (predicate(sessions.length)) {
      return sessions;
    }

    await new Promise((resolve) => setTimeout(resolve, 100 * (attempt + 1)));
  }

  return userHandle.listSessions();
}

test('User Sessions', async () => {
  await withEnsuredMasterRealm('testusersessionrealm', async ({ kcMaster, realm, realmHandle }) => {
    const username = 'session-user';

    const userHandle = await realmHandle.user(username).ensure({
      firstName: 'Session',
      password: 'session-user', // pragma: allowlist secret
    });

    await kcMaster.core.users.impersonation({ realm, id: userHandle.user!.id! }, { user: username, realm });

    const sessions = await waitForSessions(userHandle, (count) => count > 0);
    expect(Array.isArray(sessions)).toBe(true);
    expect(sessions.length).toBeGreaterThan(0);

    await userHandle.logoutSessions();

    const sessionsAfterLogout = await waitForSessions(userHandle, (count) => count === 0);
    expect(Array.isArray(sessionsAfterLogout)).toBe(true);
    expect(sessionsAfterLogout.length).toBe(0);
  });
});
