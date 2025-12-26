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

  function getSystemObject(systemName) {
    return systems[systemName?.toUpperCase() || ''];
  }

  function getSystemsObjects(systemsNames) {
    return systemsNames
      .map((systemName) => getSystemObject(systemName))
      .filter(Boolean);
  }

  return {
    acceptedSystems,
    systems,
    getSystemObject,
    getSystemsObjects,
  };
}
