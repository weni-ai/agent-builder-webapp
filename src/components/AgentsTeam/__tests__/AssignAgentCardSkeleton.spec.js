import { mount } from '@vue/test-utils';

import AssignAgentSkeleton from '../AssignAgentCardSkeleton.vue';

describe('AgentCardSkeleton.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(AssignAgentSkeleton);
  });

  it('renders correctly', () => {
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders skeleton loading components', () => {
    const skeletonLoadings = wrapper.findAll(
      '[data-testid="skeleton-loading"]',
    );
    expect(skeletonLoadings.length).toBe(4);
  });

  it('renders skills section', () => {
    const skillsSection = wrapper.find('[data-testid="skills-section"]');
    expect(skillsSection.exists()).toBe(true);
  });

  it('renders skills skeleton loadings', () => {
    const skillsSkeletonLoadings = wrapper.findAll(
      '[data-testid="skills-skeleton-loading"]',
    );
    expect(skillsSkeletonLoadings.length).toBe(2);
  });
});
