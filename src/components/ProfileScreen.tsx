import React, { useContext } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { AppContext } from '../context/AppContext';

const ProfileScreen = () => {
  const { setUser, user } = useContext(AppContext);

  const handleLogout = () => {
    setUser(null); // Kullanıcıyı sil → Login ekranına dön
  };

  // ❗ user null olabilir, önce kontrol et
  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Kullanıcı bulunamadı</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>👤 Profil</Text>
      <Text>Ad: {user.name}</Text>
      <Text>ID: {user.id}</Text>
      <Button title="Çıkış Yap" onPress={handleLogout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
  },
  header: {
    fontSize: 24, fontWeight: 'bold', marginBottom: 10,
  },
});

export default ProfileScreen;
