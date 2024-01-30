import type { FC } from '../../../../lib/teact/teact';
import React, { useCallback, useState } from '../../../../lib/teact/teact';
import { getActions } from '../../../../global';

import { JUNE_TRACK_EVENTS } from '../../../../config';
import ContentBlock from '../util/ContentBlock';
import ContentWrapper from '../util/ContentWrapper';
import Layout from '../util/Layout';
import { COLOR_BLUR, COLOR_FOCUS } from '../constants';

import useArchiver from '../../../../hooks/useArchiver';
import useDone from '../../../../hooks/useDone';
import { useJune } from '../../../../hooks/useJune';
import useLang from '../../../../hooks/useLang';
import { useStorage } from '../../../../hooks/useStorage';

import SvgInboxTelegram from './SvgInboxTelegram';
import SvgInboxUlu from './SvgInboxUlu';

import styles from './Inbox.module.scss';

enum InboxOptions {
  Ulu,
  Everywhere,
}

const Inbox: FC = () => {
  const lang = useLang();
  const { track } = useJune();
  const { doneAllReadChats } = useDone();
  const { setIsArchiveWhenDoneEnabled } = useStorage();
  const { archiveChats } = useArchiver({ isManual: true });

  const [active, setActive] = useState<InboxOptions>(InboxOptions.Ulu);
  const selectInboxUlu = useCallback(() => setActive(InboxOptions.Ulu), []);
  const selectInboxTelegram = useCallback(() => setActive(InboxOptions.Everywhere), []);

  const description = active === InboxOptions.Ulu
    ? lang('OnboardingInboxOptionUluDescription')
    : lang('OnboardingInboxOptionEverywhereDescription');

  const { goToOnboardingNextStep } = getActions();

  const markAllReadChatsDone = useCallback(() => {
    doneAllReadChats();
    track(JUNE_TRACK_EVENTS.USE_MARK_ALL_READ_CHATS_DONE_COMMAND);
  }, [track, doneAllReadChats]);

  const next = useCallback(() => {
    markAllReadChatsDone();
    if (active === InboxOptions.Everywhere) {
      setIsArchiveWhenDoneEnabled(true);
      archiveChats();
    }
    goToOnboardingNextStep();
  }, [goToOnboardingNextStep, markAllReadChatsDone, active, setIsArchiveWhenDoneEnabled, archiveChats]);

  return (
    <Layout
      classNameSubtitle={styles.subtitle}
      title={lang('OnboardingInboxTitle')}
      subtitle={lang('OnboardingInboxSubtitle')}
      actionText={lang('OnboardingActionNext')}
      actionHandler={next}
    >
      <ContentWrapper subtitle={description}>
        <ContentBlock
          active={active === InboxOptions.Ulu}
          title={lang('OnboardingInboxOptionUluTitle')}
          subtitle={lang('OnboardingInboxOptionUluSubtitle')}
          onClick={selectInboxUlu}
        >
          <div className={styles.iconWrapper}>
            <SvgInboxUlu color={active === InboxOptions.Ulu ? COLOR_FOCUS : COLOR_BLUR} />
          </div>
        </ContentBlock>
        <ContentBlock
          active={active === InboxOptions.Everywhere}
          title={lang('OnboardingInboxOptionEverywhereTitle')}
          onClick={selectInboxTelegram}
        >
          <div className={styles.iconWrapper}>
            <SvgInboxTelegram color={active === InboxOptions.Everywhere ? COLOR_FOCUS : COLOR_BLUR} />
          </div>
        </ContentBlock>
      </ContentWrapper>
    </Layout>
  );
};

export default Inbox;
