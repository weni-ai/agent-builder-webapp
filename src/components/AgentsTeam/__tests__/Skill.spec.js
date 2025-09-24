import { mount } from '@vue/test-utils';
import Skill from '../Skill.vue';

describe('Skill.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(Skill, {
      props: {
        title: 'Test Title',
        icon: 'icon-1',
      },
    });
  });
  it('renders correctly', () => {
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders icon correctly', () => {
    const icon = wrapper.find('[data-testid="skill-icon"]');
    expect(icon.exists()).toBe(true);
    expect(icon.text()).toBe('icon-1');
  });

  it('renders title correctly', () => {
    const title = wrapper.find('[data-testid="skill-name"]');
    expect(title.exists()).toBe(true);
    expect(title.text()).toBe('Test Title');
  });
});
