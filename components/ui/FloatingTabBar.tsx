import { Tabs } from 'expo-router';
import { CalendarDays, Layers, Settings, Sun } from 'lucide-react-native';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';

export type FloatingTabBarProps = Parameters<
  NonNullable<React.ComponentProps<typeof Tabs>['tabBar']>
>[0];

const TAB_CONFIG = [
  { name: 'today',    label: 'Today',    Icon: Sun },
  { name: 'journeys', label: 'Journeys', Icon: Layers },
  { name: 'calendar', label: 'Calendar', Icon: CalendarDays },
  { name: 'settings', label: 'Settings', Icon: Settings },
] as const;

export function FloatingTabBar({ state, navigation }: FloatingTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.outerWrapper, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      {/* Glass pill */}
      <View style={styles.pill}>
        {/* Top-edge sheen */}
        <View style={[StyleSheet.absoluteFill, styles.pillSheen]} pointerEvents="none">
          <Svg width="100%" height={20} style={styles.sheenSvg}>
            <Defs>
              <LinearGradient id="tabSheen" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.10" />
                <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="20" fill="url(#tabSheen)" />
          </Svg>
        </View>

        {/* Tab items */}
        {TAB_CONFIG.map(({ name, label, Icon }, index) => {
          const route = state.routes[index];
          if (!route) return null;
          const focused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={name}
              onPress={onPress}
              style={({ pressed }) => [
                styles.tab,
                pressed && styles.tabPressed,
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={label}
            >
              <View style={styles.tabInner}>
                {/* Active background pill */}
                {focused ? <View style={styles.activeBackground} /> : null}

                <Icon
                  size={20}
                  color={focused ? colors.gold : 'rgba(255,255,255,0.35)'}
                  strokeWidth={focused ? 2.2 : 1.6}
                />
                <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
                  {label}
                </Text>

                {/* Gold dot indicator */}
                {focused ? <View style={styles.goldDot} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    backgroundColor: 'transparent',
    // Prevents tab bar from blocking content scroll
    pointerEvents: 'box-none',
  },
  pill: {
    flexDirection: 'row',
    backgroundColor: 'rgba(8, 8, 8, 0.92)',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    width: '100%',
    maxWidth: 380,
    overflow: 'hidden',
    // Subtle bottom ambient shadow on glass
    ...Platform.select({
      android: { elevation: 24 },
    }),
  },
  pillSheen: {
    borderRadius: radius.pill,
    overflow: 'hidden',
    justifyContent: 'flex-start',
  },
  sheenSvg: {
    borderRadius: radius.pill,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  tabPressed: {
    opacity: 0.7,
  },
  tabInner: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    position: 'relative',
  },
  activeBackground: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(245, 158, 11, 0.10)',
    borderRadius: radius.full,
    marginHorizontal: -12,
    marginVertical: -6,
  },
  tabLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.35)',
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    color: colors.gold,
    fontFamily: 'Inter_600SemiBold',
  },
  goldDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gold,
    marginTop: 1,
  },
});
