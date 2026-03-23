import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

interface OnboardingStepProps {
  title: string;
  description: string;
  image?: string | number;
  backgroundColor?: string;
  textColor?: string;
}

export function OnboardingStep({
  title,
  description,
  image,
  backgroundColor = '#FDFDC9',
  textColor = '#2E2E2E',
}: OnboardingStepProps) {
  const { width, height } = useWindowDimensions();

  return (
    <View style={[styles.container, { backgroundColor, width }]}>
      <View style={styles.content}>
        {image && (
          <View style={styles.imageContainer}>
            <Image
              source={image}
              style={[styles.image, { width: width * 0.7, height: height * 0.3 }]}
              contentFit="contain"
            />
          </View>
        )}
        
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: textColor }]}>{title}</Text>
          <Text style={[styles.description, { color: textColor }]}>{description}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  image: {
    borderRadius: 20,
  },
  textContainer: {
    alignItems: 'center',
    paddingBottom: '10%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.8,
  },
}); 