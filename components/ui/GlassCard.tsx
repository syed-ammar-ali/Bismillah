import React from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import Svg, { Defs, Rect, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { radius } from '../../theme/spacing';

export interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  variant?: 'base' | 'strong' | 'gold';
  borderRadius?: number;
  showTopSheen?: boolean;
  disabled?: boolean;
}

/**
 * Glass-simulated card — the signature surface of the Obsidian design system.
 *
 * On OLED black, the near-transparent fill + hairline border + subtle top-edge
 * sheen creates a convincing frosted-glass look without any blur API.
 *
 * Stacking order (back to front):
 *   1. Dark translucent fill (the "glass" base)
 *   2. Top-edge SVG sheen (white→transparent gradient, ~24px tall)
 *   3. Content
 */
export function GlassCard({
  children,
  style,
  onPress,
  variant = 'base',
  borderRadius = radius.card,
  showTopSheen = true,
  disabled = false,
}: GlassCardProps) {
  const bgColor =
    variant === 'gold'
      ? 'rgba(245, 158, 11, 0.08)'
      : variant === 'strong'
        ? 'rgba(255, 255, 255, 0.07)'
        : 'rgba(255, 255, 255, 0.04)';

  const borderColor =
    variant === 'gold'
      ? 'rgba(245, 158, 11, 0.22)'
      : 'rgba(255, 255, 255, 0.09)';

  const inner = (pressed: boolean) => (
    <View
      style={[
        styles.card,
        {
          backgroundColor: pressed ? 'rgba(255, 255, 255, 0.09)' : bgColor,
          borderColor,
          borderRadius,
        },
        style,
      ]}
    >
      {/* Top-edge sheen: gives the "glass highlight" look */}
      {showTopSheen ? (
        <View
          style={[
            StyleSheet.absoluteFill,
            styles.sheenWrapper,
            { borderRadius },
          ]}
          pointerEvents="none"
        >
          <Svg
            width="100%"
            height={28}
            style={{ borderTopLeftRadius: borderRadius, borderTopRightRadius: borderRadius, overflow: 'hidden' }}
          >
            <Defs>
              <SvgGradient id="sheen" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.07" />
                <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </SvgGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="28" fill="url(#sheen)" />
          </Svg>
        </View>
      ) : null}

      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        style={({ pressed }) => [styles.pressable, pressed && styles.pressablePressed]}
      >
        {({ pressed }) => inner(pressed)}
      </Pressable>
    );
  }

  return inner(false);
}

const styles = StyleSheet.create({
  pressable: {
    borderRadius: radius.card,
  },
  pressablePressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },
  card: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  sheenWrapper: {
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },
});
