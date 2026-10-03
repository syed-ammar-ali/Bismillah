import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

export interface TodayWidgetProps {
  counter: number;
}

export function TodayWidget({ counter }: TodayWidgetProps) {
  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0B0F1A',
        borderRadius: 24,
      }}
      clickAction="INCREMENT"
    >
      <TextWidget
        text="Bismillah"
        style={{
          fontSize: 14,
          color: '#D4AF37',
          fontWeight: 'bold',
          marginBottom: 8,
        }}
      />
      <TextWidget
        text={String(counter)}
        style={{
          fontSize: 32,
          color: '#F2EFE6',
          fontWeight: 'bold',
        }}
      />
      <TextWidget
        text="Tap to +1"
        style={{
          fontSize: 12,
          color: '#8B93A7',
          marginTop: 6,
        }}
      />
    </FlexWidget>
  );
}
