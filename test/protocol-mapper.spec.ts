import KeycloakAdminClientFluent from '../src/index';

test('Protocol Mappers', async () => {
  const kcMaster = new KeycloakAdminClientFluent({ baseUrl: 'http://localhost:8080', realmName: 'master' });
  await kcMaster.simpleAuth({
    username: 'admin',
    password: 'password', // pragma: allowlist secret
  });

  const realm = 'testprotocolmapperrealm';
  const clientId = 'testprotocolmapperclient';

  const therealm = await kcMaster.realm(realm).ensure({});
  const theclient = await therealm.client(clientId).ensure({});

  const userattributemapperName = 'testuserattributemapper';
  const userattributemapper = await theclient
    .userAttributeProtocolMapper(userattributemapperName)
    .ensure({ userAttribute: 'username', claimName: 'UzerName' });

  expect(userattributemapper).toBeTruthy();
  expect(userattributemapper?.realmName).toBe(realm);
  expect(userattributemapper?.client.clientId).toBe(clientId);
  expect(userattributemapper?.clientProtocolMapper?.name).toBe(userattributemapperName);
  expect(userattributemapper?.clientProtocolMapper?.config?.['user.attribute']).toBe('username');
  expect(userattributemapper?.clientProtocolMapper?.config?.['claim.name']).toBe('UzerName');

  const hardcodedclaimmappername = 'testhardcodedclaimmapper';
  const hardcodedclaimmapper = await theclient
    .hardcodedClaimProtocolMapper(hardcodedclaimmappername)
    .ensure({ claimName: 'mygroup', claimValue: 'fluent' });

  expect(hardcodedclaimmapper).toBeTruthy();
  expect(hardcodedclaimmapper?.realmName).toBe(realm);
  expect(hardcodedclaimmapper?.client.clientId).toBe(clientId);
  expect(hardcodedclaimmapper?.clientProtocolMapper?.name).toBe(hardcodedclaimmappername);
  expect(hardcodedclaimmapper?.clientProtocolMapper?.config?.['claim.name']).toBe('mygroup');
  expect(hardcodedclaimmapper?.clientProtocolMapper?.config?.['claim.value']).toBe('fluent');

  const audienceMappername = 'testaudiencemapper';
  const audienceMapper = await theclient.audienceProtocolMapper(audienceMappername).ensure({ audience: 'myaudience' });

  expect(audienceMapper).toBeTruthy();
  expect(audienceMapper?.realmName).toBe(realm);
  expect(audienceMapper?.client.clientId).toBe(clientId);
  expect(audienceMapper?.clientProtocolMapper?.name).toBe(audienceMappername);
  expect(audienceMapper?.clientProtocolMapper?.config?.['included.custom.audience']).toBe('myaudience');
});
