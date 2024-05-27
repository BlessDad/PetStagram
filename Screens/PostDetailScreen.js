import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import axios from 'axios';

//const BASE_URL = 'http://3.35.26.234:8080';
const BASE_URL = 'http://52.78.86.212:8080';

export default function PostDetailScreen({ route }) {
  const { id, title, image_url, content } = route.params;
  const [comments, setComments] = useState([]);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/comment/getComment/${id}`);
      setComments(response.data);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setComments([]);
      } else {
        console.error("Error loading comments: ", error);
      }
    }
  };

  const fullImageUrl = `${BASE_URL}${image_url}`;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Image 
        source={{ uri: fullImageUrl }} 
        style={styles.image}
      />
      <Text style={styles.content}>{content}</Text>
      <View style={styles.commentsContainer}>
        <Text style={styles.commentsTitle}>댓글:</Text>
        {comments.length > 0 ? (
          comments.map((comment, index) => (
            <View key={index} style={styles.commentItem}>
              <Text style={styles.commentWriter}>{comment.comment_writer}</Text>
              <Text>{comment.comment_content}</Text>
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
    alignItems: 'flex-start',
    padding: 20,
  },
  image: {
    width: '100%',
    height: 375,
    marginBottom: 20,
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
    marginBottom: 10,
  },
  commentItem: {
    paddingVertical: 5,
  },
  commentWriter: {
    fontSize: 12,
    color: 'gray',
  },
});