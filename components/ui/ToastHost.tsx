import { AlertCircle, CheckCircle, Info, X } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUiStore } from '../../stores/useUiStore';
import { colors } from '../../theme/colors';
import { fontFamilies } from '../../theme/typography';

export function ToastHost() {
  const insets = useSafeAreaInsets();
  const activeToast = useUiStore((s) => s.activeToast);
  const dismissToast = useUiStore((s) => s.dismissToast);

  useEffect(() => {
    if (!activeToast) return;
    const timer = setTimeout(() => {
      dismissToast();
    }, 3200);
    return () => clearTimeout(timer);
  }, [activeToast, dismissToast]);

  if (!activeToast) {
    return null;
  }

  const iconColor =
    activeToast.type === 'error'
      ? colors.danger
      : activeToast.type === 'success'
        ? '#34D399'
        : colors.gold;

  const borderColor =
    activeToast.type === 'error'
      ? 'rgba(239, 68, 68, 0.4)'
      : activeToast.type === 'success'
        ? 'rgba(52, 211, 153, 0.4)'
        : 'rgba(245, 158, 11, 0.4)';

  return (
    <View
      pointerEvents="box-none"
      style={[styles.container, { top: insets.top + 8 }]}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
    >
      <Animated.View
        entering={FadeInUp.duration(250)}
        exiting={FadeOutUp.duration(200)}
        style={[styles.toastCard, { borderColor }]}
      >
        <View style={styles.iconContainer}>
          {activeToast.type === 'error' ? (
            <AlertCircle size={18} color={iconColor} />
          ) : activeToast.type === 'success' ? (
            <CheckCircle size={18} color={iconColor} />
          ) : (
            <Info size={18} color={iconColor} />
          )}
        </View>

        <Text style={styles.messageText} numberOfLines={2}>
          {activeToast.message}
        </Text>

        <Pressable
          onPress={dismissToast}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Dismiss notification"
          style={styles.closeBtn}
        >
          <X size={16} color={colors.textMuted} />
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    alignItems: 'center',
  },
  toastCard: {
    width: '100%',
    maxWidth: 420,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D111C',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  iconContainer: {
    marginRight: 10,
  },
  messageText: {
    flex: 1,
    fontFamily: fontFamilies.body,
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
  closeBtn: {
    marginLeft: 10,
    padding: 2,
  },
});
