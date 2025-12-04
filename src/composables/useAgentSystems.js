import VTEXIcon from '@/assets/images/systems/vtex.svg';
import SYNERISEIcon from '@/assets/images/systems/synerise.svg';

export default function useAgentSystems() {
  const acceptedSystems = ['VTEX', 'SYNERISE'];
  const systems = {
    VTEX: {
      name: 'VTEX',
      icon: VTEXIcon,
    },
    SYNERISE: {
      name: 'Synerise',
      icon: SYNERISEIcon,
    },
  };

  const getSystemsObjects = (systemsNames) => {
    return systemsNames
      .map((systemName) => systems[systemName.toUpperCase()])
      .filter(Boolean);
  };

  return {
    acceptedSystems,
    systems,
    getSystemsObjects,
  };
}
