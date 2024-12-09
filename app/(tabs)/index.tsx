import React, { useEffect, useState } from 'react'; 
import { StyleSheet, ScrollView, Text, View, TouchableOpacity, Linking } from 'react-native';
import axios from 'axios';
import { Link } from 'expo-router';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const [submissions, setSubmissions] = useState([]); // Estado para guardar las submissions
  const [error, setError] = useState<string | null>(null); // Estado para errores

  const router = useRouter();

  useEffect(() => {
    axios
      .get('https://proyecto-asw-render.onrender.com/api/submissions')
      .then((response) => {
        setSubmissions(response.data);
        console.log('Submissions data:', response.data);
      })
      .catch((err) => {
        setError('Error al cargar las submissions');
        console.error(err);
        setSubmissions([]);
      });
  }, []);

  const handlePress = (url: string) => {
    if (url) {
      Linking.openURL(url).catch((err) =>
        console.error("Failed to open URL:", err)
      );
    }
  };


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Submissions</Text>
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
              {submission.created_by.username} •{' '}
              {new Date(submission.created_at).toLocaleDateString()}
            </Text>
            <Text style={styles.cardVotes}>{submission.total_votes} votes</Text>
          </View>
          <Link 
            key={submission.id} 
            href={`/${submission.id}?id=${submission.id}`}
          >
            Discuss {submission.id} 
          </Link>
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
    color: '#ff6600', // Links en naranja
  },
  cardDescription: {
    fontSize: 14,
    color: '#666666', // Texto gris claro para contenido
    lineHeight: 20,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: 8,
  },
  cardMeta: {
    fontSize: 12,
    color: '#828282', // Metadatos en gris claro
  },
  cardVotes: {
    fontSize: 12,
    color: '#000000',
    fontWeight: 'bold',
  },
});

