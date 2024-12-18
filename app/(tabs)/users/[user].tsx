import React, { useEffect, useState } from 'react'; 
import axios from 'axios';
import { useGlobalContext } from "@/contexts/GlobalContext";
import { StyleSheet, View, Text, Button, Picker, Image, TextInput, ActivityIndicator } from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';

export default function UsersScreen() {
    const params = useLocalSearchParams();
    const id = params.id as string;
    const [profile, setProfile] = useState(null);

    const fetchUserProfile = async () => {
        try {
            const response = await axios.get(`https://proyecto-asw-render.onrender.com/api/users/${id}`);
            console.log('User profile:', response.data);
            setProfile(response.data);
        } catch (error) {
            console.error("Error fetching user profile:", error);
        }
    };

    useEffect(() => {
        setProfile(null);
        fetchUserProfile();
    }, [id]);

    if (!profile) {
      return (
          <View style={styles.container}>
              <ActivityIndicator size="large" color="#ff6600" />
          </View>
      );
  }
  

    return (
        <View style={styles.container}>
            <View style={styles.profileCard}>
                <Image source={{ uri: profile.banner }} style={styles.banner} />
                <Image source={{ uri: profile.avatar }} style={styles.avatar} />
                <Text style={styles.label}>Username:</Text>
                <Text style={styles.detail}>{profile.username}</Text>
                <Text style={styles.title}>{profile.name}</Text>
                <Text style={styles.label}>Karma:</Text>
                <Text style={styles.detail}>{profile.karma}</Text>
                <Text style={styles.label}>About:</Text>
                <Text style={styles.detail}>{profile.about}</Text>
                <View style={styles.buttonContainer}>
                <Link 
                  style={styles.action}
                  href={`/favoriteSubmissions?loggedInUser=Tcs5cIBgIysU9IswpHxPX-R21e0faN3fGmkdp4-EOlE`}>
                  Submissions Favoritas
                </Link>

                </View>
            </View>
        </View>
    );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6ef', // Fondo beige
    padding: 16,
    justifyContent: 'center',
  },
  profileCard: {
    backgroundColor: '#ffffff', // Fondo blanco
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff6600',
    marginBottom: 8,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333333',
  },
  detail: {
    fontSize: 14,
    color: '#555555',
    marginBottom: 4,
  },
  banner: {
    width: "100%", // Toma el ancho completo
    height: 120,   // Altura del banner
    marginBottom: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  avatar: {
    width: 80,   // Tamaño del avatar
    height: 80,
    borderRadius: 40, // Hace la imagen redonda
    alignSelf: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#ff6600",
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 16,
    paddingHorizontal: 16,
    gap: 8,
    justifyContent: 'flex-end',
  },
  action: {
    color: '#ff6600', // Links en naranja
    fontSize: 12,
    marginBottom: 8,
  },
  
});

