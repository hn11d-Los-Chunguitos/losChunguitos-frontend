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
        <View style={styles.card}>
          <Text style={styles.title}>{submission.title}</Text>
          <Text style={styles.cardMeta}>
            Created by: <Text style={styles.username}>{submission.created_by.username}</Text> •{' '}
            {formatDate(submission.created_at)}
          </Text>
          <Text style={styles.cardDescription}>
            {submission.content || 'No description available'}
          </Text>
          <Text style={styles.cardVotes}>Total votes: {submission.total_votes}</Text>
        </View>
      ) : (
        <Text style={styles.error}>No details available for this submission. {id || "no va"}</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f1f3f5',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 15,
    textAlign: 'center',
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
    backgroundColor: '#f1f3f5',
    height: '100%',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    width: '100%',
    maxWidth: 600,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
  },
  cardDescription: {
    fontSize: 18,
    color: '#495057',
    lineHeight: 26,
    marginBottom: 20,
    textAlign: 'left',
  },
  cardMeta: {
    fontSize: 16,
    color: '#868e96',
    marginBottom: 16,
    textAlign: 'left',
  },
  cardVotes: {
    fontSize: 16,
    color: '#495057',
    fontWeight: '500',
    marginTop: 10,
    textAlign: 'left',
  },
  username: {
    fontWeight: '600',
    color: '#007bff',
  },
});
