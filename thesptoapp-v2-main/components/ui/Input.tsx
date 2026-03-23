import { SpotColors } from '@/constants/Colors';
import React from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    View,
    ViewStyle,
} from 'react-native';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  containerStyle?: ViewStyle;
  renderRight?: () => React.ReactNode;
}

export function Input({ label, error, containerStyle, renderRight, ...props }: InputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <View style={{ position: 'relative' }}>
        <TextInput
          style={[
            styles.input,
            error ? styles.inputError : null,
            renderRight ? { paddingRight: 44 } : null,
          ]}
          placeholderTextColor={SpotColors.textPrimary + '60'}
          {...props}
        />
        {renderRight && (
          <View style={styles.rightIconContainer}>{renderRight()}</View>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: SpotColors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  input: {
    borderWidth: 1.5,
    borderColor: SpotColors.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: SpotColors.textPrimary,
    backgroundColor: SpotColors.background,
    shadowColor: SpotColors.border,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 1,
  },
  inputError: {
    borderColor: SpotColors.error,
  },
  errorText: {
    color: SpotColors.error,
    fontSize: 13,
    marginTop: 6,
    fontWeight: '500',
  },
  rightIconContainer: {
    position: 'absolute',
    right: 8,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: 36,
  },
}); 