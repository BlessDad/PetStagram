import * as React from 'react';
import { Text, TextInput, View, Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Foundation } from '@expo/vector-icons';

import HomeScreen from './Screens/HomeScreen';
import DiaryScreen from './Screens/DiaryScreen';
import PostScreen from './Screens/PostScreen';
import AccountScreen from './Screens/AccountScreen';
import MapScreen from './Screens/MapScreen';
import WalkScreen from './Screens/WalkScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName;

          if (route.name == 'Home'){
            iconName = focused
            ? 'home' 
            : 'home';
          }
          else if (route.name == 'Diary'){
            return <Foundation name = {'guide-dog'} size = {36} color = {focused? 'black' : 'gray'}/>
          }
          else if (route.name == 'Post'){
            iconName = focused? 'add-outline' : 'add-outline';
          }
          else if (route.name == 'Map'){
            return <Foundation name = {'map'} size = {32} color = {focused? 'black' : 'gray'}/>
          }
          else if (route.name == 'Account'){
            return <Ionicons name = {'person-circle-outline'} size = {36} color = {focused? 'black' : 'gray'}/>
          }
          
          return <Ionicons name = {iconName} size = {size} color = {color}/>;
        },
        tabBarActiveTintColor: 'black',
        tabBarInactiveTintColor: 'gray',
        tabBarLabel: '', 
        tabBarStyle: {height: 60},
        tabBarActiveBackgroundColor: '#f2f2f2'
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options = {{
          title: '멍스타그램',
          headerStyle: {
            backgroundColor: '#d2b48c',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 20,
          },
          headerTitleAlign: 'center'
          }} />
      <Tab.Screen name="Diary" component={DiaryScreen} options = {{
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
      <Tab.Screen name="Post" component={PostScreen} options = {{
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
      <Tab.Screen name="Map" component={MapScreen} options = {{
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
      <Tab.Screen name="Account" component={AccountScreen} options = {{
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
    </Tab.Navigator>
  );
}

export default function App(){
  return(
    <NavigationContainer>
      <Stack.Navigator>
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}