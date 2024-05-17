import React, { useState } from 'react';
import { Text, View, Image, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform } from 'react-native';

export default function HomeScreen() {
  const posts = [
    { id: 1, username: 'user1', text: 'Post 1', image: require('../assets/image1.jpg') },
    { id: 2, username: 'user2', text: 'Post 2', image: require('../assets/image2.jpg') },
    { id: 3, username: 'user3', text: 'Post 3', image: require('../assets/image3.jpg') },
    { id: 4, username: 'user4', text: 'Post 4', image: require('../assets/image4.jpg') },
    { id: 5, username: 'user5', text: 'Post 5', image: require('../assets/image5.jpg') },
  ];

  const [likeCounts, setLikeCounts] = useState({});
  const [comments, setComments] = useState({});
  const [commentText, setCommentText] = useState('');

  const handleLike = (postId) => {
    setLikeCounts((prevLikeCounts) => ({
      ...prevLikeCounts,
      [postId]: (prevLikeCounts[postId] || 0) + 1,
    }));
  };

  const handleChat = (postId) => {
    setComments((prevComments) => ({
      ...prevComments,
      [postId]: !prevComments[postId],
    }));
  };

  const handleCommentSubmit = (postId) => {
    if (commentText.trim() !== '') {
      setCommentText('');
      setComments((prevComments) => ({
        ...prevComments,
        [postId]: false,
      }));
    }
  };

  const handleDirect = (index) => {
    // Direct 버튼 클릭 시 처리할 로직
  };

  const handleSave = (index) => {
    // Save 버튼 클릭 시 처리할 로직
  };

  const renderPosts = () => {
    return posts.map((post) => (
      <View key={post.id} style={styles.postContainer}>
        <View style={styles.profileImageContainer}>
          <Image style={styles.profileImage} source={require('../assets/profile.jpg')} />
          <Text style={styles.username}>{post.username}</Text>
        </View>
        <Image style={styles.postImage} source={post.image} />
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

        {comments[post.id] && (
          <View style={styles.commentContainer}>
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
        )}
        <Text style={styles.likeText}>좋아요 {likeCounts[post.id] || 0}개</Text>
        <Text style={styles.postText}>
          <Text style={styles.username}>{post.username}</Text> {post.text}
        </Text>
      </View>
    ));
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {renderPosts()}
    </ScrollView>
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
  profileImageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
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
    marginBottom: 10,
  },
  postImage: {
    width: '100%', // 전체 너비로 조정
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});