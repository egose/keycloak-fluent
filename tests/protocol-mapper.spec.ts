import { expect, test } from 'vitest';
import { withEnsuredMasterRealm } from './test-utils';

test('Protocol Mappers', async () => {
  await withEnsuredMasterRealm('testprotocolmapperrealm', async ({ realm, realmHandle }) => {
    const clientId = 'testprotocolmapperclient';

    const clientHandle = await realmHandle.client(clientId).ensure({});

    const userattributemapperName = 'testuserattributemapper';
    const userAttributeMapperHandle = await clientHandle
      .userAttributeProtocolMapper(userattributemapperName)
      .ensure({ userAttribute: 'username', claimName: 'UzerName' });

    expect(userAttributeMapperHandle).toBeTruthy();
    expect(userAttributeMapperHandle?.realmName).toBe(realm);
    expect(userAttributeMapperHandle?.client.clientId).toBe(clientId);
    expect(userAttributeMapperHandle?.clientProtocolMapper?.name).toBe(userattributemapperName);
    expect(userAttributeMapperHandle?.clientProtocolMapper?.config?.['user.attribute']).toBe('username');
    expect(userAttributeMapperHandle?.clientProtocolMapper?.config?.['claim.name']).toBe('UzerName');

    const hardcodedclaimmappername = 'testhardcodedclaimmapper';
    const hardcodedClaimMapperHandle = await clientHandle
      .hardcodedClaimProtocolMapper(hardcodedclaimmappername)
      .ensure({ claimName: 'mygroup', claimValue: 'fluent' });

    expect(hardcodedClaimMapperHandle).toBeTruthy();
    expect(hardcodedClaimMapperHandle?.realmName).toBe(realm);
    expect(hardcodedClaimMapperHandle?.client.clientId).toBe(clientId);
    expect(hardcodedClaimMapperHandle?.clientProtocolMapper?.name).toBe(hardcodedclaimmappername);
    expect(hardcodedClaimMapperHandle?.clientProtocolMapper?.config?.['claim.name']).toBe('mygroup');
    expect(hardcodedClaimMapperHandle?.clientProtocolMapper?.config?.['claim.value']).toBe('fluent');

    const audienceMappername = 'testaudiencemapper';
    const audienceMapperHandle = await clientHandle
      .audienceProtocolMapper(audienceMappername)
      .ensure({ audience: 'myaudience' });

    expect(audienceMapperHandle).toBeTruthy();
    expect(audienceMapperHandle?.realmName).toBe(realm);
    expect(audienceMapperHandle?.client.clientId).toBe(clientId);
    expect(audienceMapperHandle?.clientProtocolMapper?.name).toBe(audienceMappername);
    expect(audienceMapperHandle?.clientProtocolMapper?.config?.['included.custom.audience']).toBe('myaudience');
  });
});
