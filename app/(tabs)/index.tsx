import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, Text, View, TouchableOpacity, TextInput, Linking } from 'react-native';
import axios from 'axios';
import { Link } from 'expo-router';
import { useRouter } from 'expo-router';
import { useGlobalContext } from "@/contexts/GlobalContext";
import { useFocusEffect } from '@react-navigation/native';
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


export default function HomeScreen() {
  const [submissions, setSubmissions] = useState<Submission[]>([]); // Estado para guardar las submissions
  const [visibleSubmissions, setVisibleSubmissions] = useState<Submission[]>([]);
  const [hiddenSubmissions, setHiddenSubmissions] = useState<any[]>([]); // Estado para las submissions ocultas
  
  const [error, setError] = useState<string | null>(null); // Estado para errores
  const { loggedUser } = useGlobalContext(); // Accede al usuario logueado


  const { query, setQuery, filteredSubmissions, filterSubmissions } = useFilteredSubmissions(visibleSubmissions);
  const router = useRouter();

  const [message, setMessage] = useState<string | null>(null); // Estado para el mensaje

  const fetchSubmissions = () => {
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
  };

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

  useEffect(() => {
    if (!loggedUser) return;

    const fetchHiddenSubmissions = async () => {
      try {
        const response = await axios.get('https://proyecto-asw-render.onrender.com/api/hidden/', {
          headers: {
            Authorization: loggedUser?.apiKey, // Usar el token del usuario
          },
        });
        setHiddenSubmissions(response.data); // Guardar las submissions ocultas
      } catch (err) {
        console.error('Error al cargar las submissions ocultas', err);
      }
    };

    fetchHiddenSubmissions();
  }, [loggedUser]);

  const fetchHiddenSubmissions = async () => {
    if (!loggedUser) return;
    try {
      const response = await axios.get('https://proyecto-asw-render.onrender.com/api/hidden/', {
        headers: {
          Authorization: loggedUser?.apiKey,
        },
      });
      setHiddenSubmissions(response.data);
    } catch (err) {
      console.error('Error al cargar las submissions ocultas', err);
    }
  };

 

  useEffect(() => {
    // Filtrar las submissions para mostrar solo las que no están ocultas para el usuario
    const visibleSubmissions = submissions.filter((submission) => {
      return !hiddenSubmissions.some((hidden) => hidden.submission.id === submission.id);
    });
    setVisibleSubmissions(visibleSubmissions); // Actualizar las submissions visibles
  }, [submissions, hiddenSubmissions]);

  const handleSearchSubmit = () => {
    filterSubmissions();
  };

  // Función para manejar la adición a favoritos
  const handleAddToFavorites = (submissionId: number) => {
    if (submissionId) {
      axios
        .post(`https://proyecto-asw-render.onrender.com/api/submissions/${submissionId}/addFav/`, {
          "title": "string",
          "url": "string",
          "content": "string"
        },
        {
          headers: {
            Authorization: loggedUser?.apiKey,
          },
        })
        .then((response) => {
          console.log('Favorite added:', response.data);
          setMessage(response.data.message); // Mostrar mensaje de éxito
        })
        .catch((err) => {
          console.error('Error adding to favorites:', err);
          setMessage('Error adding to favorites. Please try again later.'); // Mensaje de error
        });
    }
  };

  const handleHide = (submissionId: number) => {
    if (submissionId) {
      axios
        .post(
          'https://proyecto-asw-render.onrender.com/api/hidden/',
          { submission_id: submissionId },
          {
            headers: {
              Authorization: loggedUser?.apiKey, // Usar el token del usuario
            },
          }
        )
        .then((response) => {
          console.log('Submission hidden:', response.data);
          setMessage(response.data.message); // Mostrar mensaje de éxito
          
          // Actualizar el estado para ocultar la submission
          setHiddenSubmissions((prev) => [...prev, { submission: { id: submissionId } }]);
        })
        .catch((err) => {
          console.error('Error hiding submission:', err);
          setMessage('Error hiding submission. Please try again later.'); // Mensaje de error
        });
    }
  };

  const handleVoteSubmission = (submissionId: number) => {
    if (submissionId) {
      axios
        .post(`https://proyecto-asw-render.onrender.com/api/submissions/${submissionId}/vote/`, {
          "title": "string",
          "url": "string",
          "content": "string"
        },
        {
          headers: {
            Authorization: loggedUser?.apiKey,
          },
        })
        .then((response) => {
          console.log('Vote was:', response.data);
          setMessage(response.data.message); // Mostrar mensaje de éxito
          fetchSubmissions();
          fetchHiddenSubmissions();


        })
        .catch((err) => {
          console.error('Error votting:', err);
          setMessage('Error votting. Please try again later.'); // Mensaje de error
        });
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchSubmissions();
      fetchHiddenSubmissions();
    }, [loggedUser]) // Dependencia
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Submissions</Text>
      {error && <Text style={styles.error}>{error}</Text>}

    
      {/* Botón para redirigir a crear submission */}
      {loggedUser !== null && (
      <Link 
              style={styles.createButton}
              href={`/createSubmission?loggedInUser=${loggedUser?.apiKey}`}
            >
              <Text style={styles.createButtonText}>Create New Submission</Text>
      </Link>
      )}

      {message && <Text style={styles.error}>{message}</Text>}
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
          <Link 
            style={styles.action}
            key={submission.created_by.id} 
            href={`/users/${submission.created_by.id}?id=${submission.created_by.id}`}
          > {submission.created_by.username} </Link>

            <Text style={styles.cardMeta}>
              {'at '}
              {new Date(submission.created_at).toLocaleDateString()} {'with '}
              {submission.total_votes} votes
            </Text>
            <Text style={styles.separator}>|</Text>
            <Link 
              style={styles.action}
              key={submission.id} 
              href={`/${submission.id}?id=${submission.id}&loggedInUser=${loggedUser?.apiKey}&userId=${loggedUser?.id}`}
            >
              Discuss
            </Link>

            {/* Botón Edit solo si el usuario es el creador */}
            {submission.created_by.username === loggedUser?.username && (
              <><Text style={styles.separator}>|</Text><Link
                style={styles.action}
                key={submission.id}
                href={`/editSubmission/${submission.id}?id=${submission.id}&loggedInUser=${loggedUser?.apiKey}`}
              >
                Edit
              </Link></>
            )}
             

            {/* Botón Add to Favorites solo si el usuario no es el creador */}
            {submission.created_by.username !== loggedUser?.username && loggedUser !== null && (
                <><Text style={styles.separator}>|</Text><TouchableOpacity
                onPress={() => handleAddToFavorites(submission.id)}
              >
                <Text style={styles.action}>Add to Favorites</Text>
              </TouchableOpacity></>
            )}
            

            {loggedUser !== null && (
                <><Text style={styles.separator}>|</Text><><TouchableOpacity
                onPress={() => handleHide(submission.id)}
              >
                <Text style={styles.action}>Hide</Text>
              </TouchableOpacity></></>
            )}

            {/* Botón Vote solo si el usuario no es el creador */}
            {submission.created_by.username !== loggedUser?.username && loggedUser !== null && (
                          <><Text style={styles.separator}>|</Text><TouchableOpacity
                onPress={() => handleVoteSubmission(submission.id)}
              >
                <Text style={styles.action}>Vote</Text>
              </TouchableOpacity></>
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
