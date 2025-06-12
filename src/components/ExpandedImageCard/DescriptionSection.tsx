import colors from "@/src/constants/colors";
import { Ubuntu } from "@/src/constants/fonts";
import globalStyles from "@/src/constants/globalStyles";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity, TextInput } from "react-native"

interface DescriptionSectionProps {
  photoDate: string;
  comment: string;
  setComment: (text: string) => void;
  onSave: () => void;
  onDelete: () => void;
}

export const DescriptionSection = ({photoDate, comment, setComment, onSave, onDelete}: DescriptionSectionProps) => {
  const [isEditing, setIsEditing] = useState(!comment);
  const textInputRef = useRef<TextInput>(null);

  const handleEditPress = () => {
    setIsEditing(true);
    setTimeout(() => textInputRef.current?.focus(), 100);
  };

  const handleSavePress = () => {
    onSave();
    setIsEditing(false);
  }

  return (
    <View style={styles.container}>
      <View style={styles.dataAndTrashBinContainer}>
        <View>
          <Text style={styles.label}>Data</Text>
          <Text style={styles.date}>{photoDate}</Text>
        </View>
        <TouchableOpacity style={styles.trashButton} onPress={onDelete}>
          <Ionicons name="trash" size={20} color={colors.white} />
        </TouchableOpacity>

      </View>
      <View style={styles.descriptionContainer}>
        <Text style={styles.label}>Descrição</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Adicionar comentário"
            value={comment}
            onChangeText={setComment}
            multiline
            editable={isEditing}
          />
          {isEditing && (
            <TouchableOpacity style={styles.saveButton} onPress={handleSavePress}>
              <Ionicons name="send" size={20} color={colors.white} />
            </TouchableOpacity>
          )}
        </View>
          {!isEditing && (
          <TouchableOpacity style={styles.editButton} onPress={handleEditPress}>
            <Ionicons name="pencil" size={16} color={colors.purple80} />
            <Text style={styles.editButtonText}>Editar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View> 
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  },

  descriptionContainer: {
    marginTop: 16,
  },
  label: {
    color: colors.purple60,
    textAlign: 'left',
    fontSize: globalStyles.small,
    fontFamily: Ubuntu.regular,
  },
  date: {
    color: colors.purple200,
    fontSize: globalStyles.medium,
    marginTop: 8,
    fontFamily: Ubuntu.regular,
  },
  inputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    gap: 8,
  },
  dataAndTrashBinContainer: {
    width: '100%',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.purple60,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: Ubuntu.regular,
    fontSize: globalStyles.medium,
    color: colors.purple200,
    minHeight: 48,
  },
  inputReadOnly: {
    borderColor: 'transparent',
    backgroundColor: colors.lightGray,
    color: colors.purple200,
  },
  saveButton: {
    backgroundColor: colors.purple80,
    padding: 12,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trashButton: {
    backgroundColor: colors.purple200,
    padding: 12,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center'
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
  },
  editButtonText: {
    fontFamily: Ubuntu.regular,
    fontSize: globalStyles.medium,
    color: colors.purple80,
  },
});

