import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Alert
} from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';

export default function SignupScreen() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    telephone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const { signup, isLoading } = useAuth();

  const handleChange = (name: string, value: string) => {
    if (name === 'telephone') {
      // Remove all non-digit characters
      const digits = value.replace(/\D/g, '');

      // Format the phone number
      let formattedPhone = '';
      if (digits.length <= 3) {
        formattedPhone = digits;
      } else if (digits.length <= 6) {
        formattedPhone = `${digits.slice(0, 3)}-${digits.slice(3)}`;
      } else {
        formattedPhone = `${digits.slice(0, 3)}-${digits.slice(
          3,
          6
        )}-${digits.slice(6, 10)}`;
      }

      setFormData((prev) => ({ ...prev, telephone: formattedPhone }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSignup = async () => {
    try {
      setError('');

      const {
        firstName,
        lastName,
        dateOfBirth,
        telephone,
        email,
        password,
        confirmPassword
      } = formData;

      if (
        !firstName ||
        !lastName ||
        !dateOfBirth ||
        !telephone ||
        !email ||
        !password ||
        !confirmPassword
      ) {
        setError('Por favor, complete todos los campos');
        return;
      }

      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden');
        return;
      }

      if (password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        return;
      }

      await signup(
        firstName,
        lastName,
        dateOfBirth,
        telephone,
        email,
        password
      );
      Alert.alert(
        'Cuenta creada',
        'Por favor, revisa tu correo electrónico para verificar tu cuenta.'
      );
      router.back();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al crear la cuenta. Por favor, intente de nuevo.'
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Crear cuenta</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="Nombre"
            value={formData.firstName}
            onChangeText={(value) => handleChange('firstName', value)}
            autoCapitalize="words"
            editable={!isLoading}
            autoComplete="given-name"
          />

          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="Apellido"
            value={formData.lastName}
            onChangeText={(value) => handleChange('lastName', value)}
            autoCapitalize="words"
            editable={!isLoading}
            autoComplete="family-name"
          />
        </View>

        <TextInput
          style={styles.input}
          placeholder="Fecha de nacimiento (YYYY-MM-DD)"
          value={formData.dateOfBirth}
          onChangeText={(value) => handleChange('dateOfBirth', value)}
          editable={!isLoading}
        />

        <TextInput
          style={styles.input}
          placeholder="Teléfono (999-999-9999)"
          value={formData.telephone}
          onChangeText={(value) => handleChange('telephone', value)}
          keyboardType="phone-pad"
          editable={!isLoading}
          maxLength={12}
        />

        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          value={formData.email}
          onChangeText={(value) => handleChange('email', value)}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!isLoading}
          autoComplete="email"
        />

        <TextInput
          style={styles.input}
          placeholder="Contraseña (mínimo 6 caracteres)"
          value={formData.password}
          onChangeText={(value) => handleChange('password', value)}
          secureTextEntry
          editable={!isLoading}
          autoComplete="password-new"
        />

        <TextInput
          style={styles.input}
          placeholder="Confirmar contraseña"
          value={formData.confirmPassword}
          onChangeText={(value) => handleChange('confirmPassword', value)}
          secureTextEntry
          editable={!isLoading}
          autoComplete="password-new"
        />

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSignup}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Crear cuenta</Text>
          )}
        </TouchableOpacity>

        <View style={styles.linkContainer}>
          <Text>¿Ya tienes una cuenta? </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.link}>Iniciar sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  content: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#fff'
  },
  halfInput: {
    flex: 0.48
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center'
  },
  buttonDisabled: {
    backgroundColor: '#007AFF80'
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  error: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center'
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20
  },
  link: {
    color: '#007AFF'
  }
});
