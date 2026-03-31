import { expect, test } from 'vitest';
import { withEnsuredMasterRealm } from './test-utils';

test('Role Composites', async () => {
  await withEnsuredMasterRealm('testrolecompositerealm', async ({ realm, realmHandle }) => {
    const parentRealmRoleHandle = await realmHandle.role('parent-realm-role').ensure({});
    const childRealmRoleHandle = await realmHandle.role('child-realm-role').ensure({});
    const clientHandle = await realmHandle.client('composite-client').ensure({});
    const parentClientRoleHandle = await clientHandle.role('parent-client-role').ensure({});
    const childClientRoleHandle = await clientHandle.role('child-client-role').ensure({});

    await parentRealmRoleHandle.addComposite(childRealmRoleHandle);
    await parentRealmRoleHandle.addComposite(childClientRoleHandle);

    const parentRealmRoleComposites = await parentRealmRoleHandle.listComposites();
    expect(parentRealmRoleComposites.some((role) => role.name === 'child-realm-role')).toBe(true);
    expect(parentRealmRoleComposites.some((role) => role.name === 'child-client-role')).toBe(true);

    const parentRealmRoleRealmComposites = await parentRealmRoleHandle.listRealmComposites();
    expect(parentRealmRoleRealmComposites.some((role) => role.name === 'child-realm-role')).toBe(true);

    const parentRealmRoleClientComposites = await parentRealmRoleHandle.listClientComposites(clientHandle);
    expect(parentRealmRoleClientComposites.some((role) => role.name === 'child-client-role')).toBe(true);

    await parentClientRoleHandle.addComposite(childRealmRoleHandle);
    await parentClientRoleHandle.addComposite(childClientRoleHandle);

    const parentClientRoleComposites = await parentClientRoleHandle.listComposites();
    expect(parentClientRoleComposites.some((role) => role.name === 'child-realm-role')).toBe(true);
    expect(parentClientRoleComposites.some((role) => role.name === 'child-client-role')).toBe(true);

    const parentClientRoleRealmComposites = await parentClientRoleHandle.listRealmComposites();
    expect(parentClientRoleRealmComposites.some((role) => role.name === 'child-realm-role')).toBe(true);

    const parentClientRoleClientComposites = await parentClientRoleHandle.listClientComposites(clientHandle);
    expect(parentClientRoleClientComposites.some((role) => role.name === 'child-client-role')).toBe(true);

    await parentRealmRoleHandle.removeComposite(childClientRoleHandle);
    await parentClientRoleHandle.removeComposite(childRealmRoleHandle);

    const parentRealmRoleCompositesAfterRemove = await parentRealmRoleHandle.listComposites();
    expect(parentRealmRoleCompositesAfterRemove.some((role) => role.name === 'child-client-role')).toBe(false);

    const parentClientRoleCompositesAfterRemove = await parentClientRoleHandle.listComposites();
    expect(parentClientRoleCompositesAfterRemove.some((role) => role.name === 'child-realm-role')).toBe(false);

    expect(parentRealmRoleHandle.realmName).toBe(realm);
    expect(parentClientRoleHandle.realmName).toBe(realm);
  });
});
