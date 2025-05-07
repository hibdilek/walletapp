import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppContext } from '../context/AppContext';

const ProfileScreen = () => {
  const { user } = useContext(AppContext);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>👤 Profil</Text>
      <Text>Ad: {user.name}</Text>
      <Text>ID: {user.id}</Text>
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
