import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function CreateSubmission() {
  const { loggedInUser } = useLocalSearchParams();
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [content, setContent] = useState('');
  const [mode, setMode] = useState<'url' | 'content'>('url'); // Selector para url o content
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isValidUrl = (url) => {
    try {
      new URL(url); // Si la URL es válida, no lanzará excepción
      return true;
    } catch (error) {
      return false; // Si lanza una excepción, la URL no es válida
    }
  };
  

  const handleSubmit = async () => {
    // Validar entrada
    if (!title.trim()) {
      setErrorMessage('El título es obligatorio.');
      return;
    }
  
    if (mode === 'url' && !url.trim()) {
      setErrorMessage('La URL no puede estar en blanco.');
      return;
    }

    if (mode === 'url' && !isValidUrl(url.trim())) {
      setErrorMessage('Debes proporcionar una URL válida.');
      return;
    }
  
    if (mode === 'content' && !content.trim()) {
      setErrorMessage('Debes proporcionar contenido.');
      return;
    }
  
    // Construir el payload
    const payload = {
      title,
      url: mode === 'url' ? url : undefined,
      content: mode === 'content' ? content : undefined,
    };
  
    try {
      const response = await axios.post(
        'https://proyecto-asw-render.onrender.com/api/submissions/',
        payload,
        {
          headers: {
            Authorization: loggedInUser,
          },
        }
      );
  
      if (response.status === 201) {
        setErrorMessage(null); // Limpiar errores previos
        router.push('/'); // Redirigir a la página principal
      }
    } catch (err) {
      if (err.response) {
      // Accede a los datos devueltos por el backend
      const backendError = 'Error url duplicada.';
      setErrorMessage(backendError);
      } else {
      setErrorMessage('No se pudo conectar con el servidor.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear Submission</Text>

      <TextInput
        style={styles.input}
        placeholder="Título"
        value={title}
        onChangeText={setTitle}
      />

      {/* Selector entre URL o Content */}
      <View style={styles.selectorContainer}>
        <TouchableOpacity
          style={[styles.selectorButton, mode === 'url' && styles.selectorActive]}
          onPress={() => setMode('url')}
        >
          <Text style={styles.selectorText}>URL</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.selectorButton, mode === 'content' && styles.selectorActive]}
          onPress={() => setMode('content')}
        >
          <Text style={styles.selectorText}>Contenido</Text>
        </TouchableOpacity>
      </View>

      {mode === 'url' ? (
        <TextInput
          style={styles.input}
          placeholder="URL"
          value={url}
          onChangeText={setUrl}
        />
      ) : (
        <TextInput
          style={styles.input}
          placeholder="Contenido"
          value={content}
          onChangeText={setContent}
          multiline
        />
      )}

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Crear</Text>
        </TouchableOpacity>
        <div>
          {errorMessage && (
            <p style={{ color: 'red', marginBottom: '1rem' }}>{errorMessage}</p>
          )}
        </div>


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f6f6ef',
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#ffffff',
    backgroundColor: '#ff6600',
    paddingVertical: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  selectorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  selectorButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#ffffff',
    marginHorizontal: 4,
    borderRadius: 4,
  },
  selectorActive: {
    backgroundColor: '#ff6600',
  },
  selectorText: {
    color: '#000',
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
