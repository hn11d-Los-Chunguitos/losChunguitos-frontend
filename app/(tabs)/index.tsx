import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, Text, View, TouchableOpacity, TextInput, Linking } from 'react-native';
import axios from 'axios';
import { Link } from 'expo-router';
import { useRouter } from 'expo-router';
import { useGlobalContext } from "@/contexts/GlobalContext";
import RNPickerSelect from 'react-native-picker-select';

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

const users = [
  { id_user: '1', label: 'jose', value: 'Tcs5cIBgIysU9IswpHxPX-R21e0faN3fGmkdp4-EOlE' },
  { id_user: '2', label: 'kat', value: 'j3RmWeSBYq1Pa1ePVkrnguoXlJFAx65dM3A-Y6Pp594' },
  { id_user: '4', label: 'raul', value: 'ae-Ujr4mrChtWI3VVxbWh-XSCNcgoDk9NpGG9fABRx4' }
];

export default function HomeScreen() {
  const [submissions, setSubmissions] = useState<Submission[]>([]); // Estado para guardar las submissions
  const [visibleSubmissions, setVisibleSubmissions] = useState<Submission[]>([]);
  const [hiddenSubmissions, setHiddenSubmissions] = useState<any[]>([]); // Estado para las submissions ocultas
  
  const [error, setError] = useState<string | null>(null); // Estado para errores
  const { loggedUser } = useGlobalContext(); // Accede al usuario logueado


  const { query, setQuery, filteredSubmissions, filterSubmissions } = useFilteredSubmissions(visibleSubmissions);
  const router = useRouter();

  const [message, setMessage] = useState<string | null>(null); // Estado para el mensaje
  const [loggedInUser, setLoggedInUser] = useState<{ id_user: string, label: string, value: string }>({
    id_user: '',
    label: '',
    value: '',
  });
  const [selectedUser, setSelectedUser] = useState<string>(''); // Solo almacena el value

  const handleUserSelection = (value: string) => {
    const selected = users.find(user => user.value === value);
    if (selected) {
      setLoggedInUser({ id_user: selected.id_user, label: selected.label, value: selected.value }); // Asignar label y value al usuario logueado
    }
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
    if (!loggedInUser) return;

    const fetchHiddenSubmissions = async () => {
      try {
        const response = await axios.get('https://proyecto-asw-render.onrender.com/api/hidden/', {
          headers: {
            Authorization: loggedInUser.value, // Usar el token del usuario
          },
        });
        setHiddenSubmissions(response.data); // Guardar las submissions ocultas
      } catch (err) {
        console.error('Error al cargar las submissions ocultas', err);
      }
    };

    fetchHiddenSubmissions();
  }, [loggedInUser]);

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
            Authorization: loggedInUser.value,
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
              Authorization: loggedInUser.value, // Usar el token del usuario
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
            Authorization: loggedInUser.value,
          },
        })
        .then((response) => {
          console.log('Vote was:', response.data);
          setMessage(response.data.message); // Mostrar mensaje de éxito
        })
        .catch((err) => {
          console.error('Error votting:', err);
          setMessage('Error votting. Please try again later.'); // Mensaje de error
        });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Submissions</Text>
      <Text style={styles.title}>Welcome, {loggedUser?.username}!</Text>
      <Text style={styles.title}>apiKey: {loggedUser?.apiKey}</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      {loggedInUser.label !== '' && (
      <Link
                style={styles.action}
                href={`/favoriteSubmissions?loggedInUser=${loggedInUser.value}`}
              >
                Submissions Favoritas
              </Link>)}
      {loggedInUser.label !== '' && (
      <Link
                style={styles.action}
                href={`/hiddenSubmissions?loggedInUser=${loggedInUser.value}`}
              >
                Hidden Submissions
              </Link> )}

      {/* Dropdown para seleccionar un usuario */}
      <div>
      <RNPickerSelect
        onValueChange={(value) => {
          setSelectedUser(value); // Guardamos solo el value seleccionado
          handleUserSelection(value); // Asignamos label y value a loggedInUser
        }}
        items={users}
        value={selectedUser} // Usamos el value seleccionado
      />

      {/* Mostrar el usuario logueado */}
      <div> 
        <p>Usuario logueado:</p>
        <p>Username: {loggedInUser.label}</p>
        <p>ApiKey: {loggedInUser.value}</p>
        {message && <p>{message}</p>}
      </div>
    </div>
    
      {/* Botón para redirigir a crear submission */}
      <Link 
              style={styles.createButton}
              href={`/createSubmission?loggedInUser=${loggedInUser.value}`}
            >
              <Text style={styles.createButtonText}>Create New Submission</Text>
      </Link>

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
              href={`/${submission.id}?id=${submission.id}&loggedInUser=${loggedInUser.value}&userId=${loggedInUser.id_user}`}
            >
              Discuss
            </Link>

            {/* Botón Edit solo si el usuario es el creador */}
            {submission.created_by.username === loggedInUser.label && (
              <Link
                style={styles.action}
                key={submission.id}
                href={`/editSubmission/${submission.id}?id=${submission.id}&loggedInUser=${loggedInUser.value}`}
              >
                Edit
              </Link>
            )}

            {/* Botón Add to Favorites solo si el usuario no es el creador */}
            {submission.created_by.username !== loggedInUser.label && loggedInUser.label !== '' && (
              <TouchableOpacity
                onPress={() => handleAddToFavorites(submission.id)}
              >
                <Text style={{ color: '#ff6600' }}>Add to Favorites</Text>
              </TouchableOpacity>
            )}
            {loggedInUser.label !== '' && (
              <TouchableOpacity
                onPress={() => handleHide(submission.id)}
              >
                <Text style={{ color: '#ff6600' }}>Hide</Text>
              </TouchableOpacity>
            )}
            {/* Botón Vote solo si el usuario no es el creador */}
            {submission.created_by.username !== loggedInUser.label && loggedInUser.label !== '' && (
              <TouchableOpacity
                onPress={() => handleVoteSubmission(submission.id)}
              >
                <Text style={{ color: '#ff6600' }}>Vote</Text>
              </TouchableOpacity>
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
