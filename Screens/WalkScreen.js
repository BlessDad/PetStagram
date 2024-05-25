import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import Icon from 'react-native-vector-icons/Ionicons';

export default function WalkScreen() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [coordinates, setCoordinates] = useState([]);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [totalDistance, setTotalDistance] = useState(0);
  const [calories, setCalories] = useState(0);
  const mapViewRef = useRef(null);
  const lastLocationRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let initialLocation = await Location.getCurrentPositionAsync({});
      setLocation(initialLocation);
      lastLocationRef.current = initialLocation;

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

          const newDistance = calculateDistance(
            lastLocationRef.current.coords.latitude,
            lastLocationRef.current.coords.longitude,
            newLocation.coords.latitude,
            newLocation.coords.longitude
          );

          setTotalDistance(prevDistance => prevDistance + newDistance);
          const distance = totalDistance + newDistance;
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
    setIsRunning(prev => !prev);
  };

  const handleStop = async () => {
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
  };

  const formatTime = (time) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    return `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
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

  const calculateCalories = (distance) => { const caloriesBurnedPerMeter = 0.06;
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
          ref={mapViewRef}
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
});