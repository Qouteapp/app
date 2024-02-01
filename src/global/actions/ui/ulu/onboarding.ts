import { type ActionReturnType, type GlobalState } from '../../../types';
import { UluOnboardingStep } from '../../../types';

import { ARCHIVED_FOLDER_ID } from '../../../../config';
import { getCurrentTabId } from '../../../../util/establishMultitabRole';
import { setOnboardingStep } from '../../../../util/sessions';
import { callApi } from '../../../../api/gramjs';
import { addActionHandler, setGlobal } from '../../..';
import { isChatArchived } from '../../../helpers';
import { updateTabState } from '../../../reducers/tabs';
import { selectCanAnimateInterface, selectChat } from '../../../selectors';
import {
  selectIsAlreadyOnboarded, selectOnboardingNextStep, selectOnboardingPreviousStep,
} from '../../../selectors/ulu/onboarding';
import { loadChatFoldersHandler } from '../../api/chats';

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
    return undefined;
  }

  const nextStep = selectOnboardingNextStep(global);
  setOnboardingStep(nextStep);
  return updateOnboardingState(global, { onboardingStep: nextStep });
});

addActionHandler('goToOnboardingPreviousStep', (global): ActionReturnType => {
  if (selectIsAlreadyOnboarded(global)) {
    return undefined;
  }

  const previousStep = selectOnboardingPreviousStep(global);
  setOnboardingStep(previousStep);
  return updateOnboardingState(global, { onboardingStep: previousStep });
});

addActionHandler('requestConfetti', (global, actions, payload): ActionReturnType => {
  if (selectIsAlreadyOnboarded(global)) return undefined;

  if (!selectCanAnimateInterface(global)) return undefined;

  const {
    tabId = getCurrentTabId(), ...rest
  } = payload;

  const now = Date.now();
  return updateTabState(global, {
    confetti: {
      lastConfettiTime: now,
      ...rest,
    },
  }, tabId);
});

addActionHandler('toggleChatArchived', (global, actions, payload): ActionReturnType => {
  if (selectIsAlreadyOnboarded(global)) return;

  const { id } = payload!;
  const chat = selectChat(global, id);
  if (chat) {
    void callApi('toggleChatArchived', {
      chat,
      folderId: isChatArchived(chat) ? 0 : ARCHIVED_FOLDER_ID,
    });
  }
});

addActionHandler('completeOnboarding', (global): ActionReturnType => {
  setOnboardingStep(UluOnboardingStep.alreadyOnboarded);
  return updateOnboardingState(global, { onboardingStep: UluOnboardingStep.alreadyOnboarded });
});

addActionHandler('loadChatFolders', async (global): Promise<void> => {
  if (selectIsAlreadyOnboarded(global)) return;

  await loadChatFoldersHandler(global);
});
