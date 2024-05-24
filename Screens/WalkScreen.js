import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import Icon from 'react-native-vector-icons/Ionicons';

export default function WalkScreen() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [coordinates, setCoordinates] = useState([]);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [totalDistance, setTotalDistance] = useState(0); // 누적 거리
  const [calories, setCalories] = useState(0);
  const [loading, setLoading] = useState(true); // 로딩 상태 추가
  const mapViewRef = useRef(null);
  const lastLocationRef = useRef(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setLoading(false); // 권한 거부 시 로딩 상태 해제
        return;
      }

      let initialLocation = await Location.getCurrentPositionAsync({});
      setLocation(initialLocation);
      lastLocationRef.current = initialLocation;
      setLoading(false); // 위치 가져온 후 로딩 상태 해제

      Location.watchPositionAsync({ distanceInterval: 1 }, (newLocation) => {
        if (isRunning) {
          setLocation(newLocation);
          setCoordinates(prevCoordinates => [
            ...prevCoordinates, 
            {
              latitude: newLocation.coords.latitude,
              longitude: newLocation.coords.longitude
            }
          ]);

          // 이전 위치와 새 위치 사이의 거리 계산
          const newDistance = calculateDistance(
            lastLocationRef.current.coords.latitude,
            lastLocationRef.current.coords.longitude,
            newLocation.coords.latitude,
            newLocation.coords.longitude
          );

          // 누적 거리 갱신
          setTotalDistance(prevDistance => prevDistance + newDistance);

          // 칼로리 계산 및 설정
          const newCalories = calculateCalories(totalDistance + newDistance);
          setCalories(newCalories);
          lastLocationRef.current = newLocation;
        }
      });
    })();
  }, [isRunning]);

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

  const calculateCalories = (distance) => {
    const caloriesBurnedPerMeter = 0.06;
    return distance * caloriesBurnedPerMeter;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>현재 위치를 가져오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          ref={mapViewRef}
          style={{ flex: 1 }}
          region={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          {location && <Marker coordinate={location.coords} title="Current Location" />}
          {coordinates.length > 0 && <Polyline coordinates={coordinates} strokeWidth={5} strokeColor="red" />}
        </MapView>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.bigText}>{formatTime(timer)}</Text>
        <Text style={styles.smallText}>산책시간</Text>
      </View>
      <View style={styles.statsContainer}>
        <View style={styles.statsValueContainer}>
          <Text style={styles.statsValue}>{totalDistance.toFixed(2)}</Text>
          <Text style={styles.smallText}>거리(meter)</Text>
        </View>
        <View style={styles.statsValueContainer}>
          <Text style={styles.statsValue}>{calories.toFixed(2)}</Text>
          <Text style={styles.smallText}>칼로리(kcal)</Text>
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.startButton} onPress={handleStartStop}>
          {isRunning ? (
            <Icon name="stop" size={30} color="#fff" />
          ) : (
            <Icon name="play" size={30} color="#fff" />
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.startButton}>
          <Icon name="stop" size={30} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  mapContainer: {
    flex: 4,
  },
  infoContainer: {
    backgroundColor: 'white',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
  },
  statsValueContainer: {
    alignItems: 'center',
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    flexDirection: 'row', 
    gap: 120,
  },
  bigText: {
    fontSize: 36,
    fontWeight: 'bold'
  },
  smallText: {
    color: 'gray',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statsValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  startButton: {
    backgroundColor: 'skyblue',
    borderRadius: 40,
    paddingHorizontal: 20,
    paddingVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});