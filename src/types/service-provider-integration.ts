import { K8sResourceCommon } from './k8s';

export type SPIAccessTokenBindingKind = K8sResourceCommon & {
  spec: {
    repoUrl: string;
    permissions: {
      required: {
        area: string;
        type: string;
      }[];
    };
    secret: {
      name: string;
      type: string;
    };
  };
  status?: {
    phase: SPIAccessTokenBindingPhase;
    oAuthUrl?: string;
    linkedAccessTokenName?: string;
    uploadUrl?: string;
    syncedObjectRef?: {
      name: string;
    };
    errorMessage?: string;
  };
};

export enum SPIAccessTokenBindingPhase {
  AwaitingTokenData = 'AwaitingTokenData',
  Injected = 'Injected',
  Error = 'Error',
}

export enum SPIAccessCheckAccessibilityStatus {
  public = 'public',
  private = 'private',
  unknown = 'unknown',
}

export enum ServiceProviderType {
  GitHub = 'GitHub',
  GitLab = 'GitLab',
  Quay = 'Quay',
}

enum RepoType {
  git = 'git',
}

export type SPIAccessCheckKind = K8sResourceCommon & {
  spec: {
    repoUrl: string;
  };
  status?: {
    accessible: boolean;
    accessibility: SPIAccessCheckAccessibilityStatus;
    serviceProvider: ServiceProviderType;
    repoType: RepoType;
    errorReason?: string;
    errorMessage?: string;
  };
};
