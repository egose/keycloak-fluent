import { expect, test } from 'vitest';
import { withEnsuredMasterRealm } from './test-utils';

test('Identity Provider Mappers', async () => {
  await withEnsuredMasterRealm('testidpmapperrealm', async ({ kcMaster, realm, realmHandle }) => {
    const identityProviderHandle = await realmHandle
      .identityProvider('testidpmapper')
      .ensure({ providerId: 'keycloak-oidc' });

    const mapperHandle = await identityProviderHandle.mapper('email-mapper').ensure({
      identityProviderMapper: 'oidc-user-attribute-idp-mapper',
      config: {
        claim: 'email',
        'user.attribute': 'email',
        syncMode: 'INHERIT',
      },
    });

    expect(mapperHandle).toBeTruthy();
    expect(mapperHandle.realmName).toBe(realm);
    expect(mapperHandle.identityProvider?.alias).toBe('testidpmapper');
    expect(mapperHandle.identityProviderMapper?.name).toBe('email-mapper');
    expect(mapperHandle.identityProviderMapper?.identityProviderMapper).toBe('oidc-user-attribute-idp-mapper');
    expect(mapperHandle.identityProviderMapper?.config?.claim).toBe('email');
    expect(mapperHandle.identityProviderMapper?.config?.['user.attribute']).toBe('email');

    const updatedMapperHandle = await kcMaster
      .realm(realm)
      .identityProvider('testidpmapper')
      .mapper('email-mapper')
      .ensure({
        identityProviderMapper: 'oidc-user-attribute-idp-mapper',
        config: {
          claim: 'preferred_username',
          'user.attribute': 'username',
          syncMode: 'FORCE',
        },
      });

    expect(updatedMapperHandle).toBeTruthy();
    expect(updatedMapperHandle.identityProviderMapper?.config?.claim).toBe('preferred_username');
    expect(updatedMapperHandle.identityProviderMapper?.config?.['user.attribute']).toBe('username');

    const mappers = await identityProviderHandle.listMappers();
    expect(Array.isArray(mappers)).toBe(true);
    expect(mappers.some((mapper) => mapper.name === 'email-mapper')).toBe(true);

    const mapperTypes = await identityProviderHandle.listMapperTypes();
    expect(typeof mapperTypes).toBe('object');
    expect(Object.keys(mapperTypes).length).toBeGreaterThan(0);
  });
});
