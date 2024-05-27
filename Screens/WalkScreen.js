import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

//const BASE_URL = 'http://3.35.26.234:8080';
const BASE_URL = 'http://52.78.86.212:8080';

export default function WalkScreen() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [coordinates, setCoordinates] = useState([]);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [totalDistance, setTotalDistance] = useState(0); 
  const [calories, setCalories] = useState(0);
  const [loading, setLoading] = useState(true); 
  const mapViewRef = useRef(null);
  const lastLocationRef = useRef(null);
  const startTimeRef = useRef(null);

  const [startWalking, setStartWalking] = useState(null);
  const [endWalking, setEndWalking] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setLoading(false);
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
          const distance = totalDistance + newDistance;

          // 칼로리 계산 및 설정
          const newCalories = calculateCalories(distance);
          setCalories(newCalories);
          lastLocationRef.current = newLocation;
        }
      });
    })();
  }, [isRunning, totalDistance]);

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
    if (location && mapViewRef.current) {
      mapViewRef.current.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [location]);

  const handleStartStop = () => {
    if (!isRunning) {
      setStartWalking(new Date());
    }
    setIsRunning(prev => !prev);
  };

  const handleStop = async () => {
    const endWalkingTime = new Date();
    setEndWalking(endWalkingTime);

    if (startWalking && endWalkingTime) {
      const startYear = startWalking.getFullYear().toString();
      const startMonth = startWalking.getMonth() + 1;
      const startDate = startWalking.getDate();
      const startHour = startWalking.getHours();
      const startMinute = startWalking.getMinutes();
      const startSecond = startWalking.getSeconds();

      const DBStart = `${startYear}-${String(startMonth).padStart(2, '0')}-${String(startDate).padStart(2, '0')}T${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}:${String(startSecond).padStart(2, '0')}`;

      const endYear = endWalkingTime.getFullYear().toString();
      const endMonth = endWalkingTime.getMonth() + 1;
      const endDate = endWalkingTime.getDate();
      const endHour = endWalkingTime.getHours();
      const endMinute = endWalkingTime.getMinutes();
      const endSecond = endWalkingTime.getSeconds();

      const DBEnd = `${endYear}-${String(endMonth).padStart(2, '0')}-${String(endDate).padStart(2, '0')}T${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}:${String(endSecond).padStart(2, '0')}`;

      const walkDuration = (endWalkingTime - startWalking) / 1000; // Duration in seconds
      const hours = Math.floor(walkDuration / 3600);
      const minutes = Math.floor((walkDuration % 3600) / 60);
      const seconds = Math.floor(walkDuration % 60);

      const totalWalkingTime = seconds + minutes * 60 + hours * 60 * 60;

      console.log(`산책 정보:\n\n시작 시간: ${DBStart}\n종료 시간: ${DBEnd}\n거리: ${totalDistance.toFixed(2)} meters\n칼로리: ${calories.toFixed(2)} kcal\n산책 시간 : ${hours}시간 ${minutes}분 ${seconds}초 \n    산책 시간 (초) : ${totalWalkingTime}`);

      try {
        const userId = 2; // Replace with actual user id
        await axios.post(`${BASE_URL}/walking/insert/${userId}`, {
          walking_start: DBStart,
          walking_end: DBEnd,
          walking_distance: parseFloat(totalDistance.toFixed(2)),
          walking_calorie: parseInt(calories.toFixed(2)),
          walking_speed: parseFloat(totalDistance / totalWalkingTime),
        },
        {
          headers: {
            'Content-Type': 'application/json', // Content-Type 헤더를 JSON으로 설정
          },
        });
        console.log("Walk data saved successfully");
      } catch (error) {
        if (error.response) {
          console.error('Error adding walking: ', error); // 서버 응답이 있는 경우
        } else {
          console.error('Error adding walking: ', error); // 서버 응답이 없는 경우
        }
      }
    } else {
      console.warn("시작 시간 또는 종료 시간이 없습니다.");
    }

    if (mapViewRef.current) {
      const snapshot = await mapViewRef.current.takeSnapshot({
        width: 300,
        height: 300,
        region: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        format: 'png',
        quality: 0.8,
        result: 'file',
      });

      const assetDir = `${FileSystem.documentDirectory}assets`;
      await FileSystem.makeDirectoryAsync(assetDir, { intermediates: true });
      const fileName = `map_snapshot_${Date.now()}.png`;
      const fileUri = `${assetDir}/${fileName}`;
      await FileSystem.copyAsync({ from: snapshot, to: fileUri });

      // Save to Media Library
      await MediaLibrary.saveToLibraryAsync(fileUri);
    }
    setIsRunning(false);
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

  let text = 'Waiting...';
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location);
  }

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
          initialRegion={{
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
            <Icon name="pause" size={30} color="#fff" />
          ) : (
            <Icon name="play" size={30} color="#fff" />
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.startButton} onPress={handleStop}>
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
