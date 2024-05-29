import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Foundation } from '@expo/vector-icons';
import { useWindowDimensions } from 'react-native';

import HomeScreen from './Screens/HomeScreen';
import DiaryScreen from './Screens/DiaryScreen';
import PostScreen from './Screens/PostScreen';
import AccountScreen from './Screens/AccountScreen';
import MapScreen from './Screens/MapScreen';
import WalkScreen from './Screens/WalkScreen';
import PostDetailScreen from './Screens/PostDetailScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  const windowWidth = useWindowDimensions().width;
  const windowHeight = useWindowDimensions().height;

  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName;
          const iconSize = windowWidth * 0.08;
          const iconColor = focused ? 'black' : 'gray';

          if (route.name == 'Home'){
            iconName = <Ionicons name="home" size={iconSize} color={iconColor} />;
          }
          else if (route.name == 'Diary'){
            iconName = <Foundation name="guide-dog" size={iconSize} color={iconColor} />;
          }
          else if (route.name == 'Post'){
            iconName = <Ionicons name="add-outline" size={iconSize} color={iconColor} />;
          }
          else if (route.name == 'Map'){
            iconName = <Foundation name="map" size={iconSize} color={iconColor} />;
          }
          else if (route.name == 'Account'){
            iconName = <Ionicons name="person-circle-outline" size={iconSize} color={iconColor} />;
          }
          
          return iconName;
        },
        tabBarActiveTintColor: 'black',
        tabBarInactiveTintColor: 'gray',
        tabBarLabel: '', 
        tabBarStyle: {
          height: windowHeight * 0.08,
          paddingBottom: 10,
        },
        tabBarItemStyle: { justifyContent: 'center',},
        headerStyle: { backgroundColor: '#d2b48c',},
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 20,
        },
        headerTitleAlign: 'center',
        title: '멍스타그램',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options = {{unmountOnBlur: true}} />
      <Tab.Screen name="Diary" component={DiaryScreen} />
      <Tab.Screen name="Post" component={PostScreen} options = {{unmountOnBlur: true}}/>
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Account" component={AccountScreen} options = {{unmountOnBlur: true}}/>
    </Tab.Navigator>
  );
}

export default function App(){
  return(
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Account">
        <Stack.Screen name="Main" component={TabNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="WalkScreen" component={WalkScreen} options = {{
          title: '멍스타그램',
          headerStyle: {
            backgroundColor: '#d2b48c',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 20,
          },headerTitleAlign: 'center'
          }}/>
          <Stack.Screen name="PostDetail" component={PostDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}