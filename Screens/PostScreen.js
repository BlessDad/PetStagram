import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, Image, TouchableOpacity, StyleSheet, Alert, Dimensions } from 'react-native';
import axios from 'axios';
import FormData from 'form-data';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { fetch, decodeJpeg } from '@tensorflow/tfjs-react-native';
import * as mobilenet from '@tensorflow-models/mobilenet';
import * as tf from '@tensorflow/tfjs';
import * as ImageManipulator from 'expo-image-manipulator';

const { width } = Dimensions.get('window');

const BASE_URL = 'http://3.35.26.234:8080';
//const BASE_URL = 'http://52.78.86.212:8080';

export default function App() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageURI, setImageURI] = useState(null);
  const [model, setModel] = useState(null);
  const [image, setImage] = useState(null);
  const [classification, setClassification] = useState('');
  const [breed, setBreed] = useState('');

  useEffect(() => {
    async function loadModel() {
      try {
        await tf.ready();
        const model = await mobilenet.load();
        setModel(model);
      } catch (error) {
        console.log(error);
      }
    }
    loadModel();
  }, []);

  const classifyImage = async () => {
    try {
      if(!model) console.log('model is loading...');
      const response = await fetch(image, {}, { isBinary: true });
      const imageData = await response.arrayBuffer();
      const imageTensor = decodeJpeg(new Uint8Array(imageData));
      const predictions = await model.classify(imageTensor);
      setClassification(predictions[0].className);
      setClassification(predictions[0].className.charAt(0).toUpperCase() + predictions[0].className.slice(1));
      console.log(predictions);
    } catch (error) {
      console.log(error);
    }
  };

  const pickImage = async (setImageCallback) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.
      Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
  
    if (!result.cancelled && result.assets.length > 0 && result.assets[0].uri) {
      setImageCallback(result.assets[0].uri);
      setImageURI(result.assets[0].uri);

      const manipResult = await ImageManipulator.manipulateAsync(
        result.assets[0].uri, 
        [{resize: {width: 224, height: 224}}],
        {compress: 1, format: ImageManipulator.SaveFormat.JPEG}
      );
      setImage(manipResult.uri);
    }
  };

  const uploadImage = async (uri, fileName) => {
    const formData = new FormData();
    formData.append('image', {
      uri,
      type: 'image/jpeg', 
      name: fileName,
    });
    
    try {
      const response = await axios.post(`${BASE_URL}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Uploaded Image Uri (1): ' + response.data); // 서버 응답 로그 출력
      //return response.data.imageUrl;
      return response.data;
    } catch (error) {
      console.error('Image upload failed: ', error);
      return null;
    }
  };

  

  const handleAddPost = async () => {
    const userId = 5; // 가정한 사용자 ID
    if (title.trim() !== '' && content.trim() !== '') {
      let imageUrl = null;
      if (imageURI) {
        const fileName = `${title.replace(/\s+/g, '_')}.jpg`; 
        imageUrl = await uploadImage(imageURI, fileName);
        console.log('Image URL:', imageURI); // 이미지 URL 로그 출력
      }
      try {
        const response = await axios.post(`${BASE_URL}/api/insert/${userId}`, {
          title: title,
          content: content,
          imageUrl: imageUrl, // 이미지 URL을 포함하여 요청 전송
        });

        const postId = response.data;
        console.log("post_id : " + postId + ", user_id : " + userId);
        await axios.post(`${BASE_URL}/tag/insert/${postId}`, {
          tag_name : classification,
          post_id : userId
        });

        setTitle('');
        setContent('');
        setBreed('');
        setClassification('');
        setImageURI(null);
        Alert.alert('게시물 추가 성공', '게시물이 성공적으로 추가되었습니다.');
      } 
      catch (error) {
        if (error.response) {
          console.error('Error adding post: ', error.response.data); // 서버 응답이 있는 경우
        } else {
          console.error('Error adding post: ', error.message); // 서버 응답이 없는 경우
        }
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>새 게시글</Text>
      <TouchableOpacity onPress={() => pickImage(setImageURI)}>
        {imageURI ? (
          <Image source={{ uri: imageURI }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <MaterialIcons name="add-a-photo" size={50} color="gray" />
          </View>
        )}
      </TouchableOpacity>
      <View style={styles.inputContainer}>
        <Ionicons name="menu" size={24} />
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="제목을 입력하세요"
        />
      </View>
      <View style={styles.inputContainer}>
        <Ionicons name="book" size={24} />
        <TextInput
          style={styles.input}
          value={content}
          onChangeText={setContent}
          placeholder="내용을 입력하세요"
          multiline={true}
          numberOfLines={4}
        />
      </View>
      <View style={styles.inputContainer}>
        <Ionicons name="paw" size={24} />
        <TextInput
          style={styles.input}
          onChangeText={setBreed}
          placeholder={`#${classification || '견종'}`}
          placeholderTextColor={classification ? 'black' : 'lightgray'}
        />
      </View>
      {/* <View style={styles.inputContainer}>
        <Ionicons name="happy" size={24} />
        <TextInput
          style={styles.input}
          placeholder="#감정"
        />
      </View> */}
      <View style={styles.buttonWrapper}>
        <View style={styles.buttonContainer}>
          <Button title="분석하기" onPress={classifyImage} />
        </View>
        <View style={styles.buttonContainer}>
          <Button title="추가하기" onPress={handleAddPost} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'lightgray',
    marginBottom: 10,
  },
  input: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    flex: 1,
    fontSize: 15,
  },
  imagePlaceholder: {
    width: width * 0.70,
    height: width * 0.70,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'gray',
    marginTop: 5,
    marginBottom: 10,
    alignSelf: 'center',
  },
  image: {
    width: width * 0.70,
    height: width * 0.70,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 10,
    alignSelf: 'center',
  },
  buttonWrapper: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  buttonContainer: {
    marginBottom: 10,
  },
});
