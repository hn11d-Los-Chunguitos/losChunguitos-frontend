import React, { useState } from 'react'; 
import axios from 'axios';
import { useGlobalContext } from "@/contexts/GlobalContext";
import { StyleSheet, View, Text, Button, Picker, Image, TextInput } from 'react-native';
import { Link } from 'expo-router';

export default function LoginScreen() {
  const [selectedUser, setSelectedUser] = useState(null);
  const { loggedUser, setUser } = useGlobalContext();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    banner: loggedUser?.banner || null,
    avatar: loggedUser?.avatar || null,
    username: loggedUser?.username || '',
    about: loggedUser?.about || '',
  });

  const users = [
    { id: 1, name: 'Jose', apiKey: 'Tcs5cIBgIysU9IswpHxPX-R21e0faN3fGmkdp4-EOlE' },
    { id: 2, name: 'Kat', apiKey: 'j3RmWeSBYq1Pa1ePVkrnguoXlJFAx65dM3A-Y6Pp594' },
    { id: 4, name: 'Raul', apiKey: 'ae-Ujr4mrChtWI3VVxbWh-XSCNcgoDk9NpGG9fABRx4' },
  ];

  const handleLogin = async () => {
    const user = users.find(u => u.id === parseInt(selectedUser || ''));    
    if (user) {
      try {
        const response = await axios.get(`https://proyecto-asw-render.onrender.com/api/users/${selectedUser}`);
        console.log('User', response.data);
        const fullUser = { ...response.data, apiKey: user.apiKey };
        console.log('Full user', fullUser);
        setUser(fullUser);        
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    }
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedUser(null);
  };

  const handleEdit = async () => {
    try {

      // Combina los valores originales con los nuevos del formulario
      const payload = {
        banner: loggedUser?.banner,   // Mantiene el banner actual
        avatar: loggedUser?.avatar,   // Mantiene el avatar actual
        username: loggedUser?.username, // Toma el username del formulario
        about: formData.about,       // Toma el about del formulario
      };
      console.log('Payload:', payload);
  
      const response = await axios.patch(
        `https://proyecto-asw-render.onrender.com/api/users/${loggedUser?.id}/`,
        payload,
        {
          headers: {
            Authorization: loggedUser?.apiKey, // Incluye el API key
          },
        }
      );
  
      // Actualizar el contexto con los nuevos datos del usuario
      setUser({ ...loggedUser, ...response.data });
      setIsEditing(false); // Salir del modo de edición
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      setIsEditing(false); // Salir del modo de edición
    }
  };
  

  const handleChange = (field, value) => {
    setFormData((prevData) => ({ ...prevData, [field]: value }));
  };

  return (
    <View style={styles.container}>
      {loggedUser ? (
        <View style={styles.profileCard}>
        {isEditing ? (
            <>
            {/* Formulario de edición */}
            <Text style={styles.title}>Editar Perfil</Text>

            <TextInput
              style={styles.input}
              placeholder="Acerca de mí"
              value={formData.about}
              onChangeText={(text) => handleChange('about', text)}
            />
            <View style={styles.buttonContainer}>
              <Button title="Guardar" onPress={handleEdit} color="#ff6600" />
              <Button title="Cancelar" onPress={() => setIsEditing(false)} color="#555555" />
            </View>
          </>
        ) : (
          <>
            {/* Vista del perfil */}
            <Image source={{ uri: loggedUser.banner }} style={styles.banner} resizeMode="cover" />
            <Image source={{ uri: loggedUser.avatar }} style={styles.avatar} resizeMode="cover" />
            <Text style={styles.title}>Perfil de {loggedUser.username}</Text>
            <Text style={styles.detail}>About: {loggedUser.about}</Text>
            <Text style={styles.detail}>Karma: {loggedUser.karma}</Text>
            <Link 
              style={styles.action}
              href={`/favoriteSubmissions?loggedInUser=${loggedUser?.apiKey}`}>
              Submissions Favoritas
            </Link>
            <Link 
              style={styles.action}
              href={`/hiddenSubmissions?loggedInUser=${loggedUser?.apiKey}`}>
                Hidden Submissions
              </Link>
            <View style={styles.buttonContainer}>
              <Button title="Editar Perfil" onPress={() => setIsEditing(true)} color="#ff6600" />
              <Button title="Logout" onPress={handleLogout} color="#ff6600" />
            </View>
          </>
        )}
      </View>
      ) : (
        <View style={styles.loginCard}>
          <Text style={styles.label}>Selecciona un usuario:</Text>
          <Picker
            selectedValue={selectedUser}
            onValueChange={(value) => setSelectedUser(value)}
            style={styles.picker}
          >
            <Picker.Item label="--Seleccionar--" value="" />
            {users.map(user => (
              <Picker.Item key={user.id} label={user.name} value={user.id.toString()} />
            ))}
          </Picker>
          <Button
            title="Login"
            onPress={handleLogin}
            color="#ff6600"
            disabled={!selectedUser}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6ef', // Fondo beige
    padding: 16,
    justifyContent: 'center',
  },
  profileCard: {
    backgroundColor: '#ffffff', // Fondo blanco
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  loginCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff6600',
    marginBottom: 8,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333333',
  },
  detail: {
    fontSize: 14,
    color: '#555555',
    marginBottom: 4,
  },
  picker: {
    height: 40,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    backgroundColor: '#f9f9f9',
  },
  banner: {
    width: "100%", // Toma el ancho completo
    height: 120,   // Altura del banner
    marginBottom: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  avatar: {
    width: 80,   // Tamaño del avatar
    height: 80,
    borderRadius: 40, // Hace la imagen redonda
    alignSelf: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#ff6600",
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 16,
    paddingHorizontal: 16,
    gap: 8,
    justifyContent: 'flex-end',
  },
  action: {
    color: '#ff6600', // Links en naranja
    fontSize: 12,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
  },
  
});

