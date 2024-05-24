import React, { useState, useEffect } from 'react';
import { Text, View, Image, StyleSheet, TouchableOpacity, TextInput, Alert, FlatList, RefreshControl, Button } from 'react-native';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function HomeScreen() {
  const [posts, setPosts] = useState([]);
  const [likeCounts, setLikeCounts] = useState({});
  const [comments, setComments] = useState({});
  const [commentText, setCommentText] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingContent, setEditingContent] = useState('');
  const [editingImageURI, setEditingImageURI] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get('http://192.168.35.244:3000/api/getPost');
      setPosts(response.data);
    } catch (error) {
      console.error("Error loading posts: ", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const pickImage = async (setImageCallback) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled && result.assets.length > 0 && result.assets[0].uri) {
      setImageCallback(result.assets[0].uri);
      setEditingImageURI(result.assets[0].uri);
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
      const response = await axios.post('http://192.168.35.244:3000/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.imageUrl;
    } catch (error) {
      console.error('Image upload failed: ', error);
      return null;
    }
  };

  const handleEditPost = async (id) => {
    let imageUrl = editingImageURI;
    if (editingImageURI && editingImageURI !== posts.find(post => post.id === id).image_url) {
      const fileName = `${editingTitle.replace(/\s+/g, '_')}.jpg`;
      imageUrl = await uploadImage(editingImageURI, fileName);
    }

    try {
      await axios.put(`http://192.168.35.244:3000/api/updatePost/${id}`, {
        title: editingTitle,
        content: editingContent,
        imageUrl: imageUrl,
      });
      fetchPosts();
      setIsEditing(null);
      Alert.alert('게시물 수정 성공', '게시물이 성공적으로 수정되었습니다.');
      setEditingTitle('');
      setEditingContent('');
      setEditingImageURI(null);
    } catch (error) {
      console.error('게시물 수정 실패:', error);
      Alert.alert('게시물 수정 실패', '게시물 수정 중 오류가 발생했습니다.');
    }
  };

  const handleDeletePost = async (id) => {
    try {
      await axios.delete(`http://192.168.35.244:3000/api/deletePost/${id}`);
      fetchPosts();
      Alert.alert('게시물 삭제 성공', '게시물이 성공적으로 삭제되었습니다.');
    } catch (error) {
      console.error('게시물 삭제 실패:', error);
      Alert.alert('게시물 삭제 실패', '게시물 삭제 중 오류가 발생했습니다.');
    }
  };

  const fetchComments = async (postId) => {
    try {
      const response = await axios.get(`http://192.168.35.244:3000/api/getComments/${postId}`);
      setComments((prevComments) => ({
        ...prevComments,
        [postId]: { showComments: true, comments: response.data }
      }));
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setComments((prevComments) => ({
          ...prevComments,
          [postId]: { showComments: true, comments: [] }
        }));
      } else {
        console.error("Error loading comments: ", error);
      }
    }
  };

  const handleLike = (postId) => {
    setLikeCounts((prevLikeCounts) => ({
      ...prevLikeCounts,
      [postId]: (prevLikeCounts[postId] || 0) + 1,
    }));
  };

  const handleChat = async (postId) => {
    if (!comments[postId]) {
      await fetchComments(postId);
    } else {
      setComments((prevComments) => ({
        ...prevComments,
        [postId]: { ...prevComments[postId], showComments: !prevComments[postId].showComments }
      }));
    }
  };

  const handleCommentSubmit = async (postId) => {
    if (commentText.trim() !== '') {
      try {
        await axios.post('http://192.168.35.244:3000/api/addComment', {
          postId,
          comment: commentText,
        });
        setCommentText('');
        await fetchComments(postId);
      } catch (error) {
        console.error('댓글 추가 실패:', error);
        Alert.alert('댓글 추가 실패', '댓글 추가 중 오류가 발생했습니다.');
      }
    }
  };

  const handleDeleteComment = async (commentId, postId) => {
    try {
      await axios.delete(`http://192.168.35.244:3000/api/deleteComment/${commentId}`);
      await fetchComments(postId);
    } catch (error) {
      console.error('댓글 삭제 실패:', error);
      Alert.alert('댓글 삭제 실패', '댓글 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleDirect = (index) => {
    // Direct 버튼 클릭 시 처리할 로직
  };

  const handleSave = (index) => {
    // Save 버튼 클릭 시 처리할 로직
  };

  const renderPosts = ({ item: post }) => (
    <View key={post.id} style={styles.postContainer}>
      <View style={styles.profileRow}>
        <View style={styles.profileImageContainer}>
          <Image style={styles.profileImage} source={require('../assets/profile.jpg')} />
          <Text style={styles.username}>{post.title}</Text>
        </View>
        <View style={styles.buttonRow}>
          <Button title="수정" onPress={() => {
            setIsEditing(post.id);
            setEditingTitle(post.title);
            setEditingContent(post.content);
            setEditingImageURI(post.image_url);
          }} />
          <Button title="삭제" onPress={() => handleDeletePost(post.id)} />
        </View>
      </View>
      <Image style={styles.postImage} source={{ uri: post.image_url }} />
      <View style={styles.buttonsContainer}>
        <TouchableOpacity onPress={() => handleLike(post.id)} style={styles.buttonContainer}>
          <Image style={styles.buttonImage} source={require('../assets/home_like.png')} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleChat(post.id)} style={styles.buttonContainer}>
          <Image style={styles.buttonImage} source={require('../assets/home_chat.png')} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDirect(post.id)} style={styles.buttonContainer}>
          <Image style={styles.buttonImage} source={require('../assets/home_direct.png')} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleSave(post.id)} style={[styles.buttonContainer, styles.lastButton]}>
          <Image style={styles.buttonImage} source={require('../assets/home_save.png')} />
        </TouchableOpacity>
      </View>

      {isEditing === post.id ? (
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
          <Button title="수정 완료" onPress={() => handleEditPost(post.id)} />
        </View>
      ) : (
        <View>
          <Text style={styles.likeText}>좋아요 {likeCounts[post.id] || 0}개</Text>
          <Text style={styles.postText}>
            <Text style={styles.username}>{post.title}</Text> {post.content}
          </Text>
        </View>
      )}

      {comments[post.id] && comments[post.id].showComments && (
        <View style={styles.commentContainer}>
          {(comments[post.id].comments && comments[post.id].comments.length > 0) ? (
            comments[post.id].comments.map((comment, index) => (
              <View key={index} style={styles.commentItem}>
                <Text>{comment.comment}</Text>
                <TouchableOpacity onPress={() => handleDeleteComment(comment.id, post.id)} style={styles.deleteButton}>
                  <Text style={styles.deleteButtonText}>삭제</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text>댓글이 없습니다.</Text>
          )}
          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.commentInput}
              value={commentText}
              onChangeText={(text) => setCommentText(text)}
              placeholder="댓글을 작성하세요..."
              onSubmitEditing={() => handleCommentSubmit(post.id)}
            />
            <TouchableOpacity onPress={() => handleCommentSubmit(post.id)} style={styles.submitButton}>
              <Text style={styles.submitButtonText}>게시</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <FlatList
      contentContainerStyle={styles.scrollContainer}
      data={posts}
      renderItem={renderPosts}
      keyExtractor={(item) => item.id.toString()}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  postContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileImageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  postImage: {
    width: '100%',
    height: 375,
    marginBottom: 10,
  },
  buttonsContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  buttonContainer: {
    marginRight: 15,
  },
  buttonImage: {
    width: 30,
    height: 30,
  },
  lastButton: {
    marginLeft: 'auto',
  },
  likeText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  commentContainer: {
    marginTop: 10,
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginLeft: 10,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  commentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  deleteButton: {
    marginLeft: 10,
  },
  deleteButtonText: {
    color: 'red',
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
  buttonRow: {
    flexDirection: 'row',
  },
  postText: {
    fontSize: 14,
    marginBottom: 10,
  },
});
