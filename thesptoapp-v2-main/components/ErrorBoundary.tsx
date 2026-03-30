import { SpotColors } from '@/constants/Colors';
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary] Caught render error:', error?.message ?? error);
    console.error('[ErrorBoundary] Component stack:', info.componentStack);
    console.error('[ErrorBoundary] Error stack:', error?.stack);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.emoji}>😔</Text>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            The app ran into an unexpected error. Please try again.
          </Text>
          <TouchableOpacity style={styles.button} onPress={this.handleRetry}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
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
  buttonText: {
    color: SpotColors.textOnPrimary,
    fontWeight: '600',
    fontSize: 16,
  },
});
