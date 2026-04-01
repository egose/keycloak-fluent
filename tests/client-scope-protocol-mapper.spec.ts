import { expect, test } from 'vitest';
import { withEnsuredMasterRealm } from './test-utils';

test('Client Scope Protocol Mappers', async () => {
  await withEnsuredMasterRealm('testclientscopeprotocolmapperrealm', async ({ realm, realmHandle }) => {
    const clientScopeHandle = await realmHandle.clientScope('shared-profile').ensure({});

    const userAttributeMapperHandle = await clientScopeHandle
      .userAttributeProtocolMapper('scope-user-attribute-mapper')
      .ensure({ userAttribute: 'username', claimName: 'username' });

    expect(userAttributeMapperHandle).toBeTruthy();
    expect(userAttributeMapperHandle.realmName).toBe(realm);
    expect(userAttributeMapperHandle.clientScope?.name).toBe('shared-profile');
    expect(userAttributeMapperHandle.clientScopeProtocolMapper?.name).toBe('scope-user-attribute-mapper');
    expect(userAttributeMapperHandle.clientScopeProtocolMapper?.config?.['user.attribute']).toBe('username');
    expect(userAttributeMapperHandle.clientScopeProtocolMapper?.config?.['claim.name']).toBe('username');

    const hardcodedClaimMapperHandle = await clientScopeHandle
      .hardcodedClaimProtocolMapper('scope-hardcoded-claim-mapper')
      .ensure({ claimName: 'team', claimValue: 'platform' });

    expect(hardcodedClaimMapperHandle).toBeTruthy();
    expect(hardcodedClaimMapperHandle.realmName).toBe(realm);
    expect(hardcodedClaimMapperHandle.clientScope?.name).toBe('shared-profile');
    expect(hardcodedClaimMapperHandle.clientScopeProtocolMapper?.name).toBe('scope-hardcoded-claim-mapper');
    expect(hardcodedClaimMapperHandle.clientScopeProtocolMapper?.config?.['claim.name']).toBe('team');
    expect(hardcodedClaimMapperHandle.clientScopeProtocolMapper?.config?.['claim.value']).toBe('platform');

    const audienceMapperHandle = await clientScopeHandle
      .audienceProtocolMapper('scope-audience-mapper')
      .ensure({ audience: 'analytics-api' });

    expect(audienceMapperHandle).toBeTruthy();
    expect(audienceMapperHandle.realmName).toBe(realm);
    expect(audienceMapperHandle.clientScope?.name).toBe('shared-profile');
    expect(audienceMapperHandle.clientScopeProtocolMapper?.name).toBe('scope-audience-mapper');
    expect(audienceMapperHandle.clientScopeProtocolMapper?.config?.['included.custom.audience']).toBe('analytics-api');
  });
});
