import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Alert, ActivityIndicator, Animated
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { saveVerificationStatus } from '../../DB/firebaseService';
import { useRouter } from 'expo-router';
import { auth } from '../../constants/appwrite';

const STEPS = [
  { id: 1, label: 'Face detected',  instruction: 'Position your face inside the oval' },
  { id: 2, label: 'Liveness check', instruction: 'Blink slowly 2 times' },
  { id: 3, label: 'Photo captured', instruction: 'Hold still — capturing your photo...' },
];

export default function VerificationScreen() {
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const scanAnim  = useRef(new Animated.Value(0)).current;
  const [permission, requestPermission] = useCameraPermissions();
  const [currentStep, setCurrentStep]   = useState(0);
  const [isCapturing, setIsCapturing]   = useState(false);
  const [verificationDone, setVerificationDone] = useState(false);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(scanAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const scanTranslateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-110, 110],
  });

  const capturePhoto = async () => {
    if (!cameraRef.current || isCapturing) return;
    setIsCapturing(true);
    setCurrentStep(2);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('User not logged in');
      await saveVerificationStatus(userId, photo!.uri);
      setVerificationDone(true);
      setCurrentStep(3);
    } catch (err) {
      Alert.alert('Error', 'Photo capture failed. Please try again.');
      setIsCapturing(false);
      setCurrentStep(1);
    }
  };

  if (!permission) return <View style={styles.centered}><ActivityIndicator color="#FF6B8A" /></View>;

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Ionicons name="camera-off-outline" size={48} color="#555" />
        <Text style={styles.permText}>Camera permission needed</Text>
        <TouchableOpacity style={styles.ctaBtn} onPress={requestPermission}>
          <Text style={styles.ctaBtnText}>Allow Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verify Your Identity</Text>
      </View>

      {/* Progress dots */}
      <View style={styles.dotsRow}>
        {STEPS.map((s, i) => (
          <View key={s.id} style={[
            styles.dot,
            i < currentStep  && styles.dotDone,
            i === currentStep && styles.dotActive,
          ]} />
        ))}
      </View>

      {/* Camera */}
      <View style={styles.cameraWrapper}>
        <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="front" />
        <View style={[styles.oval, verificationDone && styles.ovalVerified]}>
          {!verificationDone && (
            <Animated.View style={[styles.scanLine, { transform: [{ translateY: scanTranslateY }] }]} />
          )}
          {verificationDone && (
            <View style={styles.checkCircle}>
              <Ionicons name="checkmark" size={36} color="#fff" />
            </View>
          )}
        </View>
        <View style={styles.cameraLabel}>
          <Text style={styles.cameraLabelText}>
            {verificationDone ? '✓ Identity verified' : 'Front camera active'}
          </Text>
        </View>
      </View>

      {/* Instruction */}
      <View style={[styles.instrBox, verificationDone && styles.instrBoxDone]}>
        <Text style={[styles.instrText, verificationDone && styles.instrTextDone]}>
          {verificationDone
            ? '🎉 Verification complete! Your profile is now verified.'
            : STEPS[Math.min(currentStep, STEPS.length - 1)].instruction}
        </Text>
      </View>

      {/* Steps */}
      <View style={styles.stepsList}>
        {STEPS.map((s, i) => {
          const isDone   = i < currentStep;
          const isActive = i === currentStep && !verificationDone;
          return (
            <View key={s.id} style={styles.stepItem}>
              <View style={[styles.stepIcon, isDone && styles.stepIconDone, isActive && styles.stepIconActive]}>
                <Text style={styles.stepIconText}>{isDone ? '✓' : isActive ? '◎' : '○'}</Text>
              </View>
              <Text style={[styles.stepTitle, isDone && styles.stepTitleDone, isActive && styles.stepTitleActive]}>
                {s.label}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Buttons */}
      {!verificationDone ? (
        <TouchableOpacity style={styles.ctaBtn} onPress={capturePhoto} disabled={isCapturing}>
          {isCapturing
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.ctaBtnText}>📸 Take Selfie</Text>}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={[styles.ctaBtn, styles.ctaBtnSuccess]} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.ctaBtnText}>✓ Continue to App</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const PINK = '#FF6B8A';
const GREEN = '#4ade80';

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#0d0d0d' },
  centered:        { flex: 1, backgroundColor: '#0d0d0d', alignItems: 'center', justifyContent: 'center' },
  permText:        { color: '#fff', fontSize: 16, marginTop: 16, marginBottom: 20 },
  header:          { flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingHorizontal: 20, paddingBottom: 12, gap: 12 },
  backBtn:         { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1a1a1a', alignItems: 'center', justifyContent: 'center' },
  headerTitle:     { color: '#fff', fontSize: 17, fontWeight: '600' },
  dotsRow:         { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 14 },
  dot:             { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2a2a2a' },
  dotDone:         { backgroundColor: PINK },
  dotActive:       { backgroundColor: PINK, opacity: 0.7 },
  cameraWrapper:   { marginHorizontal: 20, borderRadius: 24, overflow: 'hidden', height: 320, backgroundColor: '#111', alignItems: 'center', justifyContent: 'center' },
  oval:            { width: 200, height: 250, borderRadius: 120, borderWidth: 2.5, borderColor: PINK, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  ovalVerified:    { borderColor: GREEN },
  scanLine:        { position: 'absolute', width: '100%', height: 2, backgroundColor: PINK, opacity: 0.7 },
  checkCircle:     { width: 64, height: 64, borderRadius: 32, backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center' },
  cameraLabel:     { position: 'absolute', bottom: 12, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 4 },
  cameraLabelText: { color: '#aaa', fontSize: 11 },
  instrBox:        { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 20, marginTop: 14, backgroundColor: '#111', borderRadius: 14, padding: 12 },
  instrBoxDone:    { backgroundColor: 'rgba(74,222,128,0.08)' },
  instrText:       { color: '#aaa', fontSize: 13, flex: 1 },
  instrTextDone:   { color: GREEN },
  stepsList:       { marginHorizontal: 20, marginTop: 14 },
  stepItem:        { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: '#1a1a1a' },
  stepIcon:        { width: 30, height: 30, borderRadius: 15, backgroundColor: '#1a1a1a', alignItems: 'center', justifyContent: 'center' },
  stepIconDone:    { backgroundColor: 'rgba(74,222,128,0.15)' },
  stepIconActive:  { backgroundColor: 'rgba(255,107,138,0.15)' },
  stepIconText:    { fontSize: 13, color: '#555' },
  stepTitle:       { fontSize: 13, color: '#555' },
  stepTitleDone:   { color: GREEN, fontWeight: '500' },
  stepTitleActive: { color: '#fff', fontWeight: '500' },
  ctaBtn:          { marginHorizontal: 20, marginTop: 20, marginBottom: 32, paddingVertical: 16, borderRadius: 50, backgroundColor: PINK, alignItems: 'center' },
  ctaBtnSuccess:   { backgroundColor: GREEN },
  ctaBtnText:      { color: '#fff', fontSize: 15, fontWeight: '600' },
});