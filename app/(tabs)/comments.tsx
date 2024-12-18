import React, { useEffect, useState } from 'react'; 
import { StyleSheet, ScrollView, Text, View, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import { Link } from 'expo-router';
import { useRouter } from 'expo-router';
import { useGlobalContext } from "@/contexts/GlobalContext";

export default function CommentScreen() {
  const [comment, setComment] = useState([]); // Estado para guardar las submissions
  const [error, setError] = useState<string | null>(null); // Estado para errores
  const { loggedUser } = useGlobalContext(); // Accede al usuario logueado
  

  const router = useRouter();
  console.log(loggedUser?.username)

  useEffect(() => {
    axios
      .get('https://proyecto-asw-render.onrender.com/api/comments')
      .then((response) => {
        setComment(response.data);
        console.log('comment data:', response.data);
      })
      .catch((err) => {
        setError('Error al cargar las comment');
        console.error(err);
        setComment([]);
      });
  }, []);

  const handleCommentFavorite = async (commentId: number) => {
    if (!loggedUser) {
      Alert.alert('Error', 'Debes iniciar sesión para votar');
      return;
    }
    try {
      const response = await axios.post(
        `https://proyecto-asw-render.onrender.com/api/comments/${commentId}/addFav/`, 
        {}, // El cuerpo vacío, si no necesitas enviar datos adicionales
        {
          headers: {
            Authorization: loggedUser?.apiKey, 
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

  const handleVoteComment = async(commentId: number) => {
    if (!loggedUser) {
      Alert.alert('Error', 'Debes iniciar sesión para votar');
      return;
    }
    try {
      const response = await axios.post(
        `https://proyecto-asw-render.onrender.com/api/comments/${commentId}/vote/`,
        { 
          comment: commentId 
        },
        {
          headers: {
            Authorization: loggedUser?.apiKey,
          },
        }
      );

      if (response.status === 201) {
        console.log(response.data);
        console.log('Voto añadido correctamente.')
        Alert.alert('Éxito', 'Voto registrado correctamente');
    }
  } catch (err: any) {
    console.error('Error al votar:', err);
    
    // Manejar diferentes tipos de errores
    if (err.response) {
      if (err.response.status === 400) {
        Alert.alert('Error', 'Ya has votado este comentario');
      } else {
        Alert.alert('Error', 'No se pudo registrar el voto');
      }
    } else {
      Alert.alert('Error', 'No se pudo conectar al servidor');
    }
    }
  };


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Comments</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      {comment.map((comment, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.cardTitle}>{comment.content}</Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardMeta}>
              {comment.created_by.username} {'at '}
              {new Date(comment.created_at).toLocaleDateString()}
            </Text>
            <Text style={styles.voteCount}>{comment.total_votes} votos</Text>
            <Text style={styles.separator}>|</Text>
            <Link 
            style={styles.link}
            key={comment.id} 
            href={`/replyComment/${comment.id}?id=${comment.id}&loggedInUser=${loggedUser?.apiKey}&submission=${comment.submission}&userId=${loggedUser?.id}`}
          >
            Reply
          </Link>
          <Text style={styles.separator}>|</Text>
          {comment.created_by.username === loggedUser?.username && (
            <Link 
              style={styles.link}
              key={comment.id} 
              href={`/editComment/${comment.id}?id=${comment.id}&loggedInUser=${loggedUser?.apiKey}&submission=${comment.submission}&userId=${comment.created_by}`}
            >
              Edit
            </Link>
          )}
          {comment.created_by.username !== loggedUser?.username && loggedUser?.username !== '' && (
            <View style={styles.buttonRow}>
              <TouchableOpacity
                onPress={() => handleVoteComment(comment.id)}
              >
                <Text style={styles.action}>Vote</Text>
              </TouchableOpacity>

              <Text style={styles.separator}>|</Text>

              <TouchableOpacity
                onPress={() => handleCommentFavorite(comment.id)}
              >
                <Text style={styles.action}>Favorite</Text>
              </TouchableOpacity>
            </View>
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
      backgroundColor: '#f6f6ef', 
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
      gap: 10,
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
    separator: {
      marginHorizontal: 3,
      color: '#eeeeee', // Same color as cardMeta for consistency
    },
    action: {
      color: '#ff6600', // Links en naranja
      fontSize: 12,
    },
    buttonRow: {
      flexDirection: 'row', // Organiza los botones horizontalmente
      alignItems: 'center', // Alinea verticalmente los botones
      marginTop: 8,
    },
    voteCount: {
      fontSize: 12,
      color: '#828282',
    },
  });

