// Meine Pläne (my plans). Placeholder until the CAL and FRND areas are built.
import { useTranslation } from 'react-i18next';

import { TabPlaceholder } from '../../shell/TabPlaceholder';

export default function MyPlansScreen() {
  const { t } = useTranslation();
  return <TabPlaceholder id="my-plans" title={t('tabs.myPlans.title')} />;
}
