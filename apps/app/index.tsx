import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';

export default function Index() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Inicio',
          headerRight: () => (
            <TouchableOpacity
              onPress={handleLogout}
              style={styles.logoutButton}
            >
              <Text style={styles.logoutText}>Cerrar sesión</Text>
            </TouchableOpacity>
          )
        }}
      />
      <View style={styles.container}>
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>
            ¡Bienvenido, {user?.name || 'Usuario'}!
          </Text>
          <Text style={styles.emailText}>{user?.email}</Text>
        </View>

        <TouchableOpacity
          style={styles.mainLogoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.mainLogoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'space-between'
  },
  welcomeContainer: {
    marginTop: 20,
    alignItems: 'center'
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8
  },
  emailText: {
    fontSize: 16,
    color: '#666'
  },
  logoutButton: {
    marginRight: 15
  },
  logoutText: {
    color: '#007AFF',
    fontSize: 16
  },
  mainLogoutButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20
  },
  mainLogoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  }
});
