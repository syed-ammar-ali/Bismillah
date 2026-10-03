import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../../theme/colors';

export interface CrescentProps {
  size?: number;
  color?: string;
  opacity?: number;
  style?: StyleProp<ViewStyle>;
}

export function Crescent({
  size = 24,
  color = colors.gold,
  opacity = 1,
  style,
}: CrescentProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={style}
    >
      <Path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c2.5 0 4.8-.9 6.6-2.4-3.8-.5-6.6-3.7-6.6-7.6 0-3.9 2.8-7.1 6.6-7.6C16.8 2.9 14.5 2 12 2z"
        fill={color}
        fillOpacity={opacity}
      />
    </Svg>
  );
}
