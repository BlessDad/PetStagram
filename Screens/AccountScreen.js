import React, { useState, useEffect } from 'react';
import { Text, View, Image, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

const BASE_URL = 'http://3.35.26.234:8080';
//const BASE_URL = 'http://52.78.86.212:8080';

export default function AccountScreen({ navigation }) {
  const [images, setImages] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
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
    fetchUserData();
  }, []);

  useEffect(() => {
    console.log('회원 데이터 로드 성공');
    console.log(userData);
  }, [userData]);

  const userId = 3;

  const fetchUserData = async () => {
    try {
      const userResponse = await axios.get(`${BASE_URL}/user/getUser/${userId}`);
      const user = userResponse.data[0]; // 첫 번째 요소를 사용
      setUserData(user);

      const postsResponse = await axios.get(`${BASE_URL}/api/getPost`);
      const userPosts = postsResponse.data.filter(post => post.user_id === userId);
      setImages(userPosts); // 사용자 데이터에서 posts 배열을 추출하여 설정
    } catch (error) {
      console.error('Error loading user data: ', error);
    }
  };

  const handleImagePress = (image) => {
    navigation.navigate('PostDetail', {
      id: image.id,
      title: image.title,
      content: image.content,
      image_url: image.imageUrl,
    });
  };

  const renderImageRows = () => {
    const imageRows = [];
    let currentRow = [];
  
    images.forEach((image, index) => {
      const imageUrl = `${BASE_URL}${image.imageUrl}`;
      console.log(`Loading image: ${imageUrl}`);
  
      currentRow.push(
        <TouchableOpacity key={index} onPress={() => handleImagePress(image)} style={styles.touchable}>
          <Image
            style={styles.image}
            source={{ uri: imageUrl }}
            onLoad={() => console.log(`Image loaded: ${imageUrl}`)}
            onError={(error) => console.error(`Error loading image: ${imageUrl}`, error)}
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

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserData();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={[{ backgroundColor: '#FFFFFF' }, { flex: 1 }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.container}>
        <View style={styles.profileContainer}>
          <Image
            style={styles.profileImage}
            source={{ uri: `${BASE_URL}/userUploads/${userId}.jpg` }} 
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
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    padding: 20,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 20,
  },
  userInfo: {
    flexDirection: 'column',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    marginTop: -30,
  },
  stats: {
    fontSize: 20,
  },
  stats2Container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    marginTop: 0,
  },
  stats2: {
    fontSize: 14,
  },
  introContainer: {
    width: '100%',
    marginTop: 10,
  },
  introText: {
    fontSize: 14,
  },
  imageRow: {
    marginTop: 0,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    width: '100%',
    alignItems: 'center',
  },
  touchable: {
    width: '33%',
    height: 100,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  emptyImage: {
    flex: 1,
  },
  segment: {
    flexDirection: 'column',
    alignItems: 'center',
    marginRight: -5,
  },
  pictureContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});