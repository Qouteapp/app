import type { FC } from '../../../../lib/teact/teact';
import React, { useCallback, useState } from '../../../../lib/teact/teact';
import { getActions } from '../../../../global';

import ContentBlock from '../util/ContentBlock';
import ContentWrapper from '../util/ContentWrapper';
import Layout from '../util/Layout';
import { COLOR_BLUR, COLOR_FOCUS } from '../constants';

import useLang from '../../../../hooks/useLang';

import SvgInboxTelegram from './SvgInboxTelegram';
import SvgInboxUlu from './SvgInboxUlu';

import styles from './Inbox.module.scss';

enum InboxOptions {
  Ulu,
  Telegram,
}

const Inbox: FC = () => {
  const lang = useLang();

  const [active, setActive] = useState<InboxOptions>(InboxOptions.Ulu);
  const selectInboxUlu = useCallback(() => setActive(InboxOptions.Ulu), []);
  const selectInboxTelegram = useCallback(() => setActive(InboxOptions.Telegram), []);

  const description = active === InboxOptions.Ulu
    ? lang('OnboardingInboxOptionUluDescription')
    : lang('OnboardingInboxOptionTelegramDescription');

  const { goToOnboardingNextStep } = getActions();

  const next = useCallback(() => {
    goToOnboardingNextStep();
  }, [goToOnboardingNextStep]);

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
          active={active === InboxOptions.Telegram}
          title={lang('OnboardingInboxOptionTelegramTitle')}
          onClick={selectInboxTelegram}
        >
          <div className={styles.iconWrapper}>
            <SvgInboxTelegram color={active === InboxOptions.Telegram ? COLOR_FOCUS : COLOR_BLUR} />
          </div>
        </ContentBlock>
      </ContentWrapper>
    </Layout>
  );
};

export default Inbox;
