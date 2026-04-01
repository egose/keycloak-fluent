import KeycloakAdminClientFluent from '@egose/keycloak-fluent';

const realmName = 'my-custom-realm';
const realmAdminClientId = 'my-custom-realm-admin-sa';
const realmAdminClientSecret = 'my-custom-realm-admin-sa-password'; // pragma: allowlist secret
const realmUserUsername = 'myuser';
const realmUserPassword = 'myuser-password'; // pragma: allowlist secret
const realmUserFirstName = 'Jone';
const realmUserLastName = 'Doe';
const realmRoleName = 'my-role';
const realmRoleDescription = 'My role';
const realmGroupName = 'my-group';
const realmGroupDescription = 'My group';
const realmChildGroupName = 'my-child-group';
const realmChildGroupDescription = 'My child group';

const kc = new KeycloakAdminClientFluent({ baseUrl: 'http://localhost:8080', realmName });
await kc.simpleAuth({
  clientId: realmAdminClientId,
  clientSecret: realmAdminClientSecret,
});

const realm = kc.realm(realmName);

const user = await realm
  .user(realmUserUsername)
  .ensure({ firstName: realmUserFirstName, lastName: realmUserLastName, password: realmUserPassword });

const role = await realm.role(realmRoleName).ensure({ description: realmRoleDescription });
const group = await realm.group(realmGroupName).ensure({ description: realmGroupDescription });
const childGroup = await group.childGroup(realmChildGroupName).ensure({ description: realmChildGroupDescription });

await user.assignRole(role);
await user.assignGroup(group);
await user.assignGroup(childGroup);
