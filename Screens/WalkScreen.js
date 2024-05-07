import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';

export default function WalkScreen() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [coordinates, setCoordinates] = useState([]);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [distance, setDistance] = useState(0);
  const [pace, setPace] = useState(0);
  const [calories, setCalories] = useState(0);
  const mapViewRef = useRef(null); // mapViewRef 생성
  const lastLocationRef = useRef(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      lastLocationRef.current = location;

      // 실시간 위치 업데이트를 위한 구독
      Location.watchPositionAsync({ distanceInterval: 10 }, (newLocation) => {
        if (isRunning) {
          setLocation(newLocation);
          setCoordinates(prevCoordinates => [...prevCoordinates, {
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude
          }]);

          // 이동 거리, 칼로리, 페이스 계산
          const newDistance = distance + calculateDistance(lastLocationRef.current.coords.latitude, lastLocationRef.current.coords.longitude, newLocation.coords.latitude, newLocation.coords.longitude);
          const newPace = calculatePace(newDistance, timer);
          const newCalories = calculateCalories(newDistance);

          setDistance(newDistance);
          setPace(newPace);
          setCalories(newCalories);

          lastLocationRef.current = newLocation;
        }
      });
    })();
  }, []);

  useEffect(() => {
    let intervalId;
    if (isRunning) {
      intervalId = setInterval(() => {
        setTimer(prevTimer => prevTimer + 1);
      }, 1000);
    } else {
      clearInterval(intervalId);
    }

    return () => clearInterval(intervalId);
  }, [isRunning]);

  useEffect(() => {
    if (location) {
      mapViewRef.current.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [location]);

  const handleStartStop = () => {
    setIsRunning(prev => !prev);
  };

  const formatTime = (time) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    return `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const d = R * c;
    return d;
  };

  const calculatePace = (distance, time) => {
    if (distance === 0 || time === 0) return 0;
    const paceInSeconds = time / distance;
    const paceInMinutes = paceInSeconds / 60;
    return paceInMinutes;
  };

  const calculateCalories = (distance) => {
    // Simple formula for calorie calculation
    // Assuming 0.06 calories burned per meter
    const caloriesBurnedPerMeter = 0.06;
    return distance * caloriesBurnedPerMeter;
  };

  let text = 'Waiting...';
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location);
  }

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          ref={mapViewRef} // mapViewRef 연결
          style={{ flex: 1 }}
          initialRegion={{
            latitude: location ? location.coords.latitude : 37.78825,
            longitude: location ? location.coords.longitude : -122.4324,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {location && <Marker coordinate={location.coords} title="Current Location" />}
          {coordinates.length > 0 && <Polyline coordinates={coordinates} strokeWidth={5} strokeColor="red" />}
        </MapView>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>Distance: {distance.toFixed(2)} meters</Text>
        <Text style={styles.infoText}>Calories: {calories.toFixed(2)}</Text>
        <Text style={styles.infoText}>Pace: {pace.toFixed(2)} minutes/km</Text>
      </View>
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatTime(timer)}</Text>
      </View>
      <View style={styles.buttonContainer}>
        <Button title={isRunning ? "Stop" : "Start"} onPress={handleStartStop} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  mapContainer: {
    flex: 4,
  },
  infoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    fontSize: 16,
  },
  timerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 24,
  },
  buttonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});