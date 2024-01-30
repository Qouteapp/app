import type { FC } from '../../../../lib/teact/teact';
import React, { useCallback } from '../../../../lib/teact/teact';
import { getActions } from '../../../../global';

import { cmdKey } from '../../../../config';
import ContentWrapper from '../util/ContentWrapper';
import Layout from '../util/Layout';

import useLang from '../../../../hooks/useLang';

import SuperSearchButton from './SuperSearchButton';

import styles from './SuperSearch.module.scss';

const SuperSearch: FC = () => {
  const lang = useLang();

  const { goToOnboardingNextStep } = getActions();

  const next = useCallback(() => {
    goToOnboardingNextStep();
  }, [goToOnboardingNextStep]);

  return (
    <Layout
      title={lang('OnboardingSupersearchTitle')}
      subtitle={lang('OnboardingSupersearchSubtitle')}
      actionText={lang('OnboardingActionFinish')}
      actionHandler={next}
    >
      <ContentWrapper>
        <div className={styles.wrapper}>
          <div className={styles.push}>{lang('OnboardingSupersearchPush')}</div>
          <div className={styles.btns}>
            <SuperSearchButton text={cmdKey} />
            <div className={styles.dot} />
            <SuperSearchButton text="K" />
          </div>
        </div>
      </ContentWrapper>
    </Layout>
  );
};

export default SuperSearch;
