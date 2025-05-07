import React, { useContext, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { AppContext } from '../context/AppContext';

const LoginScreen = () => {
  const { setUser } = useContext(AppContext);
  const [username, setUsername] = useState('');

  const handleLogin = () => {
    if (username.trim()) {
      setUser({ id: 'user123', name: username });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Giriş Yap</Text>
      <TextInput
        placeholder="Adınızı girin"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />
      <Button title="Giriş" onPress={handleLogin} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 6,
    padding: 10,
    marginBottom: 15,
  },
});

export default LoginScreen;
