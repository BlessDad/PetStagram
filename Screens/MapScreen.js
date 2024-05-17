import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

export default function MapScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [currentRegion, setCurrentRegion] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setCurrentRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    })();
  }, []);

  const styles = {
    mapContainer: {
      flex: 1,
    },
    searchContainer: {
      padding: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'absolute',
      top: 10,
      left: 5,
      right: 5,
      zIndex: 1,
      backgroundColor: 'white',
      borderRadius: 30,
    },
    searchButtonContainer: {
      flex: 1, 
      marginRight: 5,
      borderRadius: 30,
    },
    selectedPlaceContainer: {
      padding: 8,
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'white',
      zIndex: 1,
    },
    resultListContainer: {
      position: 'absolute',
      padding: 8,
      bottom: 0,
      left: 0,
      right: 0,
      maxHeight: '40%',
      backgroundColor: 'white',
      zIndex: 1,
    },
    lineContainer : {
      height: 1,
      backgroundColor: 'lightgray',
      marginVertical: 8,
    },
  };
  const handleSearch = async () => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${searchQuery}&key=AIzaSyAUjFOO3b2JNaZ4M8hQP0Ke_xtbzMgK-W8`
      );
      const data = await response.json();
      // console.log('API 응답 데이터:', data); 
      setSearchResults(data.results);
    } catch (error) {
      console.error('Error searching for places:', error);
    }
  };

  return (
    <View style={styles.mapContainer}>

      {/* 지도 표시 */}
      <MapView
        style={styles.mapContainer}
        initialRegion={currentRegion}
      >
        {searchResults.map(place => (
          <Marker
            key={place.place_id}
            coordinate={{
              latitude: place.geometry.location.lat,
              longitude: place.geometry.location.lng,
            }}
            title={place.name}
            description={place.formatted_address}
            onPress={() => setSelectedPlace(place)}
          />
        ))}
      </MapView>
      
      {/* 검색 필드와 버튼 */}
      <View style={styles.searchContainer}>
      <TextInput
        style={styles.searchButtonContainer}
        placeholder="여기서 검색"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <Button title="Search" onPress={handleSearch} />
    </View>

     {/* 선택된 장소 정보 표시 */}
     {selectedPlace && (
       <View style={styles.selectedPlaceContainer}>
         <Text>{selectedPlace.name}</Text>
         <Text>{selectedPlace.formatted_address}</Text>
       </View>
     )}

     {/* 목록 표시 */}
     <FlatList
       data={searchResults}
       renderItem={({ item }) => (
         <View style={styles.listItemStyle}>
           <Text>{item.name}</Text>
           <Text>{item.formatted_address}</Text>
         </View>
       )}
       keyExtractor={item => item.place_id}
       style={styles.resultListContainer}
       ItemSeparatorComponent={() => (
        <View style={styles.lineContainer} />
      )}
     />
   </View>
  );
}