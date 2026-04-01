import { expect, test } from 'vitest';
import { withEnsuredMasterRealm } from './test-utils';

async function waitFor<T>(operation: () => Promise<T>, predicate: (value: T) => boolean) {
  for (let attempt = 0; attempt < 10; attempt++) {
    const value = await operation();
    if (predicate(value)) {
      return value;
    }

    await new Promise((resolve) => setTimeout(resolve, 100 * (attempt + 1)));
  }

  return operation();
}

test('Realm Events', async () => {
  await withEnsuredMasterRealm('testrealmeventsrealm', async ({ kcMaster, realm, realmHandle }) => {
    const userHandle = await realmHandle.user('events-user').ensure({
      firstName: 'Events',
      password: 'events-user', // pragma: allowlist secret
    });

    const eventsConfig = await realmHandle.updateEventsConfig({
      eventsEnabled: true,
      enabledEventTypes: ['IMPERSONATE'],
      eventsListeners: ['jboss-logging'],
      adminEventsEnabled: true,
      adminEventsDetailsEnabled: true,
    });

    expect(eventsConfig.eventsEnabled).toBe(true);
    expect(eventsConfig.adminEventsEnabled).toBe(true);

    await realmHandle.clearEvents();
    await realmHandle.clearAdminEvents();

    await realmHandle.user('events-user-created-after-config').ensure({
      firstName: 'Events After Config',
      password: 'events-user-created-after-config', // pragma: allowlist secret
    });

    await kcMaster.core.users.impersonation({ realm, id: userHandle.user!.id! }, { user: 'events-user', realm });

    const events = await waitFor(
      () => realmHandle.findEvents({ type: 'IMPERSONATE', pageSize: 20 }),
      (value) => value.some((event) => event.type === 'IMPERSONATE'),
    );
    expect(Array.isArray(events)).toBe(true);
    expect(events.some((event) => event.type === 'IMPERSONATE')).toBe(true);

    const adminEvents = await waitFor(
      () => realmHandle.findAdminEvents({ resourceTypes: 'USER', operationTypes: 'CREATE', pageSize: 20 }),
      (value) => value.some((event) => event.resourceType === 'USER' && event.operationType === 'CREATE'),
    );
    expect(Array.isArray(adminEvents)).toBe(true);
    expect(adminEvents.some((event) => event.resourceType === 'USER' && event.operationType === 'CREATE')).toBe(true);

    await realmHandle.clearEvents();
    await realmHandle.clearAdminEvents();

    const eventsAfterClear = await realmHandle.findEvents({ type: 'IMPERSONATE', pageSize: 20 });
    expect(eventsAfterClear.some((event) => event.type === 'IMPERSONATE')).toBe(false);

    const adminEventsAfterClear = await realmHandle.findAdminEvents({
      resourceTypes: 'USER',
      operationTypes: 'CREATE',
      pageSize: 20,
    });
    expect(
      adminEventsAfterClear.some((event) => event.resourceType === 'USER' && event.operationType === 'CREATE'),
    ).toBe(false);
  });
});
