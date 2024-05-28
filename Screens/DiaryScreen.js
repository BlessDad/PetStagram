import * as React from 'react';
import { Text, View, TouchableOpacity, Platform, FlatList, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import axios from 'axios';

const BASE_URL = 'http://3.35.26.234:8080';
//const BASE_URL = 'http://52.78.86.212:8080';

export default function DiaryScreen() {
  const [selectedDate, setSelectedDate] = React.useState('');
  const [walkings, setWalkings] = React.useState([]);
  const navigation = useNavigation(); 

  const onDayPress = async (day) => {
    setSelectedDate(day.dateString);
    console.log('Selected Date:', day.dateString); // 선택된 날짜를 콘솔에 출력
    fetchWalkings(day.dateString); // 선택된 날짜의 산책 정보를 가져오는 함수 호출
  };

  const handlePress = () => {
    navigation.navigate('WalkScreen');
  };

  const fetchWalkings = async (selectedDate) => {
    try {
      const response = await axios.get(`${BASE_URL}/walking/getWalking/between?startDateTime=${selectedDate}T00:00:00&endDateTime=${selectedDate}T23:59:59`);
      console.log(response.data);
      setWalkings(response.data); // 서버에서 받은 산책 정보 설정
    } catch (error) {
      console.error('Error fetching walkings:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.calendarContainer}>
        <Calendar
          onDayPress={onDayPress}
          markedDates={{
            [selectedDate]: { selected: true, selectedColor: 'red' },
          }}
        />
      </View>
      <FlatList
        data={walkings}
        renderItem={({ item }) => (
          <View style={styles.walkingItem}>
            <Text>Start Time: {item.walking_start}</Text>
            <Text>End Time: {item.walking_end}</Text>
            <Text>Distance: {item.walking_distance} meters</Text>
            <Text>Calories: {item.walking_calorie} kcal</Text>
            <Image style={styles.walkingImage}source={{uri: `${BASE_URL}${item.imageUrl}` }} />
            {console.log(BASE_URL+item.imageUrl)}
          </View> 
        )}
        keyExtractor={(item) => item.walking_id.toString()}
      />
      <TouchableOpacity 
        style={styles.addButton}
        onPress={handlePress}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  calendarContainer: {
    marginTop: 0,
    width: '100%',
  },
  walkingItem: {
    padding: 10,
  },
  addButton: {
    position: 'absolute', 
    bottom: 20, 
    right: 20, 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    backgroundColor: '#FFCC33', 
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  addButtonText: {
    color: 'black', 
    fontSize: 24,
  },
  walkingImage: {
    width: '100%',
    height: 500,
  }
});