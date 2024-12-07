import React, { useEffect, useState } from 'react'; 
import { StyleSheet, Text, View, ScrollView, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useLocalSearchParams } from 'expo-router';

export default function SubmissionDetailScreen() {
  const { id } = useLocalSearchParams() as { id: string };
  const [submission, setSubmission] = useState(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`https://proyecto-asw-render.onrender.com/api/submissions/${id}/`)
      .then((response) => {
        setSubmission(response.data);
        setLoading(false);  
      })
      .catch((err) => {
        setError('Error al cargar los detalles de la submission');
        console.error(err);
        setLoading(false);  
      });
  }, [id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {error && <Text style={styles.error}>{error}</Text>}
      {submission ? (
        <>
          <Text style={styles.title}>{submission.title}</Text>
          <Text style={styles.cardMeta}>
            Created by: <Text style={styles.username}>{submission.created_by.username}</Text> •{' '}
            {formatDate(submission.created_at)}
          </Text>
          <Text style={styles.cardDescription}>
            {submission.content || 'No description available'}
          </Text>
          <Text style={styles.cardVotes}>Total votes: {submission.total_votes}</Text>
        </>
      ) : (
        <Text style={styles.error}>No details available for this submission. { id || "no va" }</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 20,
  },
  error: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    height: '100%',
  },
  cardDescription: {
    fontSize: 18,
    color: '#495057',
    lineHeight: 26,
    marginBottom: 20,
  },
  cardMeta: {
    fontSize: 16,
    color: '#868e96',
    marginBottom: 16,
  },
  cardVotes: {
    fontSize: 16,
    color: '#495057',
    fontWeight: '500',
    marginTop: 10,
  },
  username: {
    fontWeight: '600',
    color: '#007bff',
  },
});
