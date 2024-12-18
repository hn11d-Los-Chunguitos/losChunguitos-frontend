import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, Text, View, TouchableOpacity, Linking } from 'react-native';
import axios from 'axios';
import { Link, useLocalSearchParams } from 'expo-router';
import { useRouter } from 'expo-router';

export default function UpvotedComments() {
  const [comments, setComments] = useState([]); // Estado para guardar las submissions favoritas
  const [error, setError] = useState<string | null>(null); // Estado para errores

  const { loggedInUser } = useLocalSearchParams(); // Obtener loggedInUser de los parámetros
  const router = useRouter();

  useEffect(() => {
    if (!loggedInUser) return; // Asegúrate de que el token de autenticación esté presente

    const fetchUpvotedComments = async () => {
      try {
        const response = await axios.get(
          'https://proyecto-asw-render.onrender.com/api/comments/votes/',
          {
            headers: {
              Authorization: loggedInUser, // Token de autenticación
            },
          }
        );
        setComments(response.data); // Guardar las submissions favoritas
        console.log('Upvoted comments data:', response.data);
      } catch (err) {
        setError('Error al cargar las submissions favoritas');
        console.error(err);
        setComments([]);
      }
    };

    fetchUpvotedComments(); // Llamada a la API

  }, [loggedInUser]); // Solo se ejecuta cuando loggedInUser cambia

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Upvoted Comments</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      {comments.length === 0 && !error && (
        <Text style={styles.cardMeta}>No comments to display</Text>
      )}
      {comments.map((comment, index) => (
        <View key={index} style={styles.card}>
          {/* Asegúrate de que las propiedades existan antes de mostrarlas */}
          <Text style={styles.cardTitle}>{comment.comment.content || 'No content available'}</Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardMeta}>
              {comment.comment.created_by?.username || 'Anonymous'} {'at '}
              {new Date(comment.comment.created_at).toLocaleDateString()} {'with '}
              {comment.comment.total_votes || 0} votes
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
