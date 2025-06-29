import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
} from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation'; // doğru path olduğundan emin ol

// 🧭 Navigation tipi tanımlandı
type RegisterScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Register'
>;

// 📦 API'den dönen veri tipi
interface RegisterResponse {
  success: boolean;
  message?: string;
}

const RegisterScreen = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();

  const [username, setUsername] = useState('');
  const [pass, setPass] = useState('');

  const handleRegister = async () => {
    if (!username.trim() || !pass.trim()) return;

    try {
      const response = await axios.post<RegisterResponse>(
        'http://192.168.1.110:3000/api/register',
        {
          username : username ,
          password: pass,
        }
      );

      if (response.data.success) {
        Alert.alert('Başarılı', 'Kayıt tamamlandı!', [
          { text: 'Tamam', onPress: () => navigation.navigate('Login') },
        ]);
      } else {
        Alert.alert('Hata', response.data.message || 'Kayıt başarısız.');
      }
    } catch (error) {
      Alert.alert('Hata', 'Sunucuya bağlanılamadı');
    }
  };

  return (
    <View style={styles.container}>
      <Text>Kullanıcı Adı:</Text>
      <TextInput
        style={styles.input}
        onChangeText={setUsername}
        value={username}
        autoCapitalize="none"
      />

      <Text>Parola:</Text>
      <TextInput
        style={styles.input}
        onChangeText={setPass}
        value={pass}
        secureTextEntry
      />

      <Button title="Kayıt Ol" onPress={handleRegister} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 40,
  },
  input: {
    borderWidth: 1,
    marginBottom: 10,
    padding: 2,
    borderRadius: 4,
  },
  
});

export default RegisterScreen;
