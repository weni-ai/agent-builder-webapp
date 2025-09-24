import { shallowMount } from '@vue/test-utils';
import CredentialsSkeleton from '../Credentials/CredentialsSkeleton.vue';

describe('CredentialsSkeleton.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(CredentialsSkeleton);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should render 2 skeleton items with label and input skeletons', () => {
    const skeletonItems = wrapper.findAll(
      '[data-testid="credentials-skeleton"]',
    );
    expect(skeletonItems).toHaveLength(2);

    skeletonItems.forEach((item) => {
      const skeletonLoadings = item.findAllComponents(
        '[data-testid="skeleton-loading"]',
      );
      expect(skeletonLoadings).toHaveLength(2);

      // Label skeleton
      expect(skeletonLoadings[0].props('height')).toBe('21px');
      expect(skeletonLoadings[0].props('tag')).toBe('div');

      // Input skeleton
      expect(skeletonLoadings[1].props('height')).toBe('45px');
      expect(skeletonLoadings[1].props('width')).toBe('100%');
      expect(skeletonLoadings[1].props('tag')).toBe('div');
    });
  });
});
