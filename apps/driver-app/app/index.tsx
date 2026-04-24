import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { Truck, MapPin, Navigation, Phone, CheckCircle2, AlertCircle, Camera, PenTool, Bell } from 'lucide-react-native';
import PhotoCapture from '../components/PhotoCapture';
import SignatureCapture from '../components/SignatureCapture';
import { uploadEvidencePhoto, uploadServiceSignature } from '../services/storage';
import { useNotifications } from '../hooks/useNotifications';
import { startLocationTracking, stopLocationTracking } from '../services/location';

export default function DriverHome() {
  const { expoPushToken, notification } = useNotifications();
  const [isOnline, setIsOnline] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeJob, setActiveJob] = useState<{
    id: number;
    customer: string;
    vehicle: string;
    location: string;
    destination: string;
    beforePhoto?: string;
    afterPhoto?: string;
    signature?: string;
  } | null>(null);

  const [showCamera, setShowCamera] = useState<{ visible: boolean; type: 'before' | 'after' }>({
    visible: false,
    type: 'before',
  });

  const [showSignature, setShowSignature] = useState(false);

  const toggleStatus = () => {
    const nextStatus = !isOnline;
    setIsOnline(nextStatus);
    
    if (nextStatus) {
      startLocationTracking().catch(console.error);
    } else {
      stopLocationTracking().catch(console.error);
    }
  };

  useEffect(() => {
    // If token changes, we should update it in the DB
    if (expoPushToken) {
      console.log("Registered Push Token:", expoPushToken);
      // axios.post('/api/users/push-token', { token: expoPushToken });
    }
  }, [expoPushToken]);

  const updateStatus = async (status: string) => {
    if (!activeJob) return;
    // await axios.post(`/api/services/${activeJob.id}/status`, { status });
    if (status === 'cancelled') setActiveJob(null);
    else setActiveJob({ ...activeJob, status: status as any });
  };


  const simulateJob = () => {
    setActiveJob({
      id: 1,
      customer: "Elena Mendoza",
      vehicle: "Nissan Sentra 2019 (Blue)",
      location: "Av. Mariscal López 1234",
      destination: "Taller Mecánico 'X'",
    });
  };

  const handleCapture = async (photoData: { uri: string; lat: number | null; lng: number | null; timestamp: string }) => {
    if (!activeJob) return;

    setIsUploading(true);
    try {
      console.log("Starting cloud upload for type:", showCamera.type);
      
      // 1. Upload to Supabase
      const result = await uploadEvidencePhoto(
        photoData.uri,
        activeJob.id,
        showCamera.type
      );

      // 2. Update local state with the cloud URL
      const field = showCamera.type === 'before' ? 'beforePhoto' : 'afterPhoto';
      setActiveJob({ ...activeJob, [field]: result.url });
      
      Alert.alert(
        "Upload Success", 
        "Photo has been securely stored in the cloud evidence bucket."
      );
    } catch (error: any) {
      Alert.alert("Upload Failed", error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSignature = async (base64: string) => {
    if (!activeJob) return;

    setIsUploading(true);
    setShowSignature(false);
    
    try {
      const result = await uploadServiceSignature(base64, activeJob.id);
      setActiveJob({ ...activeJob, signature: result.url });
      
      Alert.alert("Success", "Signature captured and stored correctly.");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header / Status Toggle */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Good morning, Juan</Text>
          <Text style={styles.uid}>Unit: G-01</Text>
        </View>
        <TouchableOpacity 
          style={[styles.statusToggle, isOnline ? styles.online : styles.offline]} 
          onPress={toggleStatus}
        >
          <Text style={styles.statusText}>{isOnline ? 'ONLINE' : 'OFFLINE'}</Text>
        </TouchableOpacity>
      </View>

      {/* Incoming Job Notification Banner */}
      {notification && (
        <View style={styles.notificationBanner}>
          <Bell color="#3b82f6" size={20} />
          <Text style={styles.notificationText}>
            New Job: {notification.request.content.title}
          </Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {!isOnline ? (
          <View style={styles.emptyState}>
            <AlertCircle color="#ffffff30" size={64} />
            <Text style={styles.emptyText}>You are currently offline.</Text>
            <Text style={styles.emptySub}>Go online to start receiving jobs.</Text>
          </View>
        ) : !activeJob ? (
          <View style={styles.emptyState}>
            <Truck color="#3b82f6" size={64} />
            <Text style={styles.emptyText}>Waiting for jobs...</Text>
            <TouchableOpacity style={styles.mockButton} onPress={simulateJob}>
              <Text style={styles.mockButtonText}>Simulate New Job</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.activeJobContainer}>
            <View style={styles.jobHeader}>
              <Text style={styles.activeJobLabel}>ACTIVE JOB</Text>
              <Text style={styles.jobTime}>Assigned 2m ago</Text>
            </View>

            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>{activeJob.customer}</Text>
              <Text style={styles.vehicleInfo}>{activeJob.vehicle}</Text>
            </View>

            <View style={styles.locationContainer}>
              {/* Photo Evidence Section */}
              <View style={styles.photoEvidenceSection}>
                <TouchableOpacity 
                  style={[styles.photoButton, activeJob.beforePhoto ? styles.photoCaptured : null]} 
                  onPress={() => setShowCamera({ visible: true, type: 'before' })}
                >
                  <Camera color={activeJob.beforePhoto ? "#10b981" : "white"} size={20} />
                  <Text style={styles.photoButtonText}>
                    {activeJob.beforePhoto ? 'Initial Photo Take' : 'Take Initial Photo'}
                  </Text>
                  {activeJob.beforePhoto && <CheckCircle2 color="#10b981" size={16} />}
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.photoButton, activeJob.afterPhoto ? styles.photoCaptured : null]} 
                  onPress={() => setShowCamera({ visible: true, type: 'after' })}
                  disabled={!activeJob.beforePhoto}
                >
                  <Camera color={activeJob.afterPhoto ? "#10b981" : "white"} size={20} />
                  <Text style={styles.photoButtonText}>
                    {activeJob.afterPhoto ? 'Final Photo Taken' : 'Take Final Photo'}
                  </Text>
                  {activeJob.afterPhoto && <CheckCircle2 color="#10b981" size={16} />}
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.photoButton, activeJob.signature ? styles.photoCaptured : null]} 
                  onPress={() => setShowSignature(true)}
                  disabled={!activeJob.afterPhoto}
                >
                  <PenTool color={activeJob.signature ? "#10b981" : "white"} size={20} />
                  <Text style={styles.photoButtonText}>
                    {activeJob.signature ? 'Signature Captured' : 'Get Customer Signature'}
                  </Text>
                  {activeJob.signature && <CheckCircle2 color="#10b981" size={16} />}
                </TouchableOpacity>
              </View>

              <View style={styles.locationDivider} />
              
              {/* Accept/Reject Buttons for New Services */}
              {activeJob.status === 'pending' && (
                <View style={styles.decisionRow}>
                  <TouchableOpacity 
                    style={styles.rejectButton}
                    onPress={() => updateStatus('cancelled')}
                  >
                    <Text style={styles.rejectText}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.acceptButton}
                    onPress={() => updateStatus('accepted')}
                  >
                    <Text style={styles.acceptText}>Accept Service</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>




              <View style={styles.locationItem}>
                <Navigation color="#3b82f6" size={18} />
                <View style={styles.locationTextContainer}>
                  <Text style={styles.locationLabel}>Destination</Text>
                  <Text style={styles.locationAddress}>{activeJob.destination}</Text>
                </View>
              </View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity style={[styles.actionButton, styles.callButton]}>
                <Phone color="white" size={20} />
                <Text style={styles.actionButtonText}>Call Customer</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.actionButton, styles.navButton]}>
                <Navigation color="white" size={20} />
                <Text style={styles.actionButtonText}>Navigate</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.completeButton, (!activeJob.afterPhoto || !activeJob.signature) && styles.disabledButton]}
              onPress={() => {
                if (!activeJob.afterPhoto) {
                  Alert.alert("Missing Evidence", "You must take the final photo before completing the service.");
                  return;
                }
                if (!activeJob.signature) {
                  Alert.alert("Missing Signature", "The customer must sign before completing the service.");
                  return;
                }
                setActiveJob(null);
                Alert.alert("Service Completed", "All evidence has been saved. Well done!");
              }}
            >
              <CheckCircle2 color="white" size={24} />
              <Text style={styles.completeButtonText}>Service Completed</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <PhotoCapture 
        isVisible={showCamera.visible}
        onClose={() => setShowCamera({ ...showCamera, visible: false })}
        onCapture={handleCapture}
        title={showCamera.type === 'before' ? 'Photo Before Loading' : 'Photo After Delivery'}
      />

      <SignatureCapture 
        isVisible={showSignature}
        onClose={() => setShowSignature(false)}
        onOK={handleSignature}
      />

      {/* Global Upload Spinner */}
      {isUploading && (
        <View style={styles.uploadOverlay}>
          <View style={styles.uploadCard}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.uploadText}>Uploading evidence...</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff10',
  },
  welcome: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  uid: {
    color: '#ffffff50',
    fontSize: 12,
  },
  statusToggle: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  online: {
    backgroundColor: '#3b82f620',
    borderColor: '#3b82f6',
  },
  offline: {
    backgroundColor: '#ffffff05',
    borderColor: '#ffffff30',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  notificationBanner: {
    backgroundColor: '#3b82f615',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3b82f630',
    gap: 10,
  },
  notificationText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '500',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
    marginTop: 20,
  },
  emptySub: {
    color: '#ffffff50',
    fontSize: 14,
    marginTop: 8,
  },
  activeJobContainer: {
    backgroundColor: '#ffffff08',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#ffffff10',
    padding: 24,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  activeJobLabel: {
    color: '#3b82f6',
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 1,
  },
  jobTime: {
    color: '#ffffff30',
    fontSize: 10,
  },
  customerInfo: {
    marginBottom: 24,
  },
  customerName: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  vehicleInfo: {
    color: '#ffffff60',
    fontSize: 14,
    marginTop: 4,
  },
  locationContainer: {
    backgroundColor: '#ffffff05',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationTextContainer: {
    marginLeft: 12,
  },
  locationLabel: {
    color: '#ffffff30',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  locationAddress: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  locationDivider: {
    height: 1,
    backgroundColor: '#ffffff10',
    marginVertical: 12,
  },
  photoEvidenceSection: {
    paddingBottom: 4,
    gap: 12,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff10',
    padding: 14,
    borderRadius: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: '#ffffff10',
  },
  photoCaptured: {
    borderColor: '#10b98150',
    backgroundColor: '#10b98105',
  },
  photoButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  disabledButton: {
    opacity: 0.5,
  },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  uploadCard: {
    backgroundColor: '#0a0a0a',
    padding: 30,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#ffffff10',
    alignItems: 'center',
    gap: 16,
  },
  uploadText: {
    color: 'white',
    fontWeight: '600',
  },
  decisionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#ef444415',
    borderWidth: 1,
    borderColor: '#ef444430',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  acceptButton: {
    flex: 2,
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: "#3b82f6",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  rejectText: {
    color: '#ef4444',
    fontWeight: 'bold',
  },
  acceptText: {
    color: 'white',
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: 16,
    gap: 8,
  },
  callButton: {
    backgroundColor: '#ffffff10',
  },
  navButton: {
    backgroundColor: '#3b82f6',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  completeButton: {
    flexDirection: 'row',
    backgroundColor: '#10b981',
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 8,
  },
  completeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  mockButton: {
    marginTop: 24,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  mockButtonText: {
    color: 'white',
    fontWeight: 'bold',
  }
});
