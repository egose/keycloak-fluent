import { describe, expect, test, vi } from 'vitest';
import RealmHandle from '../src/realm';
import { AuthenticationFlowNotFoundError } from '../src/authentication-flow';

describe('Implementation Consistency: Authentication Flows', () => {
  test('authentication flow execution addition resolves the flow lazily', async () => {
    const core = {
      authenticationManagement: {
        getFlows: vi.fn().mockResolvedValue([{ id: 'flow-1', alias: 'browser-copy' }]),
        addExecutionToFlow: vi.fn().mockResolvedValue({ id: 'exec-1', providerId: 'auth-cookie' }),
      },
    } as any;

    const realmHandle = new RealmHandle(core, 'demo');
    const flowHandle = realmHandle.authenticationFlow('browser-copy');

    await flowHandle.addExecution('auth-cookie');

    expect(core.authenticationManagement.addExecutionToFlow).toHaveBeenCalledWith({
      realm: 'demo',
      flow: 'browser-copy',
      provider: 'auth-cookie',
    });
  });

  test('authentication flow execution and provider helpers forward correctly', async () => {
    const core = {
      authenticationManagement: {
        getFlows: vi.fn().mockResolvedValue([{ id: 'flow-1', alias: 'browser-copy' }]),
        getExecutions: vi.fn().mockResolvedValue([{ id: 'exec-1', providerId: 'auth-cookie' }]),
        updateExecution: vi.fn().mockResolvedValue(undefined),
        delExecution: vi.fn().mockResolvedValue(undefined),
        raisePriorityExecution: vi.fn().mockResolvedValue(undefined),
        lowerPriorityExecution: vi.fn().mockResolvedValue(undefined),
        getClientAuthenticatorProviders: vi.fn().mockResolvedValue([{ id: 'client-jwt', displayName: 'Client JWT' }]),
        getAuthenticatorProviders: vi.fn().mockResolvedValue([{ id: 'auth-cookie', displayName: 'Cookie' }]),
        getFormActionProviders: vi
          .fn()
          .mockResolvedValue([{ id: 'registration-page-form', displayName: 'Registration Page' }]),
        getFormProviders: vi
          .fn()
          .mockResolvedValue([{ id: 'registration-page-form', displayName: 'Registration Page' }]),
        getConfigDescription: vi.fn().mockResolvedValue({ providerId: 'auth-cookie', properties: [] }),
      },
    } as any;

    const realmHandle = new RealmHandle(core, 'demo');
    const flowHandle = realmHandle.authenticationFlow('browser-copy');

    await expect(flowHandle.listExecutions()).resolves.toEqual([{ id: 'exec-1', providerId: 'auth-cookie' }]);
    await expect(
      flowHandle.updateExecution({ id: 'exec-1', requirement: 'REQUIRED' }, { flowAlias: 'browser-copy' }),
    ).resolves.toEqual([{ id: 'exec-1', providerId: 'auth-cookie' }]);
    await flowHandle.deleteExecution('exec-1');
    await flowHandle.raiseExecutionPriority('exec-1');
    await flowHandle.lowerExecutionPriority('exec-1');
    await expect(flowHandle.listClientAuthenticatorProviders()).resolves.toEqual([
      { id: 'client-jwt', displayName: 'Client JWT' },
    ]);
    await expect(flowHandle.listAuthenticatorProviders()).resolves.toEqual([
      { id: 'auth-cookie', displayName: 'Cookie' },
    ]);
    await expect(flowHandle.listFormActionProviders()).resolves.toEqual([
      { id: 'registration-page-form', displayName: 'Registration Page' },
    ]);
    await expect(flowHandle.listFormProviders()).resolves.toEqual([
      { id: 'registration-page-form', displayName: 'Registration Page' },
    ]);
    await expect(flowHandle.getConfigDescription('auth-cookie')).resolves.toEqual({
      providerId: 'auth-cookie',
      properties: [],
    });

    expect(core.authenticationManagement.updateExecution).toHaveBeenCalledWith(
      { realm: 'demo', flow: 'browser-copy' },
      { id: 'exec-1', requirement: 'REQUIRED' },
    );
    expect(core.authenticationManagement.delExecution).toHaveBeenCalledWith({ realm: 'demo', id: 'exec-1' });
    expect(core.authenticationManagement.raisePriorityExecution).toHaveBeenCalledWith({ realm: 'demo', id: 'exec-1' });
    expect(core.authenticationManagement.lowerPriorityExecution).toHaveBeenCalledWith({ realm: 'demo', id: 'exec-1' });
  });

  test('authentication config and required action helpers forward correctly', async () => {
    const core = {
      authenticationManagement: {
        createConfig: vi.fn().mockResolvedValue({ id: 'config-1', alias: 'cookie-config' }),
        getConfig: vi.fn().mockResolvedValue({ id: 'config-1', alias: 'cookie-config' }),
        updateConfig: vi.fn().mockResolvedValue(undefined),
        delConfig: vi.fn().mockResolvedValue(undefined),
        getRequiredActions: vi.fn().mockResolvedValue([{ alias: 'UPDATE_PASSWORD', enabled: true }]),
        getRequiredActionForAlias: vi.fn().mockResolvedValue({ alias: 'UPDATE_PASSWORD', enabled: true }),
        updateRequiredAction: vi.fn().mockResolvedValue(undefined),
        deleteRequiredAction: vi.fn().mockResolvedValue(undefined),
        raiseRequiredActionPriority: vi.fn().mockResolvedValue(undefined),
        lowerRequiredActionPriority: vi.fn().mockResolvedValue(undefined),
        getRequiredActionConfigDescription: vi.fn().mockResolvedValue({ properties: [] }),
        getRequiredActionConfig: vi.fn().mockResolvedValue({ config: { max_auth_age: '300' } }),
        updateRequiredActionConfig: vi.fn().mockResolvedValue(undefined),
        removeRequiredActionConfig: vi.fn().mockResolvedValue(undefined),
      },
    } as any;

    const realmHandle = new RealmHandle(core, 'demo');
    const flowHandle = realmHandle.authenticationFlow('browser');

    await expect(flowHandle.createConfig({ alias: 'cookie-config', config: { foo: 'bar' } })).resolves.toEqual({
      id: 'config-1',
      alias: 'cookie-config',
    });
    await expect(flowHandle.getConfig('config-1')).resolves.toEqual({ id: 'config-1', alias: 'cookie-config' });
    await expect(
      flowHandle.updateConfig({ id: 'config-1', alias: 'cookie-config', config: { foo: 'baz' } }),
    ).resolves.toEqual({
      id: 'config-1',
      alias: 'cookie-config',
    });
    await flowHandle.deleteConfig('config-1');
    await expect(flowHandle.listRequiredActions()).resolves.toEqual([{ alias: 'UPDATE_PASSWORD', enabled: true }]);
    await expect(flowHandle.getRequiredAction('UPDATE_PASSWORD')).resolves.toEqual({
      alias: 'UPDATE_PASSWORD',
      enabled: true,
    });
    await expect(flowHandle.updateRequiredAction('UPDATE_PASSWORD', { enabled: false })).resolves.toEqual({
      alias: 'UPDATE_PASSWORD',
      enabled: true,
    });
    await flowHandle.deleteRequiredAction('UPDATE_PASSWORD');
    await flowHandle.raiseRequiredActionPriority('UPDATE_PASSWORD');
    await flowHandle.lowerRequiredActionPriority('UPDATE_PASSWORD');
    await expect(flowHandle.getRequiredActionConfigDescription('UPDATE_PASSWORD')).resolves.toEqual({ properties: [] });
    await expect(flowHandle.getRequiredActionConfig('UPDATE_PASSWORD')).resolves.toEqual({
      config: { max_auth_age: '300' },
    });
    await expect(
      flowHandle.updateRequiredActionConfig('UPDATE_PASSWORD', { config: { max_auth_age: '600' } }),
    ).resolves.toEqual({
      config: { max_auth_age: '300' },
    });
    await flowHandle.removeRequiredActionConfig('UPDATE_PASSWORD');

    expect(core.authenticationManagement.createConfig).toHaveBeenCalledWith({
      realm: 'demo',
      alias: 'cookie-config',
      config: { foo: 'bar' },
    });
    expect(core.authenticationManagement.updateConfig).toHaveBeenCalledWith({
      realm: 'demo',
      id: 'config-1',
      alias: 'cookie-config',
      config: { foo: 'baz' },
    });
    expect(core.authenticationManagement.updateRequiredAction).toHaveBeenCalledWith(
      { realm: 'demo', alias: 'UPDATE_PASSWORD' },
      { enabled: false },
    );
    expect(core.authenticationManagement.removeRequiredActionConfig).toHaveBeenCalledWith({
      realm: 'demo',
      alias: 'UPDATE_PASSWORD',
    });
  });

  test('updateExecution with a cross-flow alias updates and reads back the target alias', async () => {
    const flowsByAlias = {
      'flow-A': { id: 'flow-A-id', alias: 'flow-A' },
      'flow-B': { id: 'flow-B-id', alias: 'flow-B' },
    };
    const executionsByFlow: Record<string, { id: string; providerId: string }[]> = {
      'flow-A': [{ id: 'exec-A1', providerId: 'auth-cookie' }],
      'flow-B': [{ id: 'exec-B1', providerId: 'identity-provider' }],
    };
    const getFlows = vi.fn(async () => Object.values(flowsByAlias));
    const getExecutions = vi.fn(async ({ flow }: { realm: string; flow: string }) => [
      ...(executionsByFlow[flow] ?? []),
    ]);
    const updateExecution = vi.fn().mockResolvedValue(undefined);
    const core = {
      authenticationManagement: { getFlows, getExecutions, updateExecution },
    } as any;

    const realmHandle = new RealmHandle(core, 'demo');
    const flowHandle = realmHandle.authenticationFlow('flow-A');

    const result = await flowHandle.updateExecution(
      { id: 'exec-B1', requirement: 'REQUIRED' },
      { flowAlias: 'flow-B' },
    );

    expect(updateExecution).toHaveBeenCalledWith(
      { realm: 'demo', flow: 'flow-B' },
      { id: 'exec-B1', requirement: 'REQUIRED' },
    );
    expect(getExecutions).toHaveBeenCalledWith({ realm: 'demo', flow: 'flow-B' });
    expect(result).toEqual([{ id: 'exec-B1', providerId: 'identity-provider' }]);
    expect(result.every((e) => e.id !== 'exec-A1')).toBe(true);
  });

  test('updateExecution with a missing cross-flow alias raises AuthenticationFlowNotFoundError and does not mutate', async () => {
    const getFlows = vi.fn().mockResolvedValue([{ id: 'flow-A-id', alias: 'flow-A' }]);
    const getExecutions = vi.fn().mockResolvedValue([{ id: 'exec-A1', providerId: 'auth-cookie' }]);
    const updateExecution = vi.fn().mockResolvedValue(undefined);
    const core = {
      authenticationManagement: { getFlows, getExecutions, updateExecution },
    } as any;

    const realmHandle = new RealmHandle(core, 'demo');
    const flowHandle = realmHandle.authenticationFlow('flow-A');

    await expect(
      flowHandle.updateExecution({ id: 'exec-X1', requirement: 'REQUIRED' }, { flowAlias: 'missing-flow' }),
    ).rejects.toBeInstanceOf(AuthenticationFlowNotFoundError);

    expect(updateExecution).not.toHaveBeenCalled();
    expect(getExecutions).not.toHaveBeenCalled();
  });

  test('updateExecution with an explicit alias equal to the handle alias resolves the handle flow without a list fetch', async () => {
    const getFlows = vi.fn().mockResolvedValue([{ id: 'flow-A-id', alias: 'flow-A' }]);
    const getExecutions = vi.fn().mockResolvedValue([{ id: 'exec-A1', providerId: 'auth-cookie' }]);
    const updateExecution = vi.fn().mockResolvedValue(undefined);
    const core = {
      authenticationManagement: { getFlows, getExecutions, updateExecution },
    } as any;

    const realmHandle = new RealmHandle(core, 'demo');
    const flowHandle = realmHandle.authenticationFlow('flow-A');

    await flowHandle.updateExecution({ id: 'exec-A1', requirement: 'REQUIRED' }, { flowAlias: 'flow-A' });

    expect(updateExecution).toHaveBeenCalledWith(
      { realm: 'demo', flow: 'flow-A' },
      { id: 'exec-A1', requirement: 'REQUIRED' },
    );
    expect(getExecutions).toHaveBeenCalledWith({ realm: 'demo', flow: 'flow-A' });
    expect(getFlows).toHaveBeenCalledTimes(1);
  });
});
