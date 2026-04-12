import { SpotColors } from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Updates from 'expo-updates';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  isReloading: boolean;
  errorMessage: string | null;
  componentStack: string | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, isReloading: false, errorMessage: null, componentStack: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      isReloading: false,
      errorMessage: error?.message ?? 'Unknown error',
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary] Caught render error:', {
      message: error?.message,
      stack: error?.stack,
      platform: Platform.OS,
      isPad: Platform.OS === 'ios' && (Platform as any).isPad,
      version: Platform.Version,
    });
    console.error('[ErrorBoundary] Component stack:', info.componentStack);

    // Store the component stack so we can display it
    this.setState({
      componentStack: info.componentStack ?? null,
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, isReloading: false, errorMessage: null, componentStack: null });
  };

  handleSkipToGuest = async () => {
    try {
      // Set guest mode and mark onboarding complete so the app can navigate past auth
      await AsyncStorage.setItem('@guest_mode', 'true');
      await AsyncStorage.setItem('@onboarding_completed', 'true');
      // Reload the app to apply the new state cleanly
      if (!__DEV__ && Updates.reloadAsync) {
        await Updates.reloadAsync();
      } else {
        this.setState({ hasError: false, isReloading: false, errorMessage: null, componentStack: null });
      }
    } catch {
      // If even this fails, just retry normally
      this.setState({ hasError: false, isReloading: false, errorMessage: null, componentStack: null });
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.emoji}>🌸</Text>
          <Text style={styles.title}>Oops! Let&apos;s try that again</Text>
          <Text style={styles.message}>
            The Spot App hit a bump. This is usually temporary — tap below to reload.
          </Text>
          <TouchableOpacity
            style={[styles.button, this.state.isReloading ? styles.buttonDisabled : null]}
            onPress={this.handleRetry}
            disabled={this.state.isReloading}
          >
            <Text style={styles.buttonText}>
              {this.state.isReloading ? 'Reloading...' : 'Reload App'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.skipToGuestButton}
            onPress={this.handleSkipToGuest}
          >
            <Text style={styles.skipToGuestText}>Skip &amp; Continue as Guest</Text>
          </TouchableOpacity>
          <Text style={styles.hint}>
            If this keeps happening, try closing and reopening the app,
            or tap Skip below to continue without signing in.
          </Text>

          {/* Show actual error details only in development */}
          {__DEV__ && this.state.errorMessage && (
            <ScrollView style={styles.debugBox} contentContainerStyle={styles.debugContent}>
              <Text style={styles.debugLabel}>Error:</Text>
              <Text style={styles.debugText} selectable>{this.state.errorMessage}</Text>
              {this.state.componentStack && (
                <>
                  <Text style={styles.debugLabel}>Component stack:</Text>
                  <Text style={styles.debugText} selectable>{this.state.componentStack.trim()}</Text>
                </>
              )}
            </ScrollView>
          )}
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: SpotColors.background,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: SpotColors.textPrimary,
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    color: SpotColors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  button: {
    backgroundColor: SpotColors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
  },
  buttonDisabled: {
    opacity: 0.75,
  },
  buttonText: {
    color: SpotColors.textOnPrimary,
    fontWeight: '600',
    fontSize: 16,
  },
  skipToGuestButton: {
    marginTop: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: SpotColors.border,
  },
  skipToGuestText: {
    color: SpotColors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  hint: {
    fontSize: 13,
    color: SpotColors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
    opacity: 0.7,
  },
  debugBox: {
    marginTop: 20,
    maxHeight: 200,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: SpotColors.border,
  },
  debugContent: {
    padding: 12,
  },
  debugLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: SpotColors.textSecondary,
    marginBottom: 2,
    marginTop: 8,
  },
  debugText: {
    fontSize: 11,
    color: SpotColors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 16,
  },
});
