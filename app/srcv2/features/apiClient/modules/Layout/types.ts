interface ApiClientRouteHook {
  isApiClientCompatible: boolean;
}

interface UserAuthDetails {
  details?: {
    profile?: {
      uid: string;
    };
  };
}

interface ApiClientLayout {
  getSecondPaneMinSize: () => number;
  isSetupDone: boolean;
}

export type { ApiClientLayout, ApiClientRouteHook, UserAuthDetails };
