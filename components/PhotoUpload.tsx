import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface PhotoUploadProps {
  onPhotoSelected: (uri: string) => void;
  onRecognitionComplete: (result: any) => void;
  loading?: boolean;
}

export default function PhotoUpload({ onPhotoSelected, onRecognitionComplete, loading = false }: PhotoUploadProps) {
  const [showCamera, setShowCamera] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    setHasPermission(cameraStatus === 'granted' && mediaStatus === 'granted');
    
    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'We need camera and photo library access to upload your leftover photos.',
        [{ text: 'OK' }]
      );
    }
  };

  const takePhoto = async () => {
    if (hasPermission === null) {
      await requestPermissions();
      return;
    }
    
    if (hasPermission === false) {
      Alert.alert('Camera permission denied');
      return;
    }

    setShowCamera(true);
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'We need photo library access to upload your leftover photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      onPhotoSelected(result.assets[0].uri);
    }
  };

  const handleCameraPhoto = (uri: string) => {
    setShowCamera(false);
    onPhotoSelected(uri);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        📸 Upload Your Leftovers
      </ThemedText>
      
      <ThemedText style={styles.subtitle}>
        Take a photo or choose from your gallery. Our AI will identify the food and find you a perfect match!
      </ThemedText>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cameraButton]}
          onPress={takePhoto}
          disabled={loading}
        >
          <Text style={styles.buttonText}>📷 Take Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.galleryButton]}
          onPress={pickFromGallery}
          disabled={loading}
        >
          <Text style={styles.buttonText}>🖼️ Choose from Gallery</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
          <ThemedText style={styles.loadingText}>
            Analyzing your food... 🤖
          </ThemedText>
        </View>
      )}

      <CameraModal
        visible={showCamera}
        onClose={() => setShowCamera(false)}
        onPhotoTaken={handleCameraPhoto}
      />
    </ThemedView>
  );
}

interface CameraModalProps {
  visible: boolean;
  onClose: () => void;
  onPhotoTaken: (uri: string) => void;
}

function CameraModal({ visible, onClose, onPhotoTaken }: CameraModalProps) {
  const [cameraRef, setCameraRef] = useState<Camera | null>(null);
  const [capturing, setCapturing] = useState(false);

  const takePicture = async () => {
    if (cameraRef && !capturing) {
      setCapturing(true);
      try {
        const photo = await cameraRef.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        onPhotoTaken(photo.uri);
      } catch (error) {
        Alert.alert('Error', 'Failed to take photo');
      } finally {
        setCapturing(false);
      }
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.cameraContainer}>
        <Camera
          style={styles.camera}
          type={Camera.Constants.Type.back}
          ref={(ref) => setCameraRef(ref)}
        >
          <View style={styles.cameraOverlay}>
            <View style={styles.cameraHeader}>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
              <ThemedText style={styles.cameraTitle}>Take Photo of Your Food</ThemedText>
            </View>
            
            <View style={styles.cameraFooter}>
              <TouchableOpacity
                style={[styles.captureButton, capturing && styles.captureButtonDisabled]}
                onPress={takePicture}
                disabled={capturing}
              >
                <Text style={styles.captureButtonText}>
                  {capturing ? '📸' : '📷'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Camera>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cameraButton: {
    backgroundColor: '#FF6B6B',
  },
  galleryButton: {
    backgroundColor: '#4ECDC4',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    opacity: 0.8,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cameraTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
    marginRight: 40,
  },
  cameraFooter: {
    alignItems: 'center',
    padding: 20,
    paddingBottom: 40,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FF6B6B',
  },
  captureButtonDisabled: {
    opacity: 0.6,
  },
  captureButtonText: {
    fontSize: 32,
  },
});
