import React, { useEffect, useState } from 'react';  
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, TextInput, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';

// Define clear interfaces for type safety
interface Submission {
  id: string;
  title: string;
  content: string;
  created_by: {
    username: string;
  };
  created_at: string;
  total_votes: number;
  comments: Comment[];
}

interface Comment {
  id: string;
  content: string;
  created_by: string;
  created_at: string;
  replies?: Comment[];
}

export default function SubmissionDetailScreen() {
  // Type the parameters more precisely
  const params = useLocalSearchParams();
  const id = params.id as string;
  const loggedInUser = params.loggedInUser as string | undefined;

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  // Explicitly type the comments parameter
  const renderComments = (comments: Comment[], depth = 0) => {
    return comments.map((comment) => (
      <View key={comment.id} style={[styles.comment, { marginLeft: depth * 16 }]}>
        <Text style={styles.commentContent}>{comment.content}</Text>
        <Text style={styles.commentMeta}>
          By User {comment.created_by.username} • {formatDate(comment.created_at)}
        </Text>
        {comment.replies && comment.replies.length > 0 && (
          <View style={styles.repliesContainer}>
            {renderComments(comment.replies, depth + 1)}
          </View>
        )}
      </View>
    ));
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      setErrorMessage('El contenido no puede estar vacío.');
      return;
    }

    // Add a check for loggedInUser
    if (!loggedInUser) {
      setErrorMessage('Usuario no autenticado. Por favor, inicie sesión.');
      return;
    }

    const payload = { 
      submission: id,
      parent: null,
      content, 
    };

    try {
        const response = await axios.post('https://proyecto-asw-render.onrender.com/api/comments/',
            payload,
            {
                headers: {
                    Authorization: loggedInUser,
                },
            }
        );
        if (response.status === 201) {
            setContent('');
            setErrorMessage(null);
            Alert.alert('Éxito', 'El comentario fue enviado correctamente.');

            setSubmission((prevSubmission) => {
              if (!prevSubmission) return null;
              return {
                ...prevSubmission,
                comments: [...prevSubmission.comments, response.data],
              };
            });
        }
    }
    catch (err: any) {
        if (err.response) {
            const backendError = err.response.data?.message || 'Error al enviar el comentario.';
            setErrorMessage(backendError);
        }
        else {
            setErrorMessage('No se pudo conectar al servidor.');
        }
    }
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

          <Text style={styles.commentsTitle}>Comments:</Text>
          {submission.comments && submission.comments.length > 0 ? (
            renderComments(submission.comments)
          ) : (
            <Text style={styles.noComments}>No comments yet.</Text>
          )}

          <Text style={styles.formTitle}>Agregar un Comentario:</Text>
          <TextInput
            style={styles.input}
            placeholder="Escribe tu comentario aquí..."
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Enviar Comentario</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={styles.error}>No details available for this submission.</Text>
      )}
    </ScrollView>
  );
}

// ... (styles remain the same as in the original file)

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
  formTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 4,
    padding: 8,
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#ff6600',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
