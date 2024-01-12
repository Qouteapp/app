import { type ActionReturnType, type GlobalState, UluOnboardingStep } from '../../../types';

import { addActionHandler, setGlobal } from '../../..';
import { selectOnboardingStep } from '../../../selectors/ulu/onboarding';
import { getOnboardingFirstStep, getOnboardingLastStep } from '../../../ulu/onboarding';

type UpdateOnboardingStatePayload = Partial<GlobalState['ulu']['onboardingState']>;

function updateOnboardingState<T extends GlobalState>(
  global: T, { onboardingStep }: UpdateOnboardingStatePayload,
) {
  global = {
    ...global,
    ulu: {
      ...global.ulu,
      onboardingState: {
        ...global.ulu.onboardingState,
        onboardingStep,
      },
    },
  };
  setGlobal(global);
  return global;
}

addActionHandler('goToOnboardingNextStep', (global): ActionReturnType => {
  const currentStep = selectOnboardingStep(global);

  if (currentStep === UluOnboardingStep.alreadyOnboarded) {
    return;
  }

  const nextStep = currentStep === getOnboardingLastStep()
    ? UluOnboardingStep.alreadyOnboarded
    : currentStep + 1;

  updateOnboardingState(global, { onboardingStep: nextStep });
});

addActionHandler('goToOnboardingPreviousStep', (global): ActionReturnType => {
  const currentStep = selectOnboardingStep(global);
  if (currentStep === UluOnboardingStep.alreadyOnboarded) {
    return;
  }

  const previousStep = currentStep === getOnboardingFirstStep()
    ? currentStep
    : currentStep - 1;

  updateOnboardingState(global, { onboardingStep: previousStep });
});
