import { expect, test } from 'vitest';
import { RequiredActionAlias } from '@keycloak/keycloak-admin-client/lib/defs/requiredActionProviderRepresentation';
import { withEnsuredMasterRealm } from './test-utils';

test('User Required Actions', async () => {
  await withEnsuredMasterRealm('testuserrequiredactionsrealm', async ({ realm, realmHandle }) => {
    const userHandle = await realmHandle.user('required-actions-user').ensure({
      firstName: 'Required',
      password: 'required-actions-user', // pragma: allowlist secret
    });

    await userHandle.addRequiredAction(RequiredActionAlias.UPDATE_PASSWORD);

    const requiredActionsAfterAdd = await userHandle.listRequiredActions();
    expect(Array.isArray(requiredActionsAfterAdd)).toBe(true);
    expect(requiredActionsAfterAdd).toContain(RequiredActionAlias.UPDATE_PASSWORD);

    await userHandle.addRequiredAction(RequiredActionAlias.UPDATE_PASSWORD);
    const requiredActionsAfterDuplicateAdd = await userHandle.listRequiredActions();
    expect(
      requiredActionsAfterDuplicateAdd.filter((action) => action === RequiredActionAlias.UPDATE_PASSWORD),
    ).toHaveLength(1);

    await userHandle.setRequiredActions([RequiredActionAlias.VERIFY_EMAIL, RequiredActionAlias.UPDATE_PROFILE]);

    const requiredActionsAfterSet = await userHandle.listRequiredActions();
    expect(requiredActionsAfterSet).toContain(RequiredActionAlias.VERIFY_EMAIL);
    expect(requiredActionsAfterSet).toContain(RequiredActionAlias.UPDATE_PROFILE);
    expect(requiredActionsAfterSet).not.toContain(RequiredActionAlias.UPDATE_PASSWORD);

    await userHandle.removeRequiredAction(RequiredActionAlias.VERIFY_EMAIL);

    const requiredActionsAfterRemove = await userHandle.listRequiredActions();
    expect(requiredActionsAfterRemove).not.toContain(RequiredActionAlias.VERIFY_EMAIL);
    expect(requiredActionsAfterRemove).toContain(RequiredActionAlias.UPDATE_PROFILE);

    expect(userHandle.realmName).toBe(realm);
  });
});
