import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';

//const BASE_URL = 'http://3.35.26.234:8080';
const BASE_URL = 'http://52.78.86.212:8080';

export default function MapScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [currentRegion, setCurrentRegion] = useState(null);
  const [favoritedPlaces, setFavoritedPlaces] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [loading, setLoading] = useState(true);

  // 현재 위치 정보 나타내기
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
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      setLoading(false);
    })();
  }, []);

  // 즐겨찾기에 추가하기
  const addToFavorites = async (placeId) => {
    try {
      const userId = 1;
      // 장소 세부 정보 가져오기
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number&key=AIzaSyAUjFOO3b2JNaZ4M8hQP0Ke_xtbzMgK-W8`
      );
      const data = await response.json();
      const placeDetails = data.result;

      // 가져온 장소 세부 정보를 즐겨찾기에 추가
      setFavoritedPlaces(prevState => [...prevState, placeDetails]);

      // DB 삽입
      const DBResponse = await axios.post(`${BASE_URL}/bookmark/insert/${userId}`, {
        bookmark_address : placeDetails.formatted_address,
        bookmark_name : placeDetails.name
      });

      // 추가된 장소 확인
      console.log('즐겨찾기에 추가된 장소:', placeDetails);
    } catch (error) {
      console.error('Error adding to favorites:', error);
    }
  };

  // 즐겨찾기 목록 렌더링
  const FavoritedPlaces = () => {
    const [favoritedPlaces, setFavoritedPlaces] = useState([]);
  
    useEffect(() => {
      // userId를 1로 설정
      const userId = 1;
      
      // API 호출
      axios.get(`${BASE_URL}/bookmark/getBookmark/${userId}`)
        .then(response => {
          setFavoritedPlaces(response.data);
        })
        .catch(error => {
          console.error('Error fetching favorited places:', error);
        });
    }, []);
  
    return (
      <FlatList
        data={favoritedPlaces}
        renderItem={({ item }) => (
          <View style={styles.listItemStyle}>
            <Text>{item.bookmark_name}</Text>
            <Text>{item.bookmark_address}</Text>
          </View>
        )}
        keyExtractor={item => item.bookmark_id.toString()}
        style={styles.resultListContainer}
        ItemSeparatorComponent={() => (
          <View style={styles.lineContainer} />
        )}
      />
    );
  };

  // 즐겨찾기 목록 표시 여부를 토글하는 함수
  const toggleFavorites = () => {
    setShowFavorites(prevState => !prevState);
  };

  // 즐겨찾기 목록 삭제
  const removeFromFavorites = (placeId) => {
    // 삭제할 항목의 인덱스 찾기
    const index = favoritedPlaces.findIndex(item => item.place_id === placeId);
    if (index !== -1) {
      // favoritedPlaces 배열에서 해당 항목 제거
      const updatedFavorites = [...favoritedPlaces];
      updatedFavorites.splice(index, 1);
      // 상태 업데이트
      setFavoritedPlaces(updatedFavorites);
    }
  };

  const styles = {
    mapContainer: {
      flex: 1,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      position: 'absolute',
      top: 10,
      left: 5,
      right: 5,
      zIndex: 1,
    },
    searchFieldContainer: {
      borderRadius: 30,
      borderWidth: 1,
      borderColor: 'lightgray',
      backgroundColor: 'white',
      flex: 1,
      marginRight: 10,
      paddingVertical: 8,
      paddingHorizontal: 10,
    },
    searchField: {
      paddingVertical: 8,
      paddingHorizontal: 10,
      flex: 1,
    },
    searchButtonContainer: {
      borderRadius: 40,
      borderWidth: 2,
      borderColor: 'lightblue',
      overflow: 'hidden',
      backgroundColor: 'white',
      padding: 10,
      alignItems: 'center', 
      justifyContent: 'center',
      marginRight: 10,
    },
    searchButtonImage: {
      width: 30,
      height: 30,
    },
    favoritesButtonContainer: {
      borderRadius: 40,
      borderWidth: 2,
      borderColor: 'pink',
      overflow: 'hidden',
      backgroundColor: 'white',
      padding: 10,
      alignItems: 'center', 
      justifyContent: 'center',
    },
    favoritesButtonImage: {
      width: 30,
      height: 30,
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
    favoritesresultListContainer: {
      position: 'absolute',
      padding: 8,
      bottom: 0,
      top: 70,
      left: 0,
      right: 0,
      backgroundColor: 'mistyrose',
      zIndex: 1,
    },
    lineContainer : {
      height: 1,
      backgroundColor: 'lightgray',
      marginVertical: 8,
    },
    listItemStyle: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    placeInfo: {
      flex: 1,
    },
    favoriteButton: {
      width: 30,
      height: 30,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  }

  // 장소를 검색하고 검색 결과를 업데이트
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>현재 위치를 가져오는 중...</Text>
      </View>
    );
  }

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
            //onPress={() => addToFavorites(place.place_id)}
          />
        ))}
      </MapView>
      
      {/* 검색 필드와 버튼 */}
      <View style={styles.searchContainer}>
        <View style={styles.searchFieldContainer}>
          <TextInput
            style={styles.searchField}
            placeholder="여기서 검색"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <View style={styles.searchButtonContainer}>
          <TouchableOpacity onPress={handleSearch}>
            <Image source={require('../assets/search.png')} style={styles.searchButtonImage} />
          </TouchableOpacity>
        </View>
        
        {/* 상단에 즐겨찾기 목록 버튼 */}
        <TouchableOpacity style={styles.favoritesButtonContainer} onPress={toggleFavorites}>
          <Image source={require('../assets/home_like.png')} style={styles.favoritesButtonImage} />
        </TouchableOpacity>
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
            <View style={styles.placeInfo}>
              <Text>{item.name}</Text>
              <Text>{item.formatted_address}</Text>
            </View>
            <TouchableOpacity onPress={() => {
              addToFavorites(item.place_id);
              setSearchResults(prevState => prevState.filter(place => place.place_id !== item.place_id));
              }}>
              <Image source={require('../assets/home_like.png')} style={styles.favoriteButton} />
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={item => item.place_id}
        style={styles.resultListContainer}
        ItemSeparatorComponent={() => (
          <View style={styles.lineContainer} />
        )}
      />
      
      {/* 즐겨찾기 목록 표시 */}
      {showFavorites && (
        <FlatList
          data={favoritedPlaces}
          renderItem={({ item }) => (
            <View style={styles.listItemStyle}>
              <View style={styles.placeInfo} key={item.place_id}>
                <Text>{item.name}</Text>
                <Text>{item.formatted_address}</Text>
                <Text>{item.formatted_phone_number}</Text>
              </View>
              <TouchableOpacity onPress={() => removeFromFavorites(item.place_id)}>
                <Text>삭제</Text>
              </TouchableOpacity>
            </View>
          )}
          //keyExtractor={item => item.place_id}
          keyExtractor={(item, index) => index.toString()}
          style={styles.favoritesresultListContainer}
          ItemSeparatorComponent={() => (
            <View style={styles.lineContainer} />
          )}
        />
      )}
    </View>
  );
}
