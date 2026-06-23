import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

const API_URL = 'https://cuddly-halibut-4q754w5r4ggwf57g4-8080.app.github.dev/api/verify-selfie';

interface VerifyResult {
  verified: boolean;
  similarity: number;
  confidence: 'high' | 'medium' | 'low';
  message: string;
  error?: string;
}

export default function VerifySelfie() {
  const [selfieUri, setSelfieUri] = useState<string | null>(null);
  const [profileUri, setProfileUri] = useState<string | null>(null);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // ─── Pick from Gallery ────────────────────────────────────────
  const pickFromGallery = async (type: 'selfie' | 'profile'): Promise<void> => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      Alert.alert('Permission Required', 'Allow access to your photo library.');
      return;
    }

    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!picked.canceled && picked.assets.length > 0) {
      type === 'selfie'
        ? setSelfieUri(picked.assets[0].uri)
        : setProfileUri(picked.assets[0].uri);
      setResult(null);
    }
  };

  // ─── Take Selfie with Camera ──────────────────────────────────
  const openCamera = async (): Promise<void> => {
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) {
      Alert.alert('Permission Required', 'Allow access to your camera.');
      return;
    }

    const photo = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!photo.canceled && photo.assets.length > 0) {
      setSelfieUri(photo.assets[0].uri);
      setResult(null);
    }
  };

  // ─── Convert to Base64 ───────────────────────────────────────
  const toBase64 = async (uri: string): Promise<string> => {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return `data:image/jpeg;base64,${base64}`;
  };

  // ─── Send to Backend ─────────────────────────────────────────
  const verifyFace = async (): Promise<void> => {
    if (!selfieUri || !profileUri) {
      Alert.alert('Missing Images', 'Please provide both selfie and profile photo.');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const [selfieBase64, profileBase64] = await Promise.all([
        toBase64(selfieUri),
        toBase64(profileUri),
      ]);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user123', // replace with real userId from auth
          selfie: selfieBase64,
          profilePhoto: profileBase64,
        }),
      });

      const data: VerifyResult = await response.json();
      setResult(data);

    } catch (err: any) {
      Alert.alert('Error', 'Could not connect to server.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ─── Helpers ─────────────────────────────────────────────────
  const getResultColor = (): string => {
    if (!result) return '#ccc';
    return result.verified ? '#22c55e' : '#ef4444';
  };

  const confidenceColor: Record<string, string> = {
    high: '#22c55e',
    medium: '#f59e0b',
    low: '#ef4444',
  };

  // ─── UI ──────────────────────────────────────────────────────
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Profile Verification</Text>
      <Text style={styles.subtitle}>Verify your selfie matches your profile photo</Text>

      {/* Selfie Card */}
      <View style={styles.card}>
        <Text style={styles.label}>📸 Your Selfie</Text>
        {selfieUri ? (
          <Image source={{ uri: selfieUri }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>No selfie selected</Text>
          </View>
        )}
        <View style={styles.row}>
          <TouchableOpacity style={styles.btnSecondary} onPress={openCamera}>
            <Text style={styles.btnSecondaryText}>📷 Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnSecondary} onPress={() => pickFromGallery('selfie')}>
            <Text style={styles.btnSecondaryText}>🖼 Gallery</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile Photo Card */}
      <View style={styles.card}>
        <Text style={styles.label}>🧑 Profile Photo</Text>
        {profileUri ? (
          <Image source={{ uri: profileUri }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>No profile photo selected</Text>
          </View>
        )}
        <TouchableOpacity style={styles.btnSecondary} onPress={() => pickFromGallery('profile')}>
          <Text style={styles.btnSecondaryText}>🖼 Choose from Gallery</Text>
        </TouchableOpacity>
      </View>

      {/* Verify Button */}
      <TouchableOpacity
        style={[styles.btnPrimary, loading && styles.btnDisabled]}
        onPress={verifyFace}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnPrimaryText}>🔍 Verify Now</Text>
        )}
      </TouchableOpacity>

      {/* Result Card */}
      {result && (
        <View style={[styles.resultCard, { borderColor: getResultColor() }]}>
          <Text style={styles.resultIcon}>{result.verified ? '✅' : '❌'}</Text>
          <Text style={[styles.resultMessage, { color: getResultColor() }]}>
            {result.message}
          </Text>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Similarity</Text>
            <Text style={styles.resultValue}>{result.similarity}%</Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Confidence</Text>
            <View style={[styles.badge, { backgroundColor: confidenceColor[result.confidence] }]}>
              <Text style={styles.badgeText}>{result.confidence?.toUpperCase()}</Text>
            </View>
          </View>

          {result.error && (
            <Text style={styles.errorText}>⚠️ {result.error}</Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f9fafb',
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  image: {
    width: 160,
    height: 160,
    borderRadius: 80,
    marginBottom: 14,
    borderWidth: 3,
    borderColor: '#e5e7eb',
  },
  placeholder: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  placeholderText: {
    color: '#9ca3af',
    fontSize: 13,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  btnSecondary: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: '#fff',
  },
  btnSecondaryText: {
    color: '#374151',
    fontWeight: '500',
    fontSize: 14,
  },
  btnPrimary: {
    backgroundColor: '#6366f1',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#6366f1',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 30,
  },
  resultIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  resultMessage: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  resultLabel: {
    color: '#6b7280',
    fontSize: 14,
  },
  resultValue: {
    fontWeight: '700',
    fontSize: 14,
    color: '#111827',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 13,
    marginTop: 10,
    textAlign: 'center',
  },
});