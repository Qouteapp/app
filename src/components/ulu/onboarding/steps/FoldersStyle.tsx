import type { FC } from '../../../../lib/teact/teact';
import React, { useCallback, useState } from '../../../../lib/teact/teact';
import { getActions } from '../../../../global';

import ContentBlock from '../util/ContentBlock';
import ContentWrapper from '../util/ContentWrapper';
import Layout from '../util/Layout';
import { COLOR_BLUR, COLOR_FOCUS } from '../constants';

import useLang from '../../../../hooks/useLang';

import SvgFoldersStyleSlack from './SvgFoldersStyleSlack';
import SvgFoldersStyleTelegram from './SvgFoldersStyleTelegram';

enum FoldersStyleOptions {
  Slack,
  Telegram,
}

const FoldersStyle: FC = () => {
  const lang = useLang();

  const { goToOnboardingNextStep } = getActions();

  const [active, setActive] = useState<FoldersStyleOptions>(FoldersStyleOptions.Slack);
  const selectSlackFoldersStyle = useCallback(() => setActive(FoldersStyleOptions.Slack), []);
  const selectTelegramFoldersStyle = useCallback(() => setActive(FoldersStyleOptions.Telegram), []);

  const next = useCallback(() => {
    goToOnboardingNextStep();
  }, [goToOnboardingNextStep]);

  const description = active === FoldersStyleOptions.Slack
    ? lang('OnboardingFoldersStyleOptionSlackDescription')
    : lang('OnboardingFoldersStyleOptionTelegramDescription');

  return (
    <Layout
      title={lang('OnboardingFoldersStyleTitle')}
      subtitle={lang('OnboardingFoldersStyleSubtitle')}
      actionText={lang('OnboardingActionNext')}
      actionHandler={next}
    >
      <ContentWrapper subtitle={description}>
        <ContentBlock
          active={active === 0}
          title={lang('OnboardingInboxOptionUluTitle')}
          subtitle={lang('OnboardingInboxOptionUluSubtitle')}
          onClick={selectSlackFoldersStyle}
        >
          <div>
            <SvgFoldersStyleSlack color={active === 0 ? COLOR_FOCUS : COLOR_BLUR} />
          </div>
        </ContentBlock>
        <ContentBlock
          active={active === 1}
          title={lang('OnboardingInboxOptionTelegramTitle')}
          onClick={selectTelegramFoldersStyle}
        >
          <div>
            <SvgFoldersStyleTelegram color={active === 1 ? COLOR_FOCUS : COLOR_BLUR} />
          </div>
        </ContentBlock>
      </ContentWrapper>
    </Layout>
  );
};

export default FoldersStyle;
