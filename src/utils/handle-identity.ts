export interface HandleIdentitySource {
  readonly identityVersion: string;
}

export function makeHandleIdentityVersion(localGeneration: number, parent?: HandleIdentitySource) {
  return parent ? `${parent.identityVersion}:${localGeneration}` : `${localGeneration}`;
}

export class ParentIdentityTracker {
  private seenVersion: string;

  public constructor(private readonly parent: HandleIdentitySource) {
    this.seenVersion = parent.identityVersion;
  }

  public invalidateIfChanged(clearCache: () => void) {
    const currentVersion = this.parent.identityVersion;
    if (currentVersion === this.seenVersion) return false;

    this.seenVersion = currentVersion;
    clearCache();
    return true;
  }
}
