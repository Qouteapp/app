/* eslint-disable no-underscore-dangle */
import { UluOnboardingStep } from '../types';

export function getOnboardingFirstStep() {
  const asKeyOf = UluOnboardingStep[UluOnboardingStep.__start + 1] as keyof typeof UluOnboardingStep;
  return UluOnboardingStep[asKeyOf];
}

export function getOnboardingLastStep() {
  const asKeyOf = UluOnboardingStep[UluOnboardingStep.__end - 1] as keyof typeof UluOnboardingStep;
  return UluOnboardingStep[asKeyOf];
}
