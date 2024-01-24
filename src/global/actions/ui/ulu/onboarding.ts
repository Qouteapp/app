import { type ActionReturnType, type GlobalState } from '../../../types';
import { UluOnboardingStep } from '../../../types';

import { getCurrentTabId } from '../../../../util/establishMultitabRole';
import { setOnboardingStep } from '../../../../util/sessions';
import { addActionHandler, setGlobal } from '../../..';
import { updateTabState } from '../../../reducers/tabs';
import { selectCanAnimateInterface } from '../../../selectors';
import {
  selectIsAlreadyOnboarded, selectOnboardingNextStep, selectOnboardingPreviousStep,
} from '../../../selectors/ulu/onboarding';

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
  if (selectIsAlreadyOnboarded(global)) {
    return;
  }

  const nextStep = selectOnboardingNextStep(global);
  setOnboardingStep(nextStep);
  updateOnboardingState(global, { onboardingStep: nextStep });
});

addActionHandler('goToOnboardingPreviousStep', (global): ActionReturnType => {
  if (selectIsAlreadyOnboarded(global)) {
    return;
  }

  const previousStep = selectOnboardingPreviousStep(global);
  setOnboardingStep(previousStep);
  updateOnboardingState(global, { onboardingStep: previousStep });
});

addActionHandler('requestConfetti', (global, actions, payload): ActionReturnType => {
  if (selectIsAlreadyOnboarded(global)) return;

  if (!selectCanAnimateInterface(global)) return;

  const {
    tabId = getCurrentTabId(), ...rest
  } = payload;

  updateTabState(global, {
    confetti: {
      lastConfettiTime: Date.now(),
      ...rest,
    },
  }, tabId);
});

addActionHandler('completeOnboarding', (global): ActionReturnType => {
  setOnboardingStep(UluOnboardingStep.alreadyOnboarded);
  updateOnboardingState(global, { onboardingStep: UluOnboardingStep.alreadyOnboarded });
});
