import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, Text, View, TouchableOpacity, Linking } from 'react-native';
import axios from 'axios';
import { Link, useLocalSearchParams } from 'expo-router';
import { useRouter } from 'expo-router';

export default function HiddenSubmissions() {
  const [submissions, setSubmissions] = useState([]); // Estado para guardar las submissions hidden
  const [error, setError] = useState<string | null>(null); // Estado para errores

  const { loggedInUser } = useLocalSearchParams(); // Obtener loggedInUser de los parámetros
  const router = useRouter();

  useEffect(() => {
    if (!loggedInUser) return; // Asegúrate de que el token de autenticación esté presente

    const fetchHiddenSubmissions = async () => {
      try {
        const response = await axios.get(
          'https://proyecto-asw-render.onrender.com/api/hidden/',
          {
            headers: {
              Authorization: loggedInUser, // Token de autenticación
            },
          }
        );
        console.log(response.data)
        setSubmissions(response.data); // Guardar las submissions hidden
        console.log('Hidden submissions data:', response.data);
      } catch (err) {
        setError('Error al cargar las submissions hidden');
        console.error(err);
        setSubmissions([]);
      }
    };

    fetchHiddenSubmissions(); // Llamada a la API

  }, [loggedInUser]); // Solo se ejecuta cuando loggedInUser cambia

  const handlePress = (url: string) => {
    if (url) {
      Linking.openURL(url).catch((err) =>
        console.error("Failed to open URL:", err)
      );
    }
  };

  const handleUnHide = (submissionId: number) => {
    if (submissionId) {
      axios
        .post(
          'https://proyecto-asw-render.onrender.com/api/hidden/',
          { submission_id: submissionId },
          {
            headers: {
              Authorization: loggedInUser, // Usar el token del usuario
            },
          }
        )
        .then((response) => {
          console.log('Submission hidden:', response.data);
        })
        .catch((err) => {
          console.error('Error hiding submission:', err);
        });
    }
    const fetchHiddenSubmissions = async () => {
      try {
        const response = await axios.get(
          'https://proyecto-asw-render.onrender.com/api/hidden/',
          {
            headers: {
              Authorization: loggedInUser, // Token de autenticación
            },
          }
        );
        setSubmissions(response.data); // Guardar las submissions hidden
        console.log('Hidden submissions data:', response.data);
      } catch (err) {
        setError('Error al cargar las submissions hidden');
        console.error(err);
        setSubmissions([]);
      }
    };

    fetchHiddenSubmissions(); // Llamada a la API
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Hidden</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      {submissions.map((item, index) => (
        <View key={index} style={styles.card}>
          <View style={styles.cardHeader}>
            <TouchableOpacity onPress={() => handlePress(item.submission.url)}>
              <Text style={[styles.cardTitle, item.submission.url && styles.link]}>
                {item.submission.title}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.cardDescription}>{item.submission.content}</Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardMeta}>
              {item.submission.created_by.username} {' at '}
              {new Date(item.submission.created_at).toLocaleDateString()} {' with '}
              {item.submission.total_votes} votes
            </Text>
            <Text style={styles.separator}>|</Text>
            <Link 
            style={styles.action}
            key={item.submission.id} 
            href={`/${item.submission.id}?id=${item.submission.id}`}
          >
            Discuss
          </Link>
          <Text style={styles.separator}>|</Text>
            <TouchableOpacity
              onPress={() => handleUnHide(item.submission.id)}
            >
              <Text style={styles.action}>Unhide</Text>
            </TouchableOpacity>
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
