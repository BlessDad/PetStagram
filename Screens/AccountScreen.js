import * as React from 'react';
import { Text, View, Image, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AccountScreen() {
  const images = [
    require('../assets/image1.jpg'),
    require('../assets/image2.jpg'),
    require('../assets/image3.jpg'),
    require('../assets/image4.jpg'),
    require('../assets/image5.jpg'),
  ];

  const renderImageRows = () => {
    const imageRows = [];
    let currentRow = [];

    images.forEach((image, index) => {
      currentRow.push(
        <Image
          key={index}
          style={styles.Image}
          source={image}
        />
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
    <ScrollView style={[{ backgroundColor: '#FFFFFF' },{flex:1}]}>
      <View style={styles.container}>
        <View style={styles.profileContainer}>
          <Image
            style={styles.profileImage}
            source={require('../assets/profile.jpg')}
          />
          <View style={styles.userInfo}>
            <View style={styles.statsContainer}>
              <Text style={styles.stats}>4</Text>
              <Text style={styles.stats}>100</Text>
              <Text style={styles.stats}>50</Text>
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
            이름: Tom {"\n"}
            나이: 3살 {"\n"}
            1년마다 무럭무럭 자르는 모습을 보여드리고 싶어요!
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
  Image: {
    width: '33%',
    height: 100,
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