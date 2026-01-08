interface ManagerSelectorOptions {
  currentManager: string;
  serverTime: string;
  managers: {
    new: {
      id: string;
      label: string;
    };
    legacy: {
      id: string;
      label: string;
      deprecation: string;
    };
  };
}

export interface ManagerSelector {
  options: ManagerSelectorOptions;
  status: 'idle' | 'loading' | 'success' | 'error';
  selectedManager: string;
}
