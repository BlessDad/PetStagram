import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

export default function App() {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingContent, setEditingContent] = useState('');

  const fetchPosts = async () => {
    try {
      const response = await axios.get('http://192.168.0.25:3000/api/getPost');
      setPosts(response.data);
    } catch (error) {
      console.error("Error loading posts: ", error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleAddPost = async () => {
    if (title.trim() !== '' && content.trim() !== '') {
      try {
        await axios.post('http://192.168.0.25:3000/api/insert', {
          title: title,
          content: content
        });
        setTitle('');
        setContent('');
        fetchPosts();
      } catch (error) {
        console.error('Error adding post: ', error);
      }
    }
  };

  const handleDeletePost = async (id) => {
    try {
      await axios.delete(`http://192.168.0.25:3000/api/deletePost/${id}`);
      fetchPosts();
      Alert.alert('게시물 삭제 성공', '게시물이 성공적으로 삭제되었습니다.');
    } catch (error) {
      console.error('게시물 삭제 실패:', error);
      Alert.alert('게시물 삭제 실패', '게시물 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleEditPost = async (id) => {
    try {
      await axios.put(`http://192.168.0.25:3000/api/updatePost/${id}`, {
        title: editingTitle,
        content: editingContent
      });
      fetchPosts();
      setIsEditing(null); // 수정 완료 후 상태 초기화
      Alert.alert('게시물 수정 성공', '게시물이 성공적으로 수정되었습니다.');
      setEditingTitle(''); // 수정 완료 후 입력 필드 초기화
      setEditingContent(''); // 수정 완료 후 입력 필드 초기화
    } catch (error) {
      console.error('게시물 수정 실패:', error);
      Alert.alert('게시물 수정 실패', '게시물 수정 중 오류가 발생했습니다.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>게시글 목록</Text>
      <FlatList
        data={posts}
        renderItem={({ item }) => (
          <View style={styles.postItem}>
            {isEditing === item.id ? (
              <View>
                <TextInput
                  style={styles.input}
                  value={editingTitle}
                  onChangeText={setEditingTitle}
                  placeholder="제목을 입력하세요"
                />
                <TextInput
                  style={styles.input}
                  value={editingContent}
                  onChangeText={setEditingContent}
                  placeholder="내용을 입력하세요"
                  multiline={true}
                  numberOfLines={4}
                />
                <Button title="수정 완료" onPress={() => handleEditPost(item.id)} />
              </View>
            ) : (
              <View>
                <Text>제목: {item.title}</Text>
                <Text>내용: {item.content}</Text>
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
      {/* 수정 중이 아닐 때만 새 글 작성 요소 렌더링 */}
      {isEditing === null && (
        <View>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="제목을 입력하세요"
          />
          <TextInput
            style={styles.input}
            value={content}
            onChangeText={setContent}
            placeholder="내용을 입력하세요"
            multiline={true}
            numberOfLines={4}
          />
          <Button title="추가하기" onPress={handleAddPost} />
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
});