// The three tabs: Entdecken · Meine Pläne · Profil (design/screens.md → Navigation map).
import { Tabs } from 'expo-router/js-tabs';
import { useTranslation } from 'react-i18next';

import { useTheme } from '../../theme';

export default function TabLayout() {
  const { t } = useTranslation();
  const theme = useTheme();

  const tab = (title: string) => ({ title, tabBarAccessibilityLabel: title });

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: theme.colors.background },
        // PLACEHOLDER(design): the tab bar look (icons, colours, label style) is not specified by the
        // designer yet. No icon set is approved, so the tabs show labels only; Mint is not used for
        // small text (direction.md → Colour), so the active tab uses the text colour.
        tabBarIconStyle: { display: 'none' },
        tabBarActiveTintColor: theme.colors.text,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarLabelStyle: theme.text.small,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.divider,
          minHeight: theme.size.touchMin,
        },
      }}>
      <Tabs.Screen name="index" options={tab(t('tabs.discover.title'))} />
      <Tabs.Screen name="my-plans" options={tab(t('tabs.myPlans.title'))} />
      <Tabs.Screen name="profile" options={tab(t('tabs.profile.title'))} />
    </Tabs>
  );
}
