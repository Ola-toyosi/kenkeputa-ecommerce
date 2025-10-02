import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (address: string) => void;
};

export default function AddressModal({ visible, onClose, onSave }: Props) {
  const [address, setAddress] = useState("");

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Enter Shipping Address</Text>
          <TextInput
            style={styles.input}
            placeholder="123 Main Street, City, Country"
            value={address}
            onChangeText={setAddress}
            multiline
          />
          <View style={styles.buttons}>
            <TouchableOpacity style={styles.cancel} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.save}
              onPress={() => {
                onSave(address);
                setAddress("");
                onClose();
              }}
            >
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "90%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
  },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    height: 100,
    textAlignVertical: "top",
  },
  buttons: { flexDirection: "row", justifyContent: "flex-end", marginTop: 15 },
  cancel: { marginRight: 10, padding: 10 },
  save: { backgroundColor: "#9b51e0", padding: 10, borderRadius: 8 },
  buttonText: { color: "#fff" },
});
