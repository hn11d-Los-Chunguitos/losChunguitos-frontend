import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function EditCommentScreen() {
    const params = useLocalSearchParams();
    const id = params.id as string;
    const loggedInUser = params.loggedInUser as string | undefined;
    const submissionId = params.submission as string | undefined;
    const userId = params.userId as string | undefined;
    const submissionIdAsInt = submissionId ? parseInt(submissionId, 10) : NaN;  // Asegúrate de que sea un número

    const router = useRouter();

    const [comment, setComment] = useState<any>(null);
    const [content, setContent] = useState<string>(''); // El contenido del comentario
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    // Cargar el comentario existente
    useEffect(() => {
        axios
        .get(`https://proyecto-asw-render.onrender.com/api/comments/${id}`)
        .then((response) => {
            console.log('Comentario cargado:', response.data);
            setComment(response.data);
            setContent(response.data.content); // Inicializa el contenido
            setLoading(false);
        })
        .catch((err) => {
            setError('Error al cargar los detalles del comentario');
            console.error(err);
            setLoading(false);
        });
    }, [id]);

    // Guardar cambios en el comentario
    const handleSave = () => {
        // Validar que submissionId y content no sean vacíos o NaN
        if (isNaN(submissionIdAsInt) || !content.trim()) {
            setError('El ID de submission no es válido o el contenido está vacío.');
            return;
        }

        setLoading(true);

        // Datos que vamos a enviar directamente al servidor
        const payload = {
            submission: submissionIdAsInt,  // ID de la submission
            content: content,               // El contenido del comentario
        };

        console.log('Datos enviados:', payload);  // Verifica que los datos sean correctos

        axios
        .put(
            `https://proyecto-asw-render.onrender.com/api/comments/${id}/`,
            payload,  // Envía el objeto directamente sin envolverlo en un objeto adicional
            { headers: { Authorization: loggedInUser } }
        )
        .then((response) => {
            console.log('Comentario actualizado:', response.data);
            setComment(response.data);  // Actualiza el estado con el nuevo comentario
            setContent(response.data.content);  // Actualiza el contenido en el estado
            location.reload();
            Alert.alert('Éxito', 'Comentario actualizado correctamente.');
            //router.push(`/${submissionId}?id=${submissionId}&loggedInUser=${loggedInUser}&userId=${userId}`)
            setLoading(false);
        })
        .catch((err) => {
            setError('Error al actualizar el comentario');
            console.error(err);
            setLoading(false);
            if (err.response) {
                console.log('Server response:', err.response.data);
            }
        });
    };

    const handleReturn = () => {
        // Navegar a la URL especificada con los parámetros necesarios
        router.push(`/${submissionId}?id=${submissionId}&loggedInUser=${loggedInUser}&userId=${userId}`);
    };

    // Pantalla de carga
    if (loading) {
        return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007bff" />
        </View>
        );
    }

    return (
        <View style={styles.page}>
        <View style={styles.container}>
            <Text style={styles.title}>Edit Comment</Text>

            {error && <Text style={styles.error}>• {error}</Text>}

            <Text style={styles.label}>Content:</Text>
            <TextInput
            style={styles.textArea}
            placeholder="Escribe tu comentario aquí..."
            value={content}
            onChangeText={setContent}
            multiline
            />

            <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.buttonText}>SAVE CHANGES</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.returnButton} onPress={handleReturn}>
            <Text style={styles.buttonText}> RETURN </Text>
            </TouchableOpacity>
            </View>
        </View>
    </View>
    );
}

// Estilos para React Native
const styles = StyleSheet.create({
    page: {
        flex: 1, // Asegura que la vista ocupe toda la pantalla
        backgroundColor: '#ffffff', // Fondo blanco
    },
  container: {
    backgroundColor: '#ffffff',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  error: {
    color: '#dc3545',
    marginBottom: 12,
    fontSize: 14,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 10,
    fontSize: 16,
    height: 120,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 4,
    marginRight: 8,
    alignItems: 'center',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#dc3545',
    padding: 12,
    borderRadius: 4,
    marginLeft: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f6f6ef',
  },
  returnButton: {
    backgroundColor: '#2196F3', // Azul para el botón de retorno
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
});
