import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Image, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '@/contexts/AuthContext';
import { submitReport } from '@/services/api';
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

export default function ReportIssueScreen() {
  const { user } = useAuth();
  const [issueType, setIssueType] = useState<string>('water_leak');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(''); // TODO: GPS Integration
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera access is required to take a photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!description || !location) {
      Alert.alert('Missing Fields', 'Please provide a description and location.');
      return;
    }

    setLoading(true);
    try {
      const report = {
        type: issueType,
        description,
        location,
      };

      const result = await submitReport(report);

      const successMessage = `Report Submitted! ✅\nAI Priority: ${result.priority}\nAI Analysis: ${result.ai_analysis}\n+10 Eco-Points earned!`;

      Alert.alert('Report Submitted! ✅', successMessage, [
        { text: 'OK', onPress: () => resetForm() }
      ]);
    } catch (error: any) {
      console.error('Submission error:', error);
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        Alert.alert('Hold on! 🛑', error.response.data.detail || 'Spam detected.');
      } else {
        Alert.alert('Error', 'Failed to submit report. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setIssueType('water_leak');
    setDescription('');
    setLocation('');
    setImageUri(null);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.headerTitle}>Report Campus Anomaly</Text>
      <Text style={styles.subtitle}>Help keep our campus efficient and green.</Text>

      <Text style={styles.label}>Issue Type</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={issueType}
          onValueChange={(itemValue) => setIssueType(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Water Leak" value="water_leak" />
          <Picker.Item label="Overflowing Bin" value="overflow_bin" />
          <Picker.Item label="Electrical Fault" value="electrical" />
          <Picker.Item label="Other" value="other" />
        </Picker>
      </View>

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Briefly describe the issue..."
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
      />

      <Text style={styles.label}>Location</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Building C, 2nd floor restroom"
        value={location}
        onChangeText={setLocation}
      />
      {/* TODO: Add GPS "Use Current Location" button here */}

      <Text style={styles.label}>Photo Evidence</Text>
      <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
        <Ionicons name="camera" size={24} color={Colors.primary} />
        <Text style={styles.photoButtonText}>{imageUri ? 'Retake Photo' : 'Take Photo'}</Text>
      </TouchableOpacity>

      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.previewImage} />
      )}

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={Colors.card} />
        ) : (
          <Text style={styles.submitButtonText}>Submit Report</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
    marginTop: 16,
  },
  pickerContainer: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 16,
    color: Colors.textPrimary,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  photoButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 8,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 24,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: Colors.card,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
