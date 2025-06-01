import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import storage from './utils/storage';

const slides = [
  {
    id: 1,
    title: 'Welcome to PassAI',
    description: 'Your secure password manager with AI-powered features',
    icon: 'shield-checkmark',
  },
  {
    id: 2,
    title: 'Store All Your Credentials',
    description: 'Passwords, credit cards, notes, and WiFi credentials in one secure place',
    icon: 'lock-closed',
  },
  {
    id: 3,
    title: 'AI-Powered Features',
    description: 'Generate strong passwords and get security recommendations',
    icon: 'key',
  },
];

export default function Onboarding() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const handleNext = async () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    } else {
      await storage.setOnboardingComplete();
      router.replace('/sign-in');
    }
  };

  const handleSkip = async () => {
    await storage.setOnboardingComplete();
    router.replace('/sign-in');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.slideContainer}>
        <View style={styles.iconContainer}>
          <Ionicons name={slides[currentSlideIndex].icon} size={120} color="#fff" />
        </View>
        <Text style={styles.title}>{slides[currentSlideIndex].title}</Text>
        <Text style={styles.description}>{slides[currentSlideIndex].description}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentSlideIndex && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>
              {currentSlideIndex === slides.length - 1 ? 'Get Started' : 'Next'}
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
    backgroundColor: '#000',
  },
  slideContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  iconContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#333',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#fff',
    width: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    padding: 16,
  },
  skipButtonText: {
    color: '#999',
    fontSize: 16,
  },
  nextButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  nextButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
}); 