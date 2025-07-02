import React, { useContext, useState, useEffect } from 'react';
import { View, Text, Button, Alert, StyleSheet, FlatList } from 'react-native';
import { AppContext, Card } from '../context/AppContext';
import { loadBalance, makePayment } from '../api/api';
import axios from 'axios';

const WalletScreen = () => {
  const { user, balance, setBalance, cardInfo, setCardInfo } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);

  // Kullanıcı kartlarını yükleme efekti
  useEffect(() => {
    if (user?.id) {
      fetchUserCards();
    }
  }, [user?.id]);

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Kullanıcı bilgisi yok. Lütfen tekrar giriş yapın.</Text>
      </View>
    );
  }

  interface ApiResponse {
    success: boolean;
    card?: Card;
    message?: string;
    cards?: Card[];
  }
 // Sadece balance yükleme yanıtı için spesifik bir arayüz
interface ApiResponseBalance {
  success: boolean;
  newBalance: number;
  message?: string;
}
  // Kullanıcının kartlarını getirme fonksiyonu
  const fetchUserCards = async () => {
    try {
      setLoading(true);
      const res = await axios.post<ApiResponse>('http://192.168.1.110:3000/api/getCards', {
        userId: user.id // Backend'in beklediği parametre adı
      });

      if (res.data.success && res.data.cards) {
        setCards(res.data.cards);
        // Eğer aktif bir kart yoksa, ilk kartı aktif olarak ayarla
        if (!cardInfo && res.data.cards.length > 0) {
          setCardInfo(res.data.cards[0]);
        }
      }
    } catch (err) {
      console.error('Kartlar yüklenirken hata:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCard = async () => {
  try {
    if (!user?.id) {
      throw new Error("Kullanıcı bilgisi eksik");
    }

    const res = await axios.post<ApiResponse>('http://192.168.1.110:3000/api/createCard', {
      userId: user.id // user.name değil, user.id kullanıyoruz
    });

    if (!res.data.success) {
      throw new Error(res.data.message || 'Kart oluşturulamadı');
    }

    // Kart bilgisinin geldiğinden emin ol
    if (!res.data.card) {
      throw new Error('Kart bilgisi alınamadı');
    }

    // State güncelleme
    setCards(prev => [res.data.card as Card, ...prev]);
    Alert.alert('Başarılı', 'Kart oluşturuldu');
    
  } catch (err: unknown) {
    let errorMessage = 'Kart oluşturulamadı';
    
    // Hata tipini kontrol et
    if (axios.isAxiosError(err)) {
      // Axios hatası
      errorMessage += `: ${err.response?.data?.detail || err.message}`;
    } else if (err instanceof Error) {
      // Genel hata
      errorMessage += `: ${err.message}`;
    } else {
      // Bilinmeyen hata
      errorMessage += ': Bilinmeyen hata türü';
    }
    
    Alert.alert('Hata', errorMessage);
    console.error('Kart oluşturma hatası:', err);
  }
};
  // WalletScreen.tsx içinde
const handleLoadBalance = async () => {
    // 1. Kart seçili mi kontrol et
    if (!cardInfo) {
      Alert.alert('Uyarı', 'Lütfen bakiye yüklemek için bir kart seçin.');
      return;
    }

    // 2. Kullanıcı ID'sinin mevcut olduğundan emin ol
    if (!user?.id) {
        Alert.alert('Hata', 'Kullanıcı bilgisi eksik. Lütfen yeniden giriş yapın.');
        return;
    }

    const amountToLoad = 100; // Yüklenecek sabit miktar (isterseniz dinamik yapabilirsiniz)

    try {
      setLoading(true);
      // Backend'e atılacak POST isteği, istediğiniz JSON formatında
      const res = await axios.post<ApiResponseBalance>(
        'http://192.168.1.110:3000/api/loadBalance',
        {
          userId: user.id,          // AppContext'ten gelen dinamik kullanıcı ID'si
          amount: amountToLoad,     // Belirlenen miktar
          cardToken: cardInfo.token // Seçili kartın dinamik token'ı
        }
      );

      // Yanıtın başarı durumunu kontrol et
      if (res.data.success) {
        setBalance(res.data.newBalance); // Global bakiye state'ini güncelle
        Alert.alert('Bakiye Yüklendi', `Yeni Bakiye: ${res.data.newBalance} TL`);
        fetchUserCards(); // Kart listesini ve bakiyeleri güncel verilerle yeniden çek
      } else {
        // Backend'den hata mesajı gelirse onu göster
        Alert.alert('Hata', res.data.message || 'Bakiye yüklenemedi.');
      }
    } catch (err) {
      let errorMessage = 'Bakiye yüklenirken beklenmeyen bir hata oluştu.';
      if (axios.isAxiosError(err)) {
        errorMessage = `Bakiye yüklenirken hata oluştu: ${err.response?.data?.message || err.message || err.response?.statusText}`;
      } else if (err instanceof Error) {
        errorMessage = `Bakiye yüklenirken hata oluştu: ${err.message}`;
      }
      Alert.alert('Hata', errorMessage);
      console.error('Bakiye yükleme hatası:', err);
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
      //Alert.alert('Hata', 'Ödeme başarısız: ' + (err?.message || JSON.stringify(err)));
    } finally {
      setLoading(false);
    }
  };

  // Kart seçme fonksiyonu
  const selectCard = (card: Card) => {
    setCardInfo(card);
  };

  // Kart listesi öğesi render fonksiyonu
  const renderCardItem = ({ item }: { item: Card }) => (
    <View 
      style={[
        styles.cardItem,
        cardInfo?.token === item.token && styles.selectedCardItem
      ]}
    >
      <Text style={styles.cardText}>{item.masked_pan}</Text>
      <Text style={styles.cardText}>Bakiye: {item.balance} ₺</Text>
      <Text style={styles.cardText}>
        Oluşturulma: {new Date(item.created_at).toLocaleDateString()}
      </Text>
      <Button 
        title="Seç" 
        onPress={() => selectCard(item)} 
        disabled={cardInfo?.token === item.token}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Hoş Geldin, {user.name}</Text>
      <Text style={styles.balance}>Bakiye: {balance} TL</Text>

      {cardInfo && (
        <Text style={styles.cardInfo}>Aktif Kart: {cardInfo.masked_pan}</Text>
      )}

      <View style={styles.buttonGroup}>
        <Button title="💳 Sanal Kart Oluştur" onPress={handleCreateCard} disabled={loading} />
        <Button title="➕ 100 TL Yükle" onPress={handleLoadBalance} disabled={loading} />
        <Button title="💸 50 TL Öde" onPress={handlePayment} disabled={loading || !cardInfo} />
      </View>

      <Text style={styles.cardListTitle}>Kartlarım</Text>
      <FlatList
        data={cards}
        renderItem={renderCardItem}
        keyExtractor={(item) => item.token}
        contentContainerStyle={styles.cardList}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Henüz kartınız bulunmamaktadır.</Text>
          
        }
      />
      <Button title="Kartları Elle Getir" onPress={fetchUserCards} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f2f2f2',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  balance: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  cardInfo: {
    fontSize: 16,
    marginBottom: 20,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  buttonGroup: {
    width: '100%',
    gap: 10,
    marginBottom: 20,
  },
  cardListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  cardList: {
    paddingBottom: 20,
  },
  cardItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedCardItem: {
    borderColor: 'blue',
    backgroundColor: '#e6f2ff',
  },
  cardText: {
    fontSize: 16,
    marginBottom: 5,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  },
});

export default WalletScreen;