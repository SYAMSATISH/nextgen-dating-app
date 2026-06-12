import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/constants/appwrite';

export default function SignUp() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{name?: string, email?: string, password?: string}>({});

  const validate = () => {
    const newErrors: {name?: string, email?: string, password?: string} = {};
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[A-Z])/.test(password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/(?=.*[0-9])/.test(password)) {
      newErrors.password = 'Password must contain at least one number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;
    
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      await setDoc(doc(db, 'users', uid), {
        uid,
        name: name.trim(),
        email: email.trim(),
        bio: '',
        intent: 'relationship',
        photos: [],
        liked: [],
        matches: [],
        createdAt: new Date(),
      });
      router.replace('/auth/onboarding');
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setErrors({ email: 'This email is already registered. Please sign in.' });
      } else {
        Alert.alert('Error', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Join Us Today</Text>
        <Text style={styles.subtitle}>Create your account and start exploring</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.formTitle}>SIGN UP</Text>

        {/* Name */}
        <View style={styles.inputGroup}>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            placeholder="Full Name"
            placeholderTextColor="#999"
            value={name}
            onChangeText={(t) => { setName(t); setErrors(p => ({...p, name: undefined})); }}
          />
          {errors.name && <Text style={styles.errorText}>⚠️ {errors.name}</Text>}
        </View>

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
          <Text style={styles.hintText}>
            Password must be 6+ chars, 1 uppercase, 1 number
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSignup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign Up</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/auth/signin')}>
          <Text style={styles.linkText}>Already have an account? <Text style={styles.link}>Sign In</Text></Text>
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
  hintText: { color: '#999', fontSize: 11, marginLeft: 4 },
  button: { backgroundColor: '#f5c518', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  linkText: { textAlign: 'center', color: '#888', fontSize: 14 },
  link: { color: '#f5c518', fontWeight: '700' },
});