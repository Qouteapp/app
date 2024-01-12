import type { GlobalState } from '../../types';

export function selectOnboardingStep<T extends GlobalState>(global: T) {
  return global.ulu.onboardingState.onboardingStep;
}
