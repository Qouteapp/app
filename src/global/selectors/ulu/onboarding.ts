import { type GlobalState, UluOnboardingStep } from '../../types';

import { getOnboardingFirstStep, getOnboardingLastStep } from '../../ulu/onboarding';

export function selectOnboardingStep<T extends GlobalState>(global: T) {
  return global.ulu.onboardingState.onboardingStep;
}

export function selectOnboardingPreviousStep<T extends GlobalState>(global: T) {
  const currentStep = selectOnboardingStep(global);
  return currentStep === getOnboardingFirstStep()
    ? currentStep
    : currentStep - 1;
}

export function selectOnboardingNextStep<T extends GlobalState>(global: T) {
  const currentStep = selectOnboardingStep(global);
  return currentStep === getOnboardingLastStep()
    ? UluOnboardingStep.alreadyOnboarded
    : currentStep + 1;
}

export function selectIsAlreadyOnboarded<T extends GlobalState>(global: T) {
  return selectOnboardingStep(global) === UluOnboardingStep.alreadyOnboarded;
}
