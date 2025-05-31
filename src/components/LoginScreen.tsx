import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
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
      const response = await axios.post<LoginResponse>('http://192.168.1.102:3000/api/login', {
        username,
        password,
      });

      if (response.data.success) {
        // ✅ AppContext'e kullanıcıyı kaydet
        setUser({ id: username, name: username });

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
    </View>
  );
};

const styles = StyleSheet.create({
  input: { borderWidth: 1, marginBottom: 10, padding: 8 },
  container: { padding: 80 },
});

export default LoginScreen;
