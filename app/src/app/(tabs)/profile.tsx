// Profil (profile). Placeholder until the PROF and SET areas are built.
import { useTranslation } from 'react-i18next';

import { TabPlaceholder } from '../../shell/TabPlaceholder';

export default function ProfileScreen() {
  const { t } = useTranslation();
  return <TabPlaceholder id="profile" title={t('tabs.profile.title')} />;
}
