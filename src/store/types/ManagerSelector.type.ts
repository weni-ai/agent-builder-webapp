interface ManagerSelectorOptions {
  currentManager: string;
  serverTime: string;
  managers: {
    new: {
      id: string;
      label: string;
      accept_components?: boolean;
    };
    legacy: {
      id: string;
      label: string;
      deprecation: string;
    } | null;
  };
}

export interface ManagerSelector {
  options: ManagerSelectorOptions;
  status: 'idle' | 'loading' | 'success' | 'error';
  saveStatus: 'idle' | 'loading' | 'success' | 'error';
  selectedManager: string;
}
