// Entdecken (discover). Placeholder until the FEED area is built.
import { useTranslation } from 'react-i18next';

import { TabPlaceholder } from '../../shell/TabPlaceholder';

export default function DiscoverScreen() {
  const { t } = useTranslation();
  return <TabPlaceholder id="discover" title={t('tabs.discover.title')} />;
}
