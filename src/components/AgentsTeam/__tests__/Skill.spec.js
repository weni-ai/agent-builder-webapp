import { mount } from '@vue/test-utils';
import Skill from '../Skill.vue';
import mockIcon from '@/assets/images/systems/vtex.svg';

describe('Skill.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(Skill, {
      props: {
        title: 'Test Title',
        icon: mockIcon,
      },
    });
  });
  it('renders correctly', () => {
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders icon correctly', () => {
    const iconElement = wrapper.find('[data-testid="skill-icon"]');
    expect(iconElement.exists()).toBe(true);
    expect(iconElement.attributes('src')).toBe(mockIcon);
  });

  it('renders title correctly', () => {
    const title = wrapper.find('[data-testid="skill-name"]');
    expect(title.exists()).toBe(true);
    expect(title.text()).toBe('Test Title');
  });
});
