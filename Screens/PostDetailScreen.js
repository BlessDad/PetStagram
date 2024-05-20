import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import axios from 'axios';

export default function PostDetailScreen({ route }) {
  const { id, title, image_url, content } = route.params;
  const [comments, setComments] = useState([]);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const response = await axios.get(`http://192.168.0.41:3000/api/getComments/${id}`);
      setComments(response.data);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setComments([]);
      } else {
        console.error("Error loading comments: ", error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Image source={{ uri: image_url }} style={styles.image} />
      <Text style={styles.content}>{content}</Text>
      <View style={styles.commentsContainer}>
        <Text style={styles.commentsTitle}>댓글:</Text>
        {comments.length > 0 ? (
          comments.map((comment, index) => (
            <View key={index} style={styles.commentItem}>
              <Text>{comment.comment}</Text>
            </View>
          ))
        ) : (
          <Text>댓글이 없습니다.</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'flex-start', // 왼쪽 정렬
    padding: 20,
  },
  image: {
    width: '100%',
    height: 375,
    marginBottom: 20,
  },
  id: {
    fontSize: 20,
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
  },
  content: {
    fontSize: 20,
    marginBottom: 20,
  },
  commentsContainer: {
    width: '100%',
  },
  commentsTitle: {
    fontSize: 18,
    //fontWeight: 'bold',
    marginBottom: 10,
  },
  commentItem: {
    paddingVertical: 5,
    //borderBottomWidth: 1,
    //borderBottomColor: '#ccc',
  },
});
