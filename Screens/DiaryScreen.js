import * as React from 'react';
import { Text, View, TouchableOpacity, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';

export default function DiaryScreen(){
    const [selectedDate, setSelectedDate] = React.useState('');
    const navigation = useNavigation(); 

    const onDayPress = (day) => {
      setSelectedDate(day.dateString);
    };

    const handlePress = () => {
      navigation.navigate('WalkScreen');
    };

    return (
      <View style = {{flex:1, justifyContent: 'flex-start', alignItems: 'center',backgroundColor: 'white'}}>
        <View style={{marginTop: 0}}>
        </View>
        <View style={{marginTop: 0, width: '100%'}}>
          <Calendar
            onDayPress={onDayPress}
            markedDates={{
              [selectedDate]: { selected: true, selectedColor: 'red' },
            }}
          />
        </View>
        <TouchableOpacity 
          style={{
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
          }}
          onPress={handlePress}
        >
          <Text style={{color: 'black', fontSize: 24}}>+</Text>
        </TouchableOpacity>
      </View>
    );
}