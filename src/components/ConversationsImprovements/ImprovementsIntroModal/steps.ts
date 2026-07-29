import step1Illustration from '@/assets/images/improvements-intro/step-1.png';
import step2Illustration from '@/assets/images/improvements-intro/step-2.png';
import step3Illustration from '@/assets/images/improvements-intro/step-3.png';
import step4Illustration from '@/assets/images/improvements-intro/step-4.png';
import step5Illustration from '@/assets/images/improvements-intro/step-5.png';

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
  {
    id: 5,
    illustration: step5Illustration,
    titleKey: 'audit.improvements.intro_modal.steps.5.title',
    descriptionKey: 'audit.improvements.intro_modal.steps.5.description',
  },
];

export const TOTAL_STEPS = INTRO_STEPS.length;

export const HELP_GUIDE_URL =
  'https://docs.google.com/document/d/1ZvJZ7UqwFE_oyXhRcf0E9p0sw8W74B3HnW3RWDWqDq8/';
