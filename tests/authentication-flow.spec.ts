import { expect, test } from 'vitest';
import { withEnsuredMasterRealm } from './test-utils';

test('Authentication Flows', async () => {
  await withEnsuredMasterRealm('testauthenticationflowrealm', async ({ realm, realmHandle }) => {
    const flowAlias = 'test-browser-flow';
    const flowDescription = 'A browser flow for testing purposes';

    const flowHandle = await realmHandle.authenticationFlow(flowAlias).ensure({
      description: flowDescription,
      providerId: 'basic-flow',
      topLevel: true,
      builtIn: false,
    });

    expect(flowHandle).toBeTruthy();
    expect(flowHandle.realmName).toBe(realm);
    expect(flowHandle.flow?.alias).toBe(flowAlias);
    expect(flowHandle.flow?.description).toBe(flowDescription);

    const updatedFlowHandle = await realmHandle.authenticationFlow(flowAlias).ensure({
      description: flowDescription + ' v2',
      providerId: 'basic-flow',
      topLevel: true,
      builtIn: false,
    });

    expect(updatedFlowHandle).toBeTruthy();
    expect(updatedFlowHandle.flow?.description).toBe(flowDescription + ' v2');

    const copiedFlow = await updatedFlowHandle.copy(flowAlias + '-copy');
    expect(copiedFlow?.alias).toBe(flowAlias + '-copy');

    const searchedFlows = await realmHandle.searchAuthenticationFlows(flowAlias.slice(1, -1));
    expect(Array.isArray(searchedFlows)).toBe(true);
    expect(searchedFlows.some((flow) => flow.alias === flowAlias)).toBe(true);

    const browserExecutions = await realmHandle.authenticationFlow('browser').listExecutions();
    expect(Array.isArray(browserExecutions)).toBe(true);
    expect(browserExecutions.length).toBeGreaterThan(0);

    await realmHandle.authenticationFlow(flowAlias + '-copy').addExecution('auth-cookie');
    const copiedExecutions = await realmHandle.authenticationFlow(flowAlias + '-copy').listExecutions();
    expect(copiedExecutions.some((execution) => execution.providerId === 'auth-cookie')).toBe(true);
  });
});
