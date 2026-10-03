import React from 'react';
import { StyleSheet, Text as RNText, TextProps as RNTextProps } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

export type TextVariant = 'display' | 'title' | 'heading' | 'body' | 'caption';
export type TextColor = 'default' | 'muted' | 'gold' | 'goldSoft' | 'goldDim' | 'danger' | 'success';

export interface AppTextProps extends RNTextProps {
  variant?: TextVariant;
  color?: TextColor;
  children: React.ReactNode;
}

export function AppText({
  variant = 'body',
  color = 'default',
  style,
  children,
  ...rest
}: AppTextProps) {
  return (
    <RNText
      maxFontSizeMultiplier={1.3}
      style={[
        typography[variant],
        styles[color],
        style,
      ]}
      {...rest}
    >
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  default: {
    color: colors.text,
  },
  muted: {
    color: colors.textMuted,
  },
  gold: {
    color: colors.gold,
  },
  goldSoft: {
    color: colors.goldSoft,
  },
  goldDim: {
    color: colors.goldDim,
  },
  danger: {
    color: colors.danger,
  },
  success: {
    color: colors.success,
  },
});
