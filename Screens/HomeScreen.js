import React, { useState, useEffect } from 'react';
import { Text, View, Image, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, RefreshControl } from 'react-native';
import axios from 'axios';


const BASE_URL = 'http://172.30.1.54:8080';

export default function HomeScreen() {
    const [posts, setPosts] = useState([]);
    const [likeCounts, setLikeCounts] = useState({});
    const [comments, setComments] = useState({});
    const [commentText, setCommentText] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/api/getPost`);
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

    const fetchComments = async (postId) => {
        try {
            const response = await axios.get(`${BASE_URL}/comment/getComment/${postId}`);
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
            Alert.alert('입력된 댓글', commentText);
            try {
                const response = await axios.post(`${BASE_URL}/comment/insert/${postId}`, {
                    comment_writer: 'User', // Set the writer's name or get it dynamically if needed
                    comment_content: commentText,
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.status === 201) { // 201 Created
                    console.log('댓글이 성공적으로 추가되었습니다:', response.data);
                    setCommentText('');
                    await fetchComments(postId);
                } else {
                    console.error('댓글 추가 실패:', response.data);
                    Alert.alert('댓글 추가 실패', '댓글 추가 중 오류가 발생했습니다.');
                }
            } catch (error) {
                console.error('댓글 추가 실패:', error);
                Alert.alert('댓글 추가 실패', '댓글 추가 중 오류가 발생했습니다.');
            }
        } else {
            Alert.alert('댓글 내용이 비어 있습니다', '댓글을 입력해주세요.');
        }
    };

    const handleDeleteComment = async (commentId, postId) => {
        try {
            await axios.delete(`${BASE_URL}/comment/deleteComment/${commentId}`);
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
            <View style={styles.profileImageContainer}>
                <Image style={styles.profileImage} source={require('../assets/profile.jpg')} />
                <Text style={styles.username}>{post.title}</Text>
            </View>
            <Image style={styles.postImage} source={{ uri: `http://52.78.86.212:8080${post.imageUrl}` }} />
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

            {comments[post.id] && comments[post.id].showComments && (
                <View style={styles.commentContainer}>
                    {(comments[post.id].comments && comments[post.id].comments.length > 0) ? (
                        comments[post.id].comments.map((comment, index) => (
                            <View key={index} style={styles.commentItem}>
                                <Text>{comment.comment_content}</Text>
                                <TouchableOpacity onPress={() => handleDeleteComment(comment.comment_id, post.id)} style={styles.deleteButton}>
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

            <Text style={styles.likeText}>좋아요 {likeCounts[post.id] || 0}개</Text>
            <Text style={styles.postText}>
                <Text style={styles.username}>{post.title}</Text> {post.content}
            </Text>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 5,
    },
    deleteButton: {
        marginLeft: 10,
        padding: 5,
        backgroundColor: '#FF3B30',
        borderRadius: 5,
    },
    deleteButtonText: {
        color: '#FFFFFF',
    },
    postText: {
        marginTop: 10,
    },
});
