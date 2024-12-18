import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, Text, View, TouchableOpacity, Linking } from 'react-native';
import axios from 'axios';
import { Link, useLocalSearchParams } from 'expo-router';

export default function UpvotedSubmissions() {
  const [submissions, setSubmissions] = useState([]); // Estado para guardar las submissions favoritas
  const [error, setError] = useState<string | null>(null); // Estado para errores

  const { loggedInUser } = useLocalSearchParams(); // Obtener loggedInUser de los parámetros

  useEffect(() => {
    if (!loggedInUser) return; // Asegúrate de que el token de autenticación esté presente

    const fetchUpvotedSubmissions = async () => {
      try {
        // Llama al endpoint que devuelve las IDs de las submissions votadas
        const response = await axios.get(
          'https://proyecto-asw-render.onrender.com/api/submissions/votes/',
          {
            headers: {
              Authorization: loggedInUser, // Token de autenticación
            },
          }
        );

        const votedSubmissions = response.data; // Array de objetos con {id, submission, user}
        console.log('Voted Submissions:', votedSubmissions);

        // Mapea las IDs de submissions para obtener sus detalles
        const fetchedSubmissions = await Promise.all(
          votedSubmissions.map(async (vote) => {
            try {
              const submissionResponse = await axios.get(
                `https://proyecto-asw-render.onrender.com/api/submissions/${vote.submission}/`,
                {
                  headers: {
                    Authorization: loggedInUser,
                  },
                }
              );
              return submissionResponse.data;
            } catch (err) {
              console.error(`Error fetching submission ${vote.submission}:`, err);
              return null; // En caso de error, regresa null para esta submission
            }
          })
        );

        // Filtra submissions que son null debido a errores en la API
        const validSubmissions = fetchedSubmissions.filter((sub) => sub !== null);
        setSubmissions(validSubmissions); // Guardar todas las submissions válidas
        console.log('Fetched Submissions:', validSubmissions);
      } catch (err) {
        setError('Error al cargar las submissions favoritas');
        console.error('Error fetching upvoted submissions:', err);
        setSubmissions([]);
      }
    };

    fetchUpvotedSubmissions(); // Llamada a la API

  }, [loggedInUser]); // Solo se ejecuta cuando loggedInUser cambia

  const handlePress = (url: string) => {
    if (url) {
      Linking.openURL(url).catch((err) =>
        console.error('Failed to open URL:', err)
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Upvoted Submissions</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      {submissions.map((submission, index) => (
        <View key={index} style={styles.card}>
          <View style={styles.cardHeader}>
            <TouchableOpacity onPress={() => handlePress(submission.url)}>
              <Text style={[styles.cardTitle, submission.url && styles.link]}>
                {submission.title}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.cardDescription}>{submission.content}</Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardMeta}>
              {submission.created_by.username} {'at '}
              {new Date(submission.created_at).toLocaleDateString()} {'with '}
              {submission.total_votes} votes
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
    backgroundColor: '#f6f6ef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#ffffff',
    backgroundColor: '#ff6600',
    paddingVertical: 8,
  },
  error: {
    fontSize: 16,
    color: '#ff6600',
    textAlign: 'center',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 4,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cardHeader: {
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  link: {
    color: '#ff6600',
  },
  action: {
    color: '#ff6600',
    fontSize: 12,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666666',
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
    color: '#828282',
  },
  separator: {
    marginHorizontal: 3,
    color: '#eeeeee',
  },
});
