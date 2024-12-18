import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, Text, View, TouchableOpacity, Linking } from 'react-native';
import axios from 'axios';
import { Link, useLocalSearchParams } from 'expo-router';

export default function FavoriteComments() {
  const [comments, setComments] = useState([]); // Estado para guardar las submissions favoritas
  const [error, setError] = useState<string | null>(null); // Estado para errores

  const { loggedInUser } = useLocalSearchParams(); // Obtener loggedInUser de los parámetros

  useEffect(() => {
    if (!loggedInUser) return; // Asegúrate de que el token de autenticación esté presente

    const fetchFavoriteComments = async () => {
      try {
        const response = await axios.get(
          'https://proyecto-asw-render.onrender.com/api/comments/favorites/',
          {
            headers: {
              Authorization: loggedInUser, // Token de autenticación
            },
          }
        );
        console.log(response.data);
        setComments(response.data); // Guardar las submissions favoritas
        console.log('Favorite submissions data:', response.data);
      } catch (err) {
        setError('Error al cargar las submissions favoritas');
        console.error(err);
        setComments([]);
      }
    };

    fetchFavoriteComments(); // Llamada a la API

  }, [loggedInUser]); // Solo se ejecuta cuando loggedInUser cambia

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Favorite Comments</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      {comments.map((comment, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.cardTitle}>{comment.content}</Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardMeta}>
              {comment.created_by?.username} {'at '}
              {new Date(comment.created_at).toLocaleDateString()} {'with '}
              {comment.total_votes} votes
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f6f6ef', // Fondo general beige, como Hacker News
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#ffffff',
    backgroundColor: '#ff6600', // Header naranja
    paddingVertical: 8,
  },
  error: {
    fontSize: 16,
    color: '#ff6600', // Texto de error en naranja
    textAlign: 'center',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#ffffff', // Fondo blanco de las tarjetas
    borderRadius: 4,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0', // Bordes sutiles como en Hacker News
  },
  cardHeader: {
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000', // Títulos en negro
    marginBottom: 4,
  },
  link: {
    color: '#ff6600',
  },
  action: {
    color: '#ff6600', // Links en naranja
    fontSize: 12,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666666', // Texto gris claro para contenido
    lineHeight: 20,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: 8,
  },
  cardMeta: {
    fontSize: 12,
    color: '#828282', // Metadatos en gris claro
  },
  separator: {
    marginHorizontal: 3,
    color: '#eeeeee', // Same color as cardMeta for consistency
  },
});
