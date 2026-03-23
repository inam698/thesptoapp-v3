import { OnboardingStep } from '@/components/onboarding/OnboardingStep';
import { OnboardingPager } from '@/components/ui/OnboardingPager';
import { SpotColors } from '@/constants/Colors';
import React from 'react';

export default function OnboardingScreen() {
  return (
    <OnboardingPager backgroundColor={SpotColors.primary} textColor={SpotColors.textOnPrimary}>
      <OnboardingStep
        title="Welcome to The Spot App"
        description="Your comprehensive Sexual and Reproductive Health journey starts here. Access trusted SRHR resources, track your cycle, and get the support you need."
        image={require('@/assets/images/onboarding/onboarding-1.png')}
        backgroundColor={SpotColors.primary}
        textColor={SpotColors.textOnPrimary}
      />
      
      <OnboardingStep
        title="Track & Learn"
        description="Monitor your menstrual cycle, log your health journey, and access evidence-based information on contraceptives, maternal health, HIV & STIs, and more."
        image={require('@/assets/images/onboarding/onboarding-2.png')}
        backgroundColor={SpotColors.secondary}
        textColor={SpotColors.textOnSecondary}
      />
      
      <OnboardingStep
        title="Find Services & Stay Safe"
        description="Locate nearby health services, understand your SRHR rights, get fact-checked information, and access safety resources when you need them most."
        image={require('@/assets/images/onboarding/onboarding-3.png')}
        backgroundColor={SpotColors.accent}
        textColor={SpotColors.textOnAccent}
      />
    </OnboardingPager>
  );
} 