import React, { useEffect, useState } from 'react';  
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, TextInput, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Link } from 'expo-router';

interface Comment {
    id: number;
    content: string;
    created_by: string;
    created_at: string;
    total_votes: number;
    replies?: Comment[];
}


export default function ReplyCommentScreen() {
    const params = useLocalSearchParams();
  const commentId = params.id as string;
  const loggedInUser = params.loggedInUser as string | undefined;
  const submissionId = params.submission as string | undefined;
  const userId = params.userId as string | undefined;

  const [comment, setComment] = useState<Comment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get(`https://proyecto-asw-render.onrender.com/api/comments/${commentId}/`)
      .then((response) => {
        console.log('Submission data:', response.data);
        setComment(response.data);
        console.log(response.data)
        setLoading(false);  
      })
      .catch((err) => {
        setError('Error al cargar los detalles de la submission');
        console.error(err);
        setLoading(false);  
      });
  }, [commentId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  // Explicitly type the comments parameter
  const renderComments = (comments: Comment[], depth = 0) => {
    return comments.map((comment) =>  {
      //location.reload();
      const isAuthor = userId === comment.created_by.toString(); // Verifica si el usuario es el autor
      return(
      <View key={comment.id} style={[styles.comment, { marginLeft: depth * 16 }]}>
        <Text style={styles.commentContent}>{comment.content}</Text>
        <Text style={styles.commentMeta}>
          By User {comment.created_by} • {formatDate(comment.created_at)}
        </Text>
        <View style={styles.commentVoteContainer}>
          <Text style={styles.voteCount}>
            {comment.total_votes || 0} votos
          </Text>
          <TouchableOpacity 
              style={styles.favoriteButton} 
              onPress={() => handleCommentFavorite(comment.id)}
            >
              <Text style={styles.favoriteButtonText}>🤍 Favorito</Text>
            </TouchableOpacity>
            <View style={styles.buttonRow}>
            <Link
              href={`/replyComment/${comment.id}?id=${comment.id}&loggedInUser=${loggedInUser}&submission=${submissionId}&userId=${userId}`}
              style={[styles.editButton, styles.action]} 
            >
              <Text style={styles.editButtonText}>📜 Reply</Text>
            </Link>
            </View>

        </View>
        {comment.replies && comment.replies.length > 0 && (
          <View style={styles.repliesContainer}>
            {renderComments(comment.replies, depth + 1)}
          </View>
        )}
      </View>
    );
  });
  };

  const handleCommentFavorite = async (commentId: number) => {
    try {
      const response = await axios.post(
        `https://proyecto-asw-render.onrender.com/api/comments/${commentId}/addFav/`, 
        {}, // El cuerpo vacío, si no necesitas enviar datos adicionales
        {
          headers: {
            Authorization: loggedInUser, 
          },
        }
      );
      console.log('Favorited correctly:', response.data);
    } catch (err) {
      console.error('Error making favorite comment:', err);
      if (err.response) {
        console.log('Server response:', err.response.data);
      }
    }
  };

  const handleSubmit = async (commentId: number) => {
    if (!content.trim()) {
      setErrorMessage('El contenido no puede estar vacío.');
      return;
    }
    console.log(content);
    console.log(commentId)
  
    // Verificar si el usuario está autenticado
    if (!loggedInUser) {
      setErrorMessage('Usuario no autenticado. Por favor, inicie sesión.');
      return;
    }
  
    const payload = {
      submission: submissionId,  // ID de la submission
      content,                   // Contenido del comentario
    };
    console.log(payload);  
    try {
      // Hacer la solicitud POST para agregar una respuesta
      const response = await axios.post(
        `https://proyecto-asw-render.onrender.com/api/comments/${commentId}/reply/`,
        payload,
        {
          headers: {
            Authorization: loggedInUser,  // Encabezado con el token de autorización
          },
        }
      );
  
      if (response.status === 201) {
        setContent('');          // Limpiar el campo de contenido
        setErrorMessage('');     // Limpiar el mensaje de error
        Alert.alert('Éxito', 'El comentario fue enviado correctamente.');
        location.reload();
      }
    } catch (err: any) {
      // Manejo de errores de la respuesta
      if (err.response) {
        const backendError = err.response.data?.message || 'Error al enviar el comentario.';
        setErrorMessage(backendError);
      } else {
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
  const depth = 0;
  return (
    <ScrollView style={styles.page}>
      {/* Comentario Principal */}
      <View key={comment.id} style={[styles.comment, { marginLeft: depth * 16 }]}>
        <Text style={styles.commentContent}>{comment.content}</Text>
        <Text style={styles.commentMeta}>
          By User {comment?.created_by} • {formatDate(comment.created_at)}
        </Text>
  
        {/* Botones de Votar, Favorito, Reply */}
        <View style={styles.commentVoteContainer}>
          <Text style={styles.voteCount}>
            {comment.total_votes || 0} votos
          </Text>
  
          <TouchableOpacity 
            style={styles.favoriteButton} 
            onPress={() => handleCommentFavorite(comment.id)}
          >
            <Text style={styles.favoriteButtonText}>🤍 Favorito</Text>
          </TouchableOpacity>
  
          {/* Botón Reply */}
          <View style={styles.buttonRow}>
            <Link
              href={`/replyComment/${comment.id}?id=${comment.id}&loggedInUser=${loggedInUser}&submission=${submissionId}`}
              style={[styles.editButton, styles.action]}
            >
              <Text style={styles.editButtonText}>📜 Reply</Text>
            </Link>
          </View>
        </View>
  
        {/* Replies */}
        <Text style={styles.commentsTitle}>Comments:</Text>
        {comment.replies && comment.replies.length > 0 ? (
          <View style={styles.repliesContainer}>
            {renderComments(comment.replies, depth + 1)} {/* Renderiza las replies */}
          </View>
        ) : (
          <Text style={styles.noComments}>No comments yet.</Text>
        )}
      </View>
  
      {/* Responder */}
      <View style={styles.replyContainer}>
        <TextInput
          style={styles.replyInput}
          placeholder="Escribe tu respuesta"
          value={content}
          onChangeText={setContent}
          numberOfLines={4}
        />
        <TouchableOpacity style={styles.replyButton} onPress={() => handleSubmit(commentId)}>
          <Text style={styles.replyButtonText}>Reply</Text>
        </TouchableOpacity>
      </View>
      <Link href={`/`}
      style={styles.backButton}> 
        <Text style={styles.backButtonText}> Return </Text>
      </Link>
    </ScrollView>
  );
  
}

const styles = StyleSheet.create({
    page: {
        flex: 1, // Asegura que la vista ocupe toda la pantalla
        backgroundColor: '#ffffff', // Fondo blanco
    },
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
    commentVoteContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
    },
    voteButton: {
      backgroundColor: '#f0f0f0',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 4,
      marginRight: 10,
    },
    voteButtonText: {
      color: '#000',
      fontSize: 12,
    },
    voteCount: {
      fontSize: 12,
      color: '#828282',
    },
    favoriteButton: {
      backgroundColor: '#f0f0f0',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 4,
      marginRight: 10,
    },
    favoriteButtonText: {
      color: '#000',
      fontSize: 12,
    },
    action: {
      color: '#ff6600', // Links en naranja
      fontSize: 12,
    },
    // Botón para Edit/Delete
    editButton: {
        paddingVertical: 5,
        paddingHorizontal: 10,
        backgroundColor: '#f0f0f0', // Fondo rojo claro
        borderRadius: 4,
        marginRight: 10,
    },

    // Texto dentro del botón Edit/Delete
    editButtonText: {
        color: '#000', // Texto rojo oscuro
        fontSize: 12,
        textAlign: 'center',
    },
    buttonRow: {
        flexDirection: 'row', // Organiza los botones horizontalmente
        alignItems: 'center', // Alinea verticalmente los botones
        marginTop: 8,
    },
    replyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    replyInput: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        borderRadius: 4,
        paddingHorizontal: 10,
        paddingVertical: 8,
        fontSize: 14,
        marginRight: 8,
    },
    replyButton: {
        backgroundColor: '#007bff',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 4,
    },
    replyButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    backButton: {
        padding: 10,
        backgroundColor: '#ff6347', // Color del botón (puedes cambiarlo a cualquier color)
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backButtonText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

