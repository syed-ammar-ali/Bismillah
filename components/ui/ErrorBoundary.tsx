import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Crescent } from './Crescent';
import { log } from '../../services/logger';
import { colors } from '../../theme/colors';
import { fontFamilies } from '../../theme/typography';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    log('error', 'general', `Unhandled UI Error: ${error.message}\n${errorInfo.componentStack ?? ''}`);
  }

  handleRestart = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
  };

  toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  override render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.container}>
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.iconBox}>
              <Crescent size={64} color={colors.gold} />
            </View>

            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.subtitle}>
              Bismillah encountered an unexpected error. Your stored journeys and data remain safe.
            </Text>

            <Pressable
              onPress={this.handleRestart}
              accessibilityRole="button"
              accessibilityLabel="Restart application"
              style={styles.primaryBtn}
            >
              <Text style={styles.primaryBtnText}>Restart Application</Text>
            </Pressable>

            <Pressable
              onPress={this.toggleDetails}
              accessibilityRole="button"
              accessibilityLabel="Toggle technical error details"
              style={styles.detailsToggle}
            >
              <Text style={styles.detailsToggleText}>
                {this.state.showDetails ? 'Hide Details' : 'View Error Details'}
              </Text>
            </Pressable>

            {this.state.showDetails ? (
              <View style={styles.detailsBox}>
                <Text style={styles.errorName}>{this.state.error?.name}: {this.state.error?.message}</Text>
                <Text style={styles.stackText}>{this.state.errorInfo?.componentStack}</Text>
              </View>
            ) : null}
          </ScrollView>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
  },
  iconBox: {
    marginBottom: 20,
  },
  title: {
    fontFamily: fontFamilies.display,
    fontSize: 26,
    color: colors.gold,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: fontFamilies.body,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 320,
    marginBottom: 28,
  },
  primaryBtn: {
    backgroundColor: colors.gold,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    alignItems: 'center',
    width: '100%',
    maxWidth: 280,
  },
  primaryBtnText: {
    fontFamily: fontFamilies.labelStrong,
    fontSize: 15,
    color: '#060709',
  },
  detailsToggle: {
    marginTop: 20,
    padding: 8,
  },
  detailsToggleText: {
    fontFamily: fontFamilies.label,
    fontSize: 13,
    color: colors.goldSoft,
    textDecorationLine: 'underline',
  },
  detailsBox: {
    backgroundColor: '#0D111C',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E2536',
    padding: 14,
    marginTop: 16,
    width: '100%',
  },
  errorName: {
    fontFamily: fontFamilies.labelStrong,
    fontSize: 12,
    color: colors.danger,
    marginBottom: 8,
  },
  stackText: {
    fontFamily: fontFamilies.body,
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 16,
  },
});
