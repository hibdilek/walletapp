import React, { useContext, useState } from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import { AppContext } from '../context/AppContext';
import { createCard, loadBalance, makePayment } from '../api/api';

const WalletScreen = () => {
  const { user, balance, setBalance, cardInfo, setCardInfo } = useContext(AppContext);
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Kullanıcı bilgisi yok. Lütfen tekrar giriş yapın.</Text>
      </View>
    );
  }

  const handleCreateCard = async () => {
    try {
      setLoading(true);
      const res = await createCard(user.id);
      setCardInfo(res.data.card);
      Alert.alert('Kart Oluşturuldu', `Kart: ${res.data.card.maskedPan}`);
    } catch (err) {
      Alert.alert('Hata', 'Kart oluşturulamadı: ' + (err?.message || JSON.stringify(err)));
    } finally {
      setLoading(false);
    }
  };

  const handleLoadBalance = async () => {
    try {
      setLoading(true);
      const res = await loadBalance(user.id, 100);
      setBalance(res.data.newBalance);
      Alert.alert('Bakiye Yüklendi', `Yeni Bakiye: ${res.data.newBalance} TL`);
    } catch (err) {
      Alert.alert('Hata', 'Bakiye yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!cardInfo) return;
    try {
      setLoading(true);
      const res = await makePayment(user.id, cardInfo.token, 50);
      if (res.data.success) {
        setBalance(res.data.newBalance);
        Alert.alert('Ödeme Başarılı', `Yeni Bakiye: ${res.data.newBalance} TL`);
      } else {
        Alert.alert('Ödeme Reddedildi');
      }
    } catch (err) {
      Alert.alert('Hata', 'Ödeme başarısız: ' + (err?.message || JSON.stringify(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Hoş Geldin, {user.name}</Text>
      <Text style={styles.balance}>Bakiye: {balance} TL</Text>

      {cardInfo && (
        <Text style={styles.cardInfo}>Kart: {cardInfo.maskedPan}</Text>
      )}

      <View style={styles.buttonGroup}>
        <Button title="💳 Sanal Kart Oluştur" onPress={handleCreateCard} disabled={loading} />
        <Button title="➕ 100 TL Yükle" onPress={handleLoadBalance} disabled={loading} />
        <Button title="💸 50 TL Öde" onPress={handlePayment} disabled={loading || !cardInfo} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f2f2f2',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  balance: {
    fontSize: 18,
    marginBottom: 10,
  },
  cardInfo: {
    fontSize: 16,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  buttonGroup: {
    width: '100%',
    gap: 10,
  },
});

export default WalletScreen;
