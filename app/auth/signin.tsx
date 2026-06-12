import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/constants/appwrite';

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{email?: string, password?: string, general?: string}>({});

  const validate = () => {
    const newErrors: {email?: string, password?: string} = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignin = async () => {
    if (!validate()) return;
    
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setTimeout(() => router.replace('/'), 500);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        setErrors({ email: 'Email is not registered. Please sign up first.' });
      } else if (error.code === 'auth/wrong-password') {
        setErrors({ password: 'Incorrect password. Please try again.' });
      } else if (error.code === 'auth/too-many-requests') {
        setErrors({ general: 'Too many failed attempts. Please try again later.' });
      } else {
        setErrors({ general: error.message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome Back!</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.formTitle}>SIGN IN</Text>

        {errors.general && (
          <View style={styles.generalError}>
            <Text style={styles.errorText}>⚠️ {errors.general}</Text>
          </View>
        )}

        {/* Email */}
        <View style={styles.inputGroup}>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            placeholder="Email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={(t) => { setEmail(t); setErrors(p => ({...p, email: undefined})); }}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.email && <Text style={styles.errorText}>⚠️ {errors.email}</Text>}
        </View>

        {/* Password */}
        <View style={styles.inputGroup}>
          <TextInput
            style={[styles.input, errors.password && styles.inputError]}
            placeholder="Password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={(t) => { setPassword(t); setErrors(p => ({...p, password: undefined})); }}
            secureTextEntry
          />
          {errors.password && <Text style={styles.errorText}>⚠️ {errors.password}</Text>}
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSignin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/auth/signup')}>
          <Text style={styles.linkText}>Don't have an account? <Text style={styles.link}>Sign Up</Text></Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5c518' },
  content: { flexGrow: 1 },
  header: { padding: 40, paddingTop: 80, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: '#fff', textAlign: 'center' },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 8, textAlign: 'center' },
  form: { flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 30, gap: 16 },
  formTitle: { fontSize: 22, fontWeight: '800', color: '#1a1a1a', textAlign: 'center', marginBottom: 8 },
  inputGroup: { gap: 4 },
  input: { borderWidth: 1.5, borderColor: '#e0e0e0', borderRadius: 12, padding: 16, fontSize: 15, color: '#1a1a1a', backgroundColor: '#fafafa' },
  inputError: { borderColor: '#FF2D7A' },
  errorText: { color: '#FF2D7A', fontSize: 12, marginLeft: 4 },
  generalError: { backgroundColor: 'rgba(255,45,122,0.1)', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#FF2D7A' },
  button: { backgroundColor: '#f5c518', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  linkText: { textAlign: 'center', color: '#888', fontSize: 14 },
  link: { color: '#f5c518', fontWeight: '700' },
});