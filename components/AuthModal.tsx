import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { supabase } from '../supabase';

// Email/password sign-in + sign-up modal backed by Supabase auth.
// Session persistence is handled cross-platform (iOS + Android) by ../supabase,
// so this component works the same on both runtimes.
// Usage: <AuthModal visible={showAuth} onClose={() => setShowAuth(false)} />
interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ visible, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    // Validate inputs
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    if (!password.trim()) {
      setError('Please enter a password');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setSuccess('Signed in successfully!');
        setTimeout(onClose, 500);
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccess('Check your email to confirm your account!');
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.card}>
          <Text style={styles.title}>{isLogin ? 'Welcome back' : 'Create account'}</Text>
          <Text style={styles.subtitle}>
            {isLogin ? 'Sign in to continue' : 'Sign up to get started'}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#9ca3af"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            editable={!loading}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#9ca3af"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />

          {!!error && <Text style={styles.error}>{error}</Text>}
          {!!success && <Text style={styles.success}>{success}</Text>}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>{isLogin ? 'Sign in' : 'Sign up'}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setIsLogin(!isLogin);
              setError('');
              setSuccess('');
            }}
            disabled={loading}
          >
            <Text style={styles.toggle}>
              {isLogin
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} disabled={loading}>
            <Text style={styles.close}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 28,
  },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', textAlign: 'center' },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
    marginBottom: 12,
  },
  error: { color: '#dc2626', fontSize: 13, marginBottom: 8 },
  success: { color: '#16a34a', fontSize: 13, marginBottom: 8 },
  button: {
    backgroundColor: '#4f46e5',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: { color: '#ffffff', fontSize: 15, fontWeight: '600' },
  toggle: { color: '#6b7280', fontSize: 13, textAlign: 'center', marginTop: 16 },
  close: { color: '#9ca3af', fontSize: 13, textAlign: 'center', marginTop: 12 },
});

export default AuthModal;
