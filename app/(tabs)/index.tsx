import React, { useEffect, useState } from 'react'; 
import { StyleSheet, ScrollView, Text, View, TouchableOpacity, TextInput, Linking } from 'react-native';
import axios from 'axios';
import { Link } from 'expo-router';
import { useRouter } from 'expo-router';

// Hook personalizado para manejar el filtrado
type Submission = {
  id: number;
  title: string;
  content: string;
  created_at: string;
  created_by: { username: string };
  total_votes: number;
  url?: string;
};

function useFilteredSubmissions(submissions: Submission[]) {
  const [query, setQuery] = useState('');
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>(submissions);

  const filterSubmissions = () => {
    if (!query.trim()) {
      setFilteredSubmissions(submissions);
    } else {
      const lowerQuery = query.toLowerCase();
      setFilteredSubmissions(
        submissions.filter((submission) => submission.title.toLowerCase().includes(lowerQuery))
      );
    }
  };

  useEffect(() => {
    filterSubmissions();
  }, [submissions]);

  return { query, setQuery, filteredSubmissions, filterSubmissions };
}

const loggedInUser = { apiKey: "Tcs5cIBgIysU9IswpHxPX-R21e0faN3fGmkdp4-EOlE", username: "jose" }; // Datos del usuario logueado

export default function HomeScreen() {
  const [submissions, setSubmissions] = useState<Submission[]>([]); // Estado para guardar las submissions
  const [error, setError] = useState<string | null>(null); // Estado para errores

  const { query, setQuery, filteredSubmissions, filterSubmissions } = useFilteredSubmissions(submissions);
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

  const handleSearchSubmit = () => {
    filterSubmissions();
  };


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Submissions</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      {/* Botón para redirigir a crear submission */}
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => router.push('/createSubmission')} // Ruta de la nueva pestaña
      >
        <Text style={styles.createButtonText}>Create New Submission</Text>
      </TouchableOpacity>

      {/* Buscador */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search submissions by title..."
        placeholderTextColor="#999"
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={handleSearchSubmit} // Buscar al presionar Enter
      />

      {filteredSubmissions.map((submission, index) => (
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
            <Text style={styles.separator}>|</Text>
            <Link 
              style={styles.action}
              key={submission.id} 
              href={`/${submission.id}?id=${submission.id}`}
            >
              Discuss
            </Link>
            {/* Botón Edit solo si el usuario es el creador */}
            {submission.created_by.username === loggedInUser.username && (
              <Link
                style={styles.action} 
                key={submission.id} 
                href={`/editSubmission/${submission.id}?id=${submission.id}`}
              >
                Edit
              </Link>
            )}

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

  searchBar: {
    backgroundColor: '#ffffff',
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
    fontSize: 16,
  },

  createButton: {
    backgroundColor: '#ff6600',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignSelf: 'center',
    marginBottom: 20,
  },
  
  createButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

