import React, { useState } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import * as tf from '@tensorflow/tfjs';



export default function PostScreen() {
    const [imageURI, setImageURI] = useState(null);
    const [uriInput, setUriInput] = useState('');
    
  


    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        console.log(result);

        if (!result.cancelled) {
            setImageURI(result.assets[0].uri);
            setUriInput(result.assets[0].uri); // 이미지 선택 시 URI를 입력란에 표시
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={pickImage}>
                {imageURI ? (
                    <Image source={{ uri: imageURI }} style={styles.image} />
                ) : (
                    <View style={styles.imagePlaceholder}>
                        <MaterialIcons name="add-a-photo" size={50} color="gray" />
                    </View>
                )}
            </TouchableOpacity>
            <TextInput
                style={styles.input}
                placeholder= "hashtag"
                value={uriInput}
                onChangeText={text => setUriInput(text)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: 30,
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
    },
    image: {
        width: 200,
        height: 200,
        borderRadius: 10,
    },
    input: {
        width: '80%',
        height: 40,
        marginTop: 20,
        padding: 10,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 5,
    },
});