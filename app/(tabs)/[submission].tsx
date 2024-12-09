import React, { useEffect, useState } from 'react';  
import { StyleSheet, Text, View, ScrollView, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useLocalSearchParams } from 'expo-router';

export default function SubmissionDetailScreen() {
  const { id } = useLocalSearchParams() as { id: string };
  const [submission, setSubmission] = useState<any>(null); // Permite manejar comentarios y respuestas
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`https://proyecto-asw-render.onrender.com/api/submissions/${id}/`)
      .then((response) => {
        console.log('Submission data:', response.data);
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

  // Función recursiva para renderizar comentarios y sus replies
  const renderComments = (comments: any[], depth = 0) => {
    return comments.map((comment) => (
      <View key={comment.id} style={[styles.comment, { marginLeft: depth * 16 }]}>
        <Text style={styles.commentContent}>{comment.content}</Text>
        <Text style={styles.commentMeta}>
          By User {comment.created_by} • {formatDate(comment.created_at)}
        </Text>
        {/* Renderizar replies si existen */}
        {comment.replies && comment.replies.length > 0 && (
          <View style={styles.repliesContainer}>
            {renderComments(comment.replies, depth + 1)}
          </View>
        )}
      </View>
    ));
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

          {/* Renderizar comentarios */}
          <Text style={styles.commentsTitle}>Comments:</Text>
          {submission.comments && submission.comments.length > 0 ? (
            renderComments(submission.comments)
          ) : (
            <Text style={styles.noComments}>No comments yet.</Text>
          )}
        </View>
      ) : (
        <Text style={styles.error}>No details available for this submission.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f6f6ef', // Fondo beige
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000', // Título en negro
    marginBottom: 12,
    textAlign: 'center',
  },
  error: {
    fontSize: 16,
    color: '#ff6600', // Mensaje de error en naranja
    textAlign: 'center',
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f6f6ef',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 4,
    padding: 16,
    marginBottom: 12,
    width: '100%',
    maxWidth: 600,
    borderWidth: 1,
    borderColor: '#e0e0e0', // Borde sutil para las tarjetas
  },
  cardDescription: {
    fontSize: 14,
    color: '#000000',
    lineHeight: 22,
    marginBottom: 12,
  },
  cardMeta: {
    fontSize: 12,
    color: '#828282', // Meta datos en gris claro
    marginBottom: 8,
  },
  cardVotes: {
    fontSize: 14,
    color: '#000000',
    fontWeight: 'bold',
    marginTop: 8,
  },
  username: {
    fontWeight: 'bold',
    color: '#ff6600', // Nombre del usuario en naranja
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 16,
    marginBottom: 8,
  },
  comment: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  commentContent: {
    fontSize: 14,
    color: '#000000',
    marginBottom: 4,
  },
  commentMeta: {
    fontSize: 12,
    color: '#828282',
  },
  repliesContainer: {
    marginTop: 8,
    marginLeft: 16, // Sangrado para replies
    borderLeftWidth: 1,
    borderLeftColor: '#e0e0e0', // Línea para separar replies
    paddingLeft: 8,
  },
  noComments: {
    fontSize: 14,
    color: '#828282',
    textAlign: 'center',
  },
});
