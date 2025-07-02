import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { AppContext } from '../context/AppContext'; // ✅ AppContext'i içeri al

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Login'
>;

interface LoginResponse {
  success: boolean;
  message?: string;
}

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { setUser } = useContext(AppContext); // ✅ Kullanıcıyı context'e yazmak için

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) return;

    try {
      const response = await axios.post<LoginResponse>('http://192.168.1.110:3000/api/login', {
        username,
        password,
      });

      if (response.data.success) {
        // ✅ AppContext'e kullanıcıyı kaydet
        setUser({ id: username , name: username });

        Alert.alert('Başarılı', 'Giriş tamamlandı!', [
          { text: 'Tamam', onPress: () => navigation.navigate('Main') },
        ]);
      } else {
        Alert.alert('Hata', response.data.message || 'Giriş başarısız.');
      }
    } catch (error) {
      Alert.alert('Hata', 'Sunucuya bağlanılamadı');
    }
  };
  const navigateToRegister = () => {
    navigation.navigate('Register'); // Register ekranına yönlendirme
  };

  return (
    <View style={styles.container}>
      <Text>Kullanıcı Adı:</Text>
      <TextInput style={styles.input} onChangeText={setUsername} value={username} />

      <Text>Parola:</Text>
      <TextInput
        style={styles.input}
        onChangeText={setPassword}
        value={password}
        secureTextEntry
      />

      <Button title="Giriş Yap" onPress={handleLogin} />
      <TouchableOpacity onPress={navigateToRegister} style={styles.registerLink}>
        <Text style={styles.registerText}>Hesabınız yok mu? Kayıt Olun</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  input: { borderWidth: 1, marginBottom: 10, padding: 8 },
  container: { padding: 80 },
  registerLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  registerText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
});

export default LoginScreen;
