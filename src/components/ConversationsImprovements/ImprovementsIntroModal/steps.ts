import step1Illustration from '@/assets/images/improvements-intro/step-1.png';
import step2Illustration from '@/assets/images/improvements-intro/step-2.png';
import step3Illustration from '@/assets/images/improvements-intro/step-3.png';
import step4Illustration from '@/assets/images/improvements-intro/step-4.png';

export const TOTAL_STEPS = 4;

export type IntroStep = {
  id: number;
  illustration: string;
  titleKey: string;
  descriptionKey: string;
};

export const INTRO_STEPS: IntroStep[] = [
  {
    id: 1,
    illustration: step1Illustration,
    titleKey: 'audit.improvements.intro_modal.steps.1.title',
    descriptionKey: 'audit.improvements.intro_modal.steps.1.description',
  },
  {
    id: 2,
    illustration: step2Illustration,
    titleKey: 'audit.improvements.intro_modal.steps.2.title',
    descriptionKey: 'audit.improvements.intro_modal.steps.2.description',
  },
  {
    id: 3,
    illustration: step3Illustration,
    titleKey: 'audit.improvements.intro_modal.steps.3.title',
    descriptionKey: 'audit.improvements.intro_modal.steps.3.description',
  },
  {
    id: 4,
    illustration: step4Illustration,
    titleKey: 'audit.improvements.intro_modal.steps.4.title',
    descriptionKey: 'audit.improvements.intro_modal.steps.4.description',
  },
];

// TODO: replace with the final help guide URL when available
export const HELP_GUIDE_URL = '';
