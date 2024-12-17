import React, { useEffect, useState } from 'react';  
import { StyleSheet, Text, View, ScrollView, TextInput, Button, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function EditSubmissionScreen() {
  const { id, loggedInUser } = useLocalSearchParams(); // Accede a los parámetros
  const router = useRouter();
  const [submission, setSubmission] = useState<any>(null); 
  const [title, setTitle] = useState<string>(''); 
  const [content, setContent] = useState<string | null>(null); 
  const [url, setUrl] = useState<string | null>(null);  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`https://proyecto-asw-render.onrender.com/api/submissions/${id}/`)
      .then((response) => {
        console.log('Submission data:', response.data);
        setSubmission(response.data);
        setTitle(response.data.title);  
        setContent(response.data.content);
        setUrl(response.data.url);  // Cargar tanto content como url
        setLoading(false);  
      })
      .catch((err) => {
        setError('Error al cargar los detalles de la submission');
        console.error(err);
        setLoading(false);  
      });
  }, [id]);

  const handleSubmit = () => {
    setLoading(true);
    
    // Enviar solo los campos que no sean null
    const dataToSubmit: any = { title };
    if (content !== null) dataToSubmit.content = content;
    if (url !== null) dataToSubmit.url = url;

    axios
      .put(`https://proyecto-asw-render.onrender.com/api/submissions/${id}/`, dataToSubmit, {
        headers: {
          Authorization: loggedInUser,
        },
      })
      .then((response) => {
        console.log('Submission updated:', response.data);
        router.push(`/`); 
      })
      .catch((err) => {
        setError('Error al actualizar la submission');
        console.error(err);
        setLoading(false);
      });
  };

  const handleDelete = () => {
            setLoading(true);
            axios
              .delete(`https://proyecto-asw-render.onrender.com/api/submissions/${id}/`, {
                headers: {
                  Authorization: loggedInUser,
                },
              })
              .then(() => {
                console.log('Submission deleted');
                router.push('/'); 
              })
              .catch((err) => {
                setError('Error al eliminar la submission');
                console.error(err);
                setLoading(false);
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
          <Text style={styles.title}>Edit Submission</Text>

          <Text style={styles.label}>Title:</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Edit the title"
          />

          {/* Mostrar solo el campo que no sea null */}
          {content !== null && (
            <>
              <Text style={styles.label}>Content:</Text>
              <TextInput
                style={[styles.input, { height: 150 }]}
                multiline
                value={content}
                onChangeText={setContent}
                placeholder="Edit the content"
              />
            </>
          )}

          {url !== null && (
            <>
              <Text style={styles.label}>URL:</Text>
              <TextInput
                style={styles.input}
                value={url}
                onChangeText={setUrl}
                placeholder="Edit the URL"
              />
            </>
          )}

          <Button title="Save Changes" onPress={handleSubmit} />
          <Button title="Delete Submission" onPress={handleDelete} color="red" />
          
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
    backgroundColor: '#f6f6ef', 
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000', 
    marginBottom: 12,
    textAlign: 'center',
  },
  error: {
    fontSize: 16,
    color: '#ff6600', 
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
    borderColor: '#e0e0e0', 
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    fontSize: 14,
    padding: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 16,
    width: '100%',
  },
  deleteButtonContainer: {
    marginTop: 16,
  },
});
