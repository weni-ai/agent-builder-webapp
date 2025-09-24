import { describe, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import BranchLines from '../BranchLines.vue';

const defaultProps = {
  positions: [],
  width: '100%',
  height: '100%',
  startY: 0,
  coloredLineIndex: -1,
};

const samplePositions = [
  { startY: 0, endY: 100, isLeft: true, radius: 8 },
  { startY: 0, endY: 100, isLeft: false, radius: 8 },
  { startY: 0, endY: 200, isLeft: true, radius: 8 },
];

const createWrapper = (props = {}) => {
  return mount(BranchLines, {
    props: {
      ...defaultProps,
      ...props,
    },
    attachTo: document.body,
  });
};

describe('BranchLines.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = createWrapper();
    vi.useFakeTimers();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  const svg = () => wrapper.find('[data-testid="branch-lines-svg"]');
  const coloredPath = () => wrapper.find('[data-testid="colored-path"]');
  const branchGradient = () => wrapper.find('[data-testid="branch-gradient"]');
  const gradientStart = () => wrapper.find('[data-testid="gradient-start"]');
  const gradientEnd = () => wrapper.find('[data-testid="gradient-end"]');

  describe('Component Rendering', () => {
    describe('when component is mounted with default props', () => {
      it('should render correctly', () => {
        expect(svg().exists()).toBe(true);
      });

      it('should have correct default width and height', () => {
        expect(svg().attributes('width')).toBe('100%');
        expect(svg().attributes('height')).toBe('100%');
      });

      it('should not render colored line by default', () => {
        expect(coloredPath().exists()).toBe(false);
      });
    });

    describe('when positions prop is provided', () => {
      beforeEach(() => {
        wrapper.setProps({ positions: samplePositions });
      });

      it('should render regular paths correctly', () => {
        const paths = wrapper.findAll('[data-testid^="regular-path-"]');
        expect(paths.length).toBe(samplePositions.length);
      });

      it('should calculate path coordinates correctly', () => {
        const firstPath = wrapper.find('[data-testid="regular-path-0"]');
        expect(firstPath.attributes('d')).toBeDefined();
        expect(firstPath.attributes('d')).toContain('M13'); // centerX value
      });
    });

    describe('when colored line is active', () => {
      it('should render gradient elements', () => {
        wrapper.setProps({
          positions: samplePositions,
          coloredLineIndex: 0,
        });

        expect(branchGradient().exists()).toBe(true);
        expect(gradientStart().exists()).toBe(true);
        expect(gradientEnd().exists()).toBe(true);
      });

      it('should render colored path', async () => {
        await wrapper.setProps({
          positions: samplePositions,
          coloredLineIndex: 0,
        });

        expect(coloredPath().exists()).toBe(true);
      });
    });
  });

  describe('Path Generation', () => {
    describe('when generating colored path', () => {
      it('should apply gradient correctly', async () => {
        await wrapper.setProps({
          positions: samplePositions,
          coloredLineIndex: 0,
        });

        expect(coloredPath().attributes('stroke')).toBe('url(#branchGradient)');
      });
    });
  });

  describe('Animation Behavior', () => {
    describe('enterColoredLineAnimation', () => {
      it('should start animation when line is colored', async () => {
        await wrapper.setProps({
          positions: samplePositions,
          coloredLineIndex: 0,
        });

        wrapper.vm.enterColoredLineAnimation();
        expect(wrapper.vm.isAnimating).toBe(true);
      });

      it('should clear interval if interval is already set', async () => {
        wrapper.vm.interval = setInterval(() => {}, 1);
        const clearIntervalSpy = vi.spyOn(window, 'clearInterval');
        await wrapper.vm.enterColoredLineAnimation();
        expect(clearIntervalSpy).toHaveBeenCalled();
      });

      it('should decrease coloredLineOffset until it reaches 0', async () => {
        wrapper.vm.coloredLineOffset = 5;
        wrapper.vm.enterColoredLineAnimation();

        expect(wrapper.vm.isAnimating).toBe(true);
        expect(wrapper.vm.coloredLineOffset).toBe(5);

        await vi.advanceTimersByTimeAsync(wrapper.vm.animationTime * 4);
        expect(wrapper.vm.coloredLineOffset).toBe(0);

        expect(wrapper.vm.isAnimating).toBe(false);
      });

      it('should clear interval and resolve when animation completes', async () => {
        wrapper.vm.coloredLineOffset = 2;
        const clearIntervalSpy = vi.spyOn(window, 'clearInterval');

        wrapper.vm.enterColoredLineAnimation();
        await vi.advanceTimersByTimeAsync(wrapper.vm.animationTime * 3);

        expect(clearIntervalSpy).toHaveBeenCalled();
        expect(wrapper.vm.isAnimating).toBe(false);
      });
    });

    describe('leaveColoredLineAnimation', () => {
      beforeEach(async () => {
        await wrapper.setProps({
          positions: samplePositions,
          coloredLineIndex: 0,
        });

        await vi.advanceTimersToNextTimerAsync();
      });

      it('should start animation and set isAnimating to true', async () => {
        wrapper.vm.leaveColoredLineAnimation(0);
        expect(wrapper.vm.isAnimating).toBe(true);
      });

      it('should clear existing interval if present', async () => {
        wrapper.vm.interval = setInterval(() => {}, 1000);
        const clearIntervalSpy = vi.spyOn(window, 'clearInterval');

        wrapper.vm.leaveColoredLineAnimation(0);
        expect(clearIntervalSpy).toHaveBeenCalled();
      });

      it('should not clear interval if it is not set', async () => {
        wrapper.vm.interval = null;
        const clearIntervalSpy = vi.spyOn(window, 'clearInterval');
        wrapper.vm.leaveColoredLineAnimation(0);
        expect(clearIntervalSpy).not.toHaveBeenCalled();
      });

      it('should resolve when leave animation is not needed', async () => {
        wrapper.vm.coloredLineOffset = 125;
        await wrapper.vm.leaveColoredLineAnimation(0);
        expect(wrapper.vm.isAnimating).toBe(false);
      });

      it('should increase coloredLineOffset until it reaches target value', async () => {
        await wrapper.setProps({
          positions: samplePositions,
          coloredLineIndex: 0,
        });
        const targetOffset = samplePositions[0].endY + 25;

        wrapper.vm.coloredLineOffset = 0;
        wrapper.vm.leaveColoredLineAnimation(0);

        expect(wrapper.vm.isAnimating).toBe(true);
        expect(wrapper.vm.coloredLineOffset).toBe(0);

        await vi.advanceTimersByTimeAsync(
          wrapper.vm.animationTime * targetOffset,
        );
        expect(wrapper.vm.coloredLineOffset).toBe(targetOffset);

        expect(wrapper.vm.isAnimating).toBe(false);
      });

      it('should clear interval and resolve when reaching target offset', async () => {
        wrapper.vm.coloredLineOffset = 0;
        const clearIntervalSpy = vi.spyOn(window, 'clearInterval');

        wrapper.vm.leaveColoredLineAnimation(0);
        await vi.advanceTimersByTimeAsync(
          wrapper.vm.animationTime * (samplePositions[0].endY + 26),
        );

        expect(clearIntervalSpy).toHaveBeenCalled();
        expect(wrapper.vm.isAnimating).toBe(false);
      });
    });

    describe('changeColoredLineAnimation', () => {
      beforeEach(async () => {
        wrapper.vm.animateColoredLine = vi.fn();
        await wrapper.setProps({
          positions: samplePositions,
          coloredLineIndex: 0,
        });

        await vi.advanceTimersToNextTimerAsync();
        vi.clearAllMocks();
      });

      it('should start animation and set isAnimating to true', async () => {
        wrapper.vm.changeColoredLineAnimation(0, 1);
        expect(wrapper.vm.isAnimating).toBe(true);
      });

      it('should clear existing interval if present', async () => {
        wrapper.vm.interval = setInterval(() => {}, 1000);
        const clearIntervalSpy = vi.spyOn(window, 'clearInterval');

        wrapper.vm.changeColoredLineAnimation(0, 1);
        expect(clearIntervalSpy).toHaveBeenCalled();
      });

      it('should not clear interval if it is not set', async () => {
        wrapper.vm.interval = null;
        const clearIntervalSpy = vi.spyOn(window, 'clearInterval');
        wrapper.vm.changeColoredLineAnimation(0, 1);
        expect(clearIntervalSpy).not.toHaveBeenCalled();
      });

      it('should perform up animation when moving to a higher index', async () => {
        wrapper.vm.changeColoredLineAnimation(1, 0);

        vi.advanceTimersToNextTimer();
        expect(wrapper.vm.coloredLineOffset).toBe(25);
        expect(wrapper.vm.treatedColoredLineIndex).toBe(1);
      });

      it('should perform up animation when endY is different', async () => {
        wrapper.vm.changeColoredLineAnimation(2, 0);

        await vi.advanceTimersByTimeAsync(wrapper.vm.animationTime * 125);
        expect(wrapper.vm.coloredLineOffset).toBe(125);

        expect(wrapper.vm.isAnimating).toBe(false);
      });

      it('should handle transition when new endY is less than old endY', async () => {
        wrapper.vm.changeColoredLineAnimation(0, 2);

        await vi.advanceTimersByTimeAsync(wrapper.vm.animationTime * 125);
        expect(wrapper.vm.coloredLineOffset).toBe(0);
        expect(wrapper.vm.isAnimating).toBe(false);
      });
    });

    describe('when component unmounts', () => {
      it('should clear animation intervals', () => {
        wrapper.setProps({
          positions: samplePositions,
          coloredLineIndex: 0,
        });

        wrapper.unmount();
        expect(wrapper.vm.interval).toBeNull();
      });
    });
  });
});
