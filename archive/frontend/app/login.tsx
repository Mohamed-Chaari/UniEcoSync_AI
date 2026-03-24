import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import Colors from '@/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';

type Role = "student" | "professor" | "maintenance" | "admin";

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role>('student');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter dummy email and password for demo.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      login(selectedRole);
    }, 500);
  };

  const RoleButton = ({ role, label }: { role: Role; label: string }) => (
    <TouchableOpacity
      style={[styles.roleButton, selectedRole === role && styles.roleButtonActive]}
      onPress={() => setSelectedRole(role)}
    >
      <Text style={[styles.roleButtonText, selectedRole === role && styles.roleButtonTextActive]} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>UniEcoSync AI</Text>
      <Text style={styles.subtitle}>Smart Campus Management</Text>

      <View style={styles.inputContainer}>
        <TextInput style={styles.input} placeholder="University Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      </View>

      <Text style={styles.roleLabel}>Select your role (Demo):</Text>
      <View style={styles.roleContainer}>
        <RoleButton role="student" label="Student" />
        <RoleButton role="professor" label="Professor" />
        <RoleButton role="maintenance" label="Maint." />
        <RoleButton role="admin" label="Admin" />
      </View>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color={Colors.card} /> : <Text style={styles.loginButtonText}>Login</Text>}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, justifyContent: 'center', padding: 24 },
  title: { fontSize: 32, fontWeight: 'bold', color: Colors.primary, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: Colors.textSecondary, textAlign: 'center', marginBottom: 48 },
  inputContainer: { marginBottom: 24 },
  input: { backgroundColor: Colors.card, borderRadius: 8, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E0E0E0', fontSize: 16 },
  roleLabel: { fontSize: 14, color: Colors.textSecondary, marginBottom: 12 },
  roleContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  roleButton: { flex: 1, paddingVertical: 8, borderWidth: 1, borderColor: Colors.primary, borderRadius: 8, marginHorizontal: 2, alignItems: 'center', justifyContent: 'center' },
  roleButtonActive: { backgroundColor: Colors.primary },
  roleButtonText: { color: Colors.primary, fontWeight: '600', fontSize: 11 },
  roleButtonTextActive: { color: Colors.card },
  loginButton: { backgroundColor: Colors.primary, padding: 16, borderRadius: 8, alignItems: 'center' },
  loginButtonText: { color: Colors.card, fontSize: 18, fontWeight: 'bold' },
});