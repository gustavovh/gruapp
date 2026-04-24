import React, { useRef } from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity } from 'react-native';
import SignatureScreen, { SignatureViewRef } from 'react-native-signature-canvas';
import { X, RotateCcw, Check } from 'lucide-react-native';

interface SignatureCaptureProps {
  isVisible: boolean;
  onClose: () => void;
  onOK: (signature: string) => void; // base64 string
}

export default function SignatureCapture({ isVisible, onClose, onOK }: SignatureCaptureProps) {
  const ref = useRef<SignatureViewRef>(null);

  const handleClear = () => {
    ref.current?.clearSignature();
  };

  const handleConfirm = () => {
    ref.current?.readSignature();
  };

  const handleOK = (signature: string) => {
    onOK(signature);
  };

  const style = `
    .m-signature-pad--footer {display: none; margin: 0px;}
    body,html {width: 100%; height: 100%;}
  `;

  return (
    <Modal visible={isVisible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Customer Signature</Text>
            <Text style={styles.subtitle}>Please sign inside the box below</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X color="white" size={28} />
          </TouchableOpacity>
        </View>

        <View style={styles.signatureWrapper}>
          <SignatureScreen
            ref={ref}
            onOK={handleOK}
            descriptionText="Sign here"
            clearText="Clear"
            confirmText="Save"
            webStyle={style}
            autoClear={false}
            imageType="image/png"
          />
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
            <RotateCcw color="white" size={20} />
            <Text style={styles.btnText}>Clear</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
            <Check color="white" size={20} />
            <Text style={styles.btnText}>Confirm Signature</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
  },
  title: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#ffffff50',
    fontSize: 14,
    marginTop: 4,
  },
  closeButton: {
    padding: 8,
  },
  signatureWrapper: {
    flex: 1,
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
    paddingBottom: 40,
  },
  clearBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#334155',
    height: 60,
    borderRadius: 16,
    gap: 8,
  },
  confirmBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    height: 60,
    borderRadius: 16,
    gap: 8,
  },
  btnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
