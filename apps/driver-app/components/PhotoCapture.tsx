import React, { useState, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Modal, Image, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import * as Location from 'expo-location';
import { X, Camera, Check, RefreshCw } from 'lucide-react-native';

interface PhotoCaptureProps {
  isVisible: boolean;
  onClose: () => void;
  onCapture: (photoData: { uri: string; lat: number | null; lng: number | null; timestamp: string }) => void;
  title: string;
}

export default function PhotoCapture({ isVisible, onClose, onCapture, title }: PhotoCaptureProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef<any>(null);

  if (!permission) return null;

  if (!permission.granted) {
    return (
      <Modal visible={isVisible} animationType="slide">
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>We need your permission to show the camera</Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X color="white" />
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      setIsProcessing(true);
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.7,
          skipProcessing: false,
        });

        // 1. Optimize Image (Compress and Resize)
        const manipulated = await ImageManipulator.manipulateAsync(
          photo.uri,
          [{ resize: { width: 1200 } }],
          { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
        );

        setCapturedImage(manipulated.uri);
      } catch (e) {
        console.error(e);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const confirmPicture = async () => {
    if (!capturedImage) return;

    setIsProcessing(true);
    try {
      // 2. Capture Metadata (GPS + Time)
      let location = null;
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          location = await Location.getCurrentPositionAsync({});
        }
      } catch (e) {
        console.warn("Could not get location", e);
      }

      onCapture({
        uri: capturedImage,
        lat: location?.coords.latitude || null,
        lng: location?.coords.longitude || null,
        timestamp: new Date().toISOString(),
      });
      
      setCapturedImage(null);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal visible={isVisible} animationType="fade">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={onClose} disabled={isProcessing}>
            <X color="white" size={28} />
          </TouchableOpacity>
        </View>

        {!capturedImage ? (
          <View style={styles.cameraWrapper}>
            <CameraView style={styles.camera} ref={cameraRef}>
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.captureButton} onPress={takePicture} disabled={isProcessing}>
                  {isProcessing ? <ActivityIndicator color="white" /> : <Camera color="white" size={32} />}
                </TouchableOpacity>
              </View>
            </CameraView>
          </View>
        ) : (
          <View style={styles.previewWrapper}>
            <Image source={{ uri: capturedImage }} style={styles.preview} />
            <View style={styles.previewActions}>
              <TouchableOpacity style={styles.retakeButton} onPress={() => setCapturedImage(null)} disabled={isProcessing}>
                <RefreshCw color="white" size={24} />
                <Text style={styles.retakeText}>Retake</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={confirmPicture} disabled={isProcessing}>
                {isProcessing ? <ActivityIndicator color="white" /> : (
                  <>
                    <Check color="white" size={24} />
                    <Text style={styles.confirmText}>Confirm Photo</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    height: 100,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    backgroundColor: '#0a0a0a',
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cameraWrapper: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 30,
    margin: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    backgroundColor: '#3b82f6',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  previewWrapper: {
    flex: 1,
    margin: 10,
  },
  preview: {
    flex: 1,
    borderRadius: 24,
  },
  previewActions: {
    flexDirection: 'row',
    gap: 12,
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
  },
  retakeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#334155',
    height: 60,
    borderRadius: 16,
    gap: 8,
  },
  confirmButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    height: 60,
    borderRadius: 16,
    gap: 8,
  },
  retakeText: {
    color: 'white',
    fontWeight: 'bold',
  },
  confirmText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
  }
});
