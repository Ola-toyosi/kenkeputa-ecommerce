import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm}>
              <Text style={styles.confirmText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  message: { fontSize: 15, marginBottom: 20, color: "#666" },
  actions: { flexDirection: "row", justifyContent: "flex-end" },
  cancelBtn: { marginRight: 16 },
  cancelText: { color: "#666", fontWeight: "500" },
  confirmBtn: { backgroundColor: "#e63946", borderRadius: 6, padding: 10 },
  confirmText: { color: "#fff", fontWeight: "600" },
});

export default ConfirmModal;
