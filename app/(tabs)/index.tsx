import React from 'react';
import { StyleSheet, ScrollView, Text, View } from 'react-native';
import axios from 'axios';


export default function HomeScreen() {
  // Submissions hardcodeades
  const submissions = [
    {
      id: 1,
      title: 'Primera Submission',
      description: 'Aquesta és la descripció de la primera submission.',
    },
    {
      id: 2,
      title: 'Segona Submission',
      description: 'Aquí tenim més informació de la segona.',
    },
    {
      id: 3,
      title: 'Tercera Submission',
      description: 'Aquesta és una altra submission de mostra.',
    },
    {
      id: 4,
      title: 'Quarta Submission',
      description: 'I per últim, una altra submission.',
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Submissions</Text>
      {submissions.map((submission) => (
        <View key={submission.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{submission.title}</Text>
          </View>
          <Text style={styles.cardDescription}>{submission.description}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f0f4f8',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    width: 24,
    height: 24,
    backgroundColor: '#6c63ff',
    borderRadius: 12,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#444',
  },
  cardDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
});
