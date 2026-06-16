import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { auth, db } from '../../constants/appwrite';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const { width, height } = Dimensions.get('window');

// Only letters and spaces allowed
const NAME_REGEX = /^[A-Za-z\s]+$/;
// Exactly 10 digits
const PHONE_REGEX = /^[0-9]{10}$/;

const SignupScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    terms: '',
  });

  const router = useRouter();

  const validate = () => {
    const newErrors = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      terms: '',
    };
    let isValid = true;

    // Name validation
    if (!name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    } else if (!NAME_REGEX.test(name)) {
      newErrors.name = 'Name can only contain letters and spaces';
      isValid = false;
    }

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    // Phone number validation
    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
      isValid = false;
    } else if (!PHONE_REGEX.test(phone)) {
      newErrors.phone = 'Enter a valid 10-digit phone number';
      isValid = false;
    }

    // Terms & conditions validation
    if (!agreedToTerms) {
      newErrors.terms = 'You must accept the Terms & Conditions to continue';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSignup = async () => {
    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      await setDoc(doc(db, 'users', uid), {
        uid,
        name,
        email,
        phone,
        age: 0,
        gender: '',
        bio: '',
        intent: 'relationship',
        photos: [],
        liked: [],
        matches: [],
        createdAt: new Date(),
      });

      Alert.alert('Success', 'Account created! Please sign in.');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setName('');
      setPhone('');
      setAgreedToTerms(false);
      setErrors({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        terms: '',
      });
      router.replace('/(tabs)/VerificationScreen');
    } catch (error: any) {
      Alert.alert('Signup Error', error.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#FFD600', '#FFD600', '#1a1a1a']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ImageBackground
          source={require('../../assets/images/sign-up.jpg')}
          style={styles.backgroundImage}
          imageStyle={styles.backgroundImageStyle}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.headerSection}>
              <Text style={styles.welcomeText}>Join Us Today</Text>
              <Text style={styles.subtitle}>Create your account and start exploring</Text>
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>SIGN UP</Text>

              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, errors.name && styles.inputError]}
                  placeholder="Full Name"
                  placeholderTextColor="#999"
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                  }}
                  autoCapitalize="words"
                />
                {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  placeholder="Email"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, errors.phone && styles.inputError]}
                  placeholder="Phone Number"
                  placeholderTextColor="#999"
                  value={phone}
                  onChangeText={(text) => {
                    // Allow only digits, max 10
                    const digitsOnly = text.replace(/[^0-9]/g, '').slice(0, 10);
                    setPhone(digitsOnly);
                    if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                  }}
                  keyboardType="number-pad"
                  maxLength={10}
                />
                {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, errors.password && styles.inputError]}
                  placeholder="Password"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                  }}
                  secureTextEntry
                />
                {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, errors.confirmPassword && styles.inputError]}
                  placeholder="Confirm Password"
                  placeholderTextColor="#999"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                  }}
                  secureTextEntry
                />
                {errors.confirmPassword ? (
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                ) : null}
              </View>

              <View style={styles.checkboxRow}>
                <TouchableOpacity
                  style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}
                  onPress={() => {
                    setAgreedToTerms(!agreedToTerms);
                    if (errors.terms) setErrors((prev) => ({ ...prev, terms: '' }));
                  }}
                >
                  {agreedToTerms ? <Text style={styles.checkboxTick}>✓</Text> : null}
                </TouchableOpacity>
                <Text style={styles.checkboxLabel}>
                  I agree to the Terms & Conditions
                </Text>
              </View>
              {errors.terms ? <Text style={styles.errorText}>{errors.terms}</Text> : null}

              <TouchableOpacity
                style={[styles.signupButton, loading && styles.signupButtonDisabled]}
                onPress={handleSignup}
                disabled={loading}
              >
                <View style={styles.signupButtonSolid}>
                  <Text style={styles.signupButtonTextSolid}>
                    {loading ? 'Creating Account...' : 'Sign Up'}
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>Or sign up with</Text>
                <View style={styles.divider} />
              </View>

              <View style={styles.socialContainer}>
                <TouchableOpacity style={styles.socialButton}>
                  <Text style={styles.socialButtonText}>G</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton}>
                  <Text style={styles.socialButtonText}>f</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={() => router.replace('/auth/signin')}
                style={styles.linkContainer}
              >
                <Text style={styles.linkText}>
                  Already have an account? <Text style={styles.linkHighlight}>Sign In</Text>
                </Text>
              </TouchableOpacity>

              <View style={styles.termsContainer}>
                <Text style={styles.termsText}>
                  By signing up, you agree to our{' '}
                  <Text style={styles.termsLink}>Terms of Service</Text>
                  {' '}and{' '}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </View>
            </View>
          </ScrollView>
        </ImageBackground>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  backgroundImage: { flex: 1 },
  backgroundImageStyle: { opacity: 0.3 },
  scrollContainer: { flexGrow: 1, justifyContent: 'space-between', minHeight: height },
  headerSection: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60 },
  welcomeText: { fontSize: 32, fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.9)', textAlign: 'center' },
  formContainer: { backgroundColor: 'rgba(255,255,255,0.95)', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 30, paddingBottom: 50, minHeight: height * 0.65 },
  formTitle: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 8, color: '#333', letterSpacing: 1 },
  inputContainer: { marginBottom: 20 },
  input: { backgroundColor: '#f8f9fa', borderRadius: 12, padding: 16, fontSize: 16, color: '#333', borderWidth: 1, borderColor: '#e9ecef' },
  inputError: { borderColor: '#e74c3c' },
  errorText: { color: '#e74c3c', fontSize: 13, marginTop: 6, marginLeft: 4 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  checkbox: { width: 22, height: 22, borderRadius: 4, borderWidth: 2, borderColor: '#999', marginRight: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa' },
  checkboxChecked: { backgroundColor: '#FFD600', borderColor: '#FFD600' },
  checkboxTick: { color: '#1a1a1a', fontSize: 14, fontWeight: 'bold' },
  checkboxLabel: { fontSize: 14, color: '#333', flexShrink: 1 },
  signupButton: { borderRadius: 12, overflow: 'hidden', elevation: 3, marginBottom: 20, marginTop: 16 },
  signupButtonDisabled: { elevation: 0 },
  signupButtonSolid: { paddingVertical: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFD600', borderRadius: 12 },
  signupButtonTextSolid: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  divider: { flex: 1, height: 1, backgroundColor: '#e9ecef' },
  dividerText: { marginHorizontal: 16, color: '#6c757d', fontSize: 14 },
  socialContainer: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginBottom: 20 },
  socialButton: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#FFD600', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#1a1a1a' },
  socialButtonText: { fontSize: 20, fontWeight: 'bold', color: '#1a1a1a' },
  linkContainer: { alignItems: 'center', marginBottom: 20 },
  linkText: { color: '#6c757d', fontSize: 16 },
  linkHighlight: { color: '#FFD600', fontWeight: '700', textDecorationLine: 'underline' },
  termsContainer: { paddingHorizontal: 10 },
  termsText: { fontSize: 12, color: '#6c757d', textAlign: 'center', lineHeight: 18 },
  termsLink: { color: '#FFD600', fontWeight: '500' },
});

export default SignupScreen;