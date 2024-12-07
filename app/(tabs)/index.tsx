import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, Text, View } from 'react-native';
import axios from 'axios';

export default function HomeScreen() {
  const [submissions, setSubmissions] = useState([]); // Estado para guardar las submissions
  const [error, setError] = useState<string | null>(null); // Estado para errores

  useEffect(() => {
    axios
      .get('https://proyecto-asw-render.onrender.com/api/submissions')
      .then((response) => {
        setSubmissions(response.data); 
      })
      .catch((err) => {
        setError('Error al cargar las submissions');
        console.error(err);
        setSubmissions([]);
      });
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Submissions</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      {submissions.map((submission, index) => (
        <View key={index} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{submission.title}</Text>
          </View>
          <Text style={styles.cardDescription}>{submission.content}</Text>
          <Text style={styles.cardMeta}>
            Created by: {submission.created_by.username} on {new Date(submission.created_at).toLocaleDateString()}
          </Text>
          <Text style={styles.cardVotes}>Total votes: {submission.total_votes}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f4f8',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  error: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#444',
  },
  cardDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    marginBottom: 8,
  },
  cardMeta: {
    fontSize: 14,
    color: '#888',
  },
  cardVotes: {
    fontSize: 14,
    color: '#444',
    fontWeight: 'bold',
    marginTop: 4,
  },
});
