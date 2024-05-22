import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import FormData from 'form-data';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import * as mobilenet from '@tensorflow-models/mobilenet';

export default function App() {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageURI, setImageURI] = useState(null);
  const [isEditing, setIsEditing] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingContent, setEditingContent] = useState('');
  const [editingImageURI, setEditingImageURI] = useState(null);
  const [model, setModel] = useState(null);
  const [prediction, setPrediction] = useState('');

  const fetchPosts = async () => {
    try {
      const response = await axios.get('http://192.168.0.41:3000/api/getPost');
      setPosts(response.data);
    } catch (error) {
      console.error("Error loading posts: ", error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    async function loadModel() {
      await tf.ready();
      const loadedModel = await mobilenet.load();
      setModel(loadedModel);
    }
    loadModel();
  }, []);

  const pickImage = async (setImageCallback) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled && result.assets.length > 0 && result.assets[0].uri) {
      setImageCallback(result.assets[0].uri);
      setImageURI(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri, fileName) => {
    const formData = new FormData();
    formData.append('image', {
      uri,
      type: 'image/jpeg',   // 이미지 타입
      name: fileName,   // 이미지 이름
    });

    try {
      const response = await axios.post('http://192.168.0.41:3000/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.imageUrl;  // 서버 응답에서 이미지 URL을 반환
    } catch (error) {
      console.error('Image upload failed: ', error);
      return null;
    }
  };

  const handleAddPost = async () => {
    if (title.trim() !== '' && content.trim() !== '') {
      let imageUrl = null;
      if (imageURI) {
        const fileName = `${title.replace(/\s+/g, '_')}.jpg`;
        imageUrl = await uploadImage(imageURI, fileName);
      }
      try {
        const response = await axios.post('http://192.168.0.41:3000/api/insert', {
          title: title,
          content: content,
          imageUrl: imageUrl, // 이미지 URL을 포함하여 요청 전송
        });
        setTitle('');
        setContent('');
        setImageURI(null);
        fetchPosts();
      } catch (error) {
        if (error.response) {
          console.error('Error adding post: ', error.response.data);  // 서버 응답이 있는 경우
        } else {
          console.error('Error adding post: ', error.message);   // 서버 응답이 없는 경우
        }
      }
    }
  };

  const handleDeletePost = async (id) => {
    try {
      await axios.delete(`http://192.168.0.41:3000/api/deletePost/${id}`);
      fetchPosts();
      Alert.alert('게시물 삭제 성공', '게시물이 성공적으로 삭제되었습니다.');
    } catch (error) {
      console.error('게시물 삭제 실패:', error);
      Alert.alert('게시물 삭제 실패', '게시물 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleEditPost = async (id) => {
    let imageUrl = editingImageURI;
    if (editingImageURI && editingImageURI !== posts.find(post => post.id === id).image_url) {
      const fileName = `${editingTitle.replace(/\s+/g, '_')}.jpg`;
      imageUrl = await uploadImage(editingImageURI, fileName);
    }

    try {
      await axios.put(`http://192.168.0.41:3000/api/updatePost/${id}`, {
        title: editingTitle,
        content: editingContent,
        imageUrl: imageUrl,
      });
      fetchPosts();
      setIsEditing(null); // 수정 완료 후 상태 초기화
      Alert.alert('게시물 수정 성공', '게시물이 성공적으로 수정되었습니다.');
      setEditingTitle('');  // 수정 완료 후 입력 필드 초기화
      setEditingContent('');
      setEditingImageURI(null);
      setImageURI(null);
    } catch (error) {
      console.error('게시물 수정 실패:', error);
      Alert.alert('게시물 수정 실패', '게시물 수정 중 오류가 발생했습니다.');
    }
  };

  const analyzeImage = async (uri) => { //이미지 분석
    try {
      const response = await fetch(uri);
      const imageBlob = await response.blob();
      const imageData = await tf.browser.fromPixelsAsync(imageBlob);
      const resizedImage = tf.image.resizeBilinear(imageData, [224, 224]); //mobilenet 이미지 전처리
      const normalizedImage = resizedImage.div(255.0).expandDims(0);
      const predictions = await model.classify(normalizedImage);
      setPrediction(predictions[0].className);
    } catch (error) {
      console.error('Error analyzing image: ', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>게시글 목록</Text>
      <FlatList
        data={posts}
        renderItem={({ item }) => (
          <View style={styles.postItem}>
            {isEditing == item.id ? (
              <View>
                <TextInput
                  style={styles.input}
                  value={editingTitle}
                  onChangeText={setEditingTitle}
                  placeholder="사용자를 입력하세요"
                />
                <TextInput
                  style={styles.input}
                  value={editingContent}
                  onChangeText={setEditingContent}
                  placeholder="내용을 입력하세요"
                  multiline={true}
                  numberOfLines={4}
                />
                <TouchableOpacity onPress={() => pickImage(setEditingImageURI)}>
                  {editingImageURI ? (
                    <Image source={{ uri: editingImageURI }} style={styles.image} />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <MaterialIcons name="add-a-photo" size={50} color="gray" />
                    </View>
                  )}
                </TouchableOpacity>
                <Button title="수정 완료" onPress={() => handleEditPost(item.id)} />
              </View>
            ) : (
              <View>
                <Text>사용자: {item.title}</Text>
                <Text>내용: {item.content}</Text>
                {item.image_url && (
                  <View>
                    <Image source={{ uri: item.image_url }} style={styles.image} />
                  </View>
                )}
                <View style={styles.buttonContainer}>
                  <Button title="수정" onPress={() => setIsEditing(item.id)} />
                  <Button title="삭제" onPress={() => handleDeletePost(item.id)} />
                </View>
              </View>
            )}
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
      />
      {isEditing === null && (
        <View>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="사용자를 입력하세요"
          />
          <TextInput
            style={styles.input}
            value={content}
            onChangeText={setContent}
            placeholder="내용을 입력하세요"
            multiline={true}
            numberOfLines={4}
          />
          <TouchableOpacity onPress={() => pickImage(setImageURI)}>
            {imageURI ? (
              <Image source={{ uri: imageURI }} style={styles.image} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <MaterialIcons name="add-a-photo" size={50} color="gray" />
              </View>
            )}
          </TouchableOpacity>
          <Button title="추가하기" onPress={handleAddPost} />
          <Button title="분석하기" onPress={() => analyzeImage(imageURI)} />
          {prediction ? <Text>예측 결과: {prediction}</Text> : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  postItem: {
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  imagePlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'gray',
    marginTop: 10,
    marginBottom: 10,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 10,
  },
});
