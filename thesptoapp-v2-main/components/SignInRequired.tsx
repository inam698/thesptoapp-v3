import { SpotColors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SignInRequiredProps {
  icon: keyof typeof Ionicons.glyphMap;
  message: string;
}

export default function SignInRequired({ icon, message }: SignInRequiredProps) {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[SpotColors.gradientLight, SpotColors.gradientMid, SpotColors.surface] as any}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={styles.signInContainer}>
        <LinearGradient
          colors={[SpotColors.border, SpotColors.gradientLight, "transparent"] as any}
          style={styles.signInHeaderGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={styles.signInCard}>
          <View style={styles.signInIconContainer}>
            <LinearGradient
              colors={[SpotColors.blush, SpotColors.rose] as any}
              style={styles.signInIconGradient}
            >
              <Ionicons name={icon} size={48} color={SpotColors.textOnPrimary} />
            </LinearGradient>
          </View>
          <Text style={styles.signInTitle}>Sign In Required</Text>
          <Text style={styles.signInSubtitle}>{message}</Text>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => router.push('/(auth)/sign-in')}
          >
            <LinearGradient
              colors={[SpotColors.blush, SpotColors.rose] as any}
              style={styles.signInButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="log-in" size={20} color={SpotColors.textOnPrimary} style={{ marginRight: 8 }} />
              <Text style={styles.signInButtonText}>Sign In</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.signUpLink}
            onPress={() => router.push('/(auth)/sign-up')}
          >
            <Text style={styles.signUpLinkText}>
              Do not have an account? <Text style={styles.signUpLinkBold}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SpotColors.background,
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  signInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    position: 'relative',
  },
  signInHeaderGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  signInCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    backgroundColor: SpotColors.surface,
    shadowColor: SpotColors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    borderColor: SpotColors.border,
    zIndex: 1,
  },
  signInIconContainer: {
    marginBottom: 24,
  },
  signInIconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: SpotColors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
  signInTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: SpotColors.primary,
    marginBottom: 12,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  signInSubtitle: {
    fontSize: 16,
    color: SpotColors.primary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
    fontWeight: '500',
  },
  signInButton: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: SpotColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 5,
    marginBottom: 16,
  },
  signInButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 24,
  },
  signInButtonText: {
    color: SpotColors.surface,
    fontWeight: '700',
    fontSize: 17,
    letterSpacing: 0.3,
  },
  signUpLink: {
    marginTop: 8,
  },
  signUpLinkText: {
    fontSize: 15,
    color: SpotColors.primary,
    textAlign: 'center',
  },
  signUpLinkBold: {
    fontWeight: '700',
    color: SpotColors.primary,
  },
});
