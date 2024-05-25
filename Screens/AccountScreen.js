import React, { useState, useEffect } from 'react';
import { Text, View, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

const BASE_URL = 'http://172.30.1.54:8080';

export default function AccountScreen({ navigation }) {
  const [images, setImages] = useState([]);

  const [userData, setUserData] = useState({
    user_nickname: '',
    pet_name: '',
    pet_age: 0,
    user_introduce: '',
    user_follower_count: 0,
    user_following_count: 0,
    user_post_count: 0,
  });

  useEffect(() => {
    fetchImages();
    fetchUserData();
  }, []);

  useEffect(() => {
    console.log('회원 데이터 로드 성공');
    console.log(userData);
  }, [userData]);

  const fetchImages = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/getPost`);
      setImages(response.data);
    } catch (error) {
      console.error('Error loading images: ', error);
    }
  };

  const fetchUserData = async () => {
    try {
      const userId = 1; // 임의로 설정한 userId
      const response = await axios.get(`${BASE_URL}/user/getUser/${userId}`);
      const user = response.data[0]; // 첫 번째 요소를 사용
      setUserData(user);
    } catch (error) {
      console.error('Error loading user data: ', error);
    }
  };

  const handleImagePress = (image) => {
    navigation.navigate('PostDetail', {
      id: image.id,
      title: image.title,
      content: image.content,
      image_url: image.image_url,
    });
  };

  const renderImageRows = () => {
    const imageRows = [];
    let currentRow = [];

    images.forEach((image, index) => {
      currentRow.push(
        <TouchableOpacity key={index} onPress={() => handleImagePress(image)} style={styles.touchable}>
          <Image
            style={styles.image}
            source={{ uri: image.image_url }}
          />
        </TouchableOpacity>
      );
      if (currentRow.length === 3 || index === images.length - 1) {
        const remainingSpaces = 3 - currentRow.length;
        for (let i = 0; i < remainingSpaces; i++) {
          currentRow.push(<View key={`empty${i}`} style={styles.emptyImage} />);
        }
        imageRows.push(
          <View key={index} style={styles.imageRow}>
            {currentRow}
          </View>
        );
        currentRow = [];
      }
    });

    return imageRows;
  };

  return (
    <ScrollView style={[{ backgroundColor: '#FFFFFF' }, { flex: 1 }]}>
      <View style={styles.container}>
        <View style={styles.profileContainer}>
          <Image
            style={styles.profileImage}
            source={require('../assets/profile.jpg')}
          />
          <View style={styles.userInfo}>
            <View style={styles.statsContainer}>
              <Text style={styles.stats}>{userData.user_post_count}</Text>
              <Text style={styles.stats}>{userData.user_follower_count}</Text>
              <Text style={styles.stats}>{userData.user_following_count}</Text>
            </View>
            <View style={styles.stats2Container}>
              <Text style={styles.stats2}>게시물</Text>
              <Text style={styles.stats2}>팔로워</Text>
              <Text style={styles.stats2}>팔로잉</Text>
            </View>
          </View>
        </View>
        <View style={styles.introContainer}>
          <Text style={styles.introText}>
            이름: {userData.pet_name} {"\n"}
            나이: {userData.pet_age}살 {"\n"}
            소개: {userData.user_introduce}
          </Text>
        </View>
      </View>
      <View style={styles.segment}>
        <Ionicons name="grid-outline" size={25} color="black" />
        <View style={styles.pictureContainer}>
          {renderImageRows()}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stats: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  stats2Container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 4,
  },
  stats2: {
    fontSize: 12,
    color: 'gray',
  },
  introContainer: {
    marginBottom: 16,
  },
  introText: {
    fontSize: 16,
    lineHeight: 24,
  },
  segment: {
    marginBottom: 16,
  },
  pictureContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  imageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  touchable: {
    flex: 1,
    marginHorizontal: 4,
  },
  image: {
    width: 100,
    height: 100,
  },
  emptyImage: {
    width: 100,
    height: 100,
    marginHorizontal: 4,
    backgroundColor: '#e1e4e8',
  },
});
