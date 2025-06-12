import { 
  Animated, 
  Easing, 
  KeyboardAvoidingView, 
  Platform, 
  StyleSheet, 
  TouchableOpacity, 
  TouchableWithoutFeedback, 
} from "react-native";
import { ImageSection } from "./ImageSection";
import { DescriptionSection } from "./DescriptionSection";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { BlurView } from 'expo-blur';
import colors from "@/src/constants/colors";
import { ImageItem } from "@/src/utils/image";

interface ExpandedImageCardProps {
  image: ImageItem;
  onClose: () => void;
  onSaveComment: (comment: string) => void;
  onDelete: () => void;
}

const ExpandedImageCard = ({ image, onClose, onSaveComment, onDelete }: ExpandedImageCardProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const [comment, setComment] = useState(image.comment || "");

  const getFormattedDate = (dateString: string) => {
    if (!dateString) return "Data não disponível";
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }) + ' às ' + date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => {
      onClose();
    });
  };

  const handleSave = () => {
    onSaveComment(comment);
    console.log("este foi o comentário: ", comment);
  }

  return (
    <Animated.View style={[styles.overlay, {opacity: fadeAnim}]}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer} // Usando o novo estilo de dimensionamento
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={handleClose}>
      <BlurView intensity={10} tint="dark" style={StyleSheet.absoluteFill} />
      </TouchableWithoutFeedback>
      
        <Animated.View style={[styles.container, { transform: [{scale: scaleAnim }] }]}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={24} color="red" />
          </TouchableOpacity>

          <ImageSection image={image.image_url} />

          <DescriptionSection 
            photoDate={getFormattedDate(image.created_at)}
            comment={comment}
            setComment={setComment}
            onSave={handleSave}
            onDelete={onDelete}
          />
        </Animated.View>
      </KeyboardAvoidingView>
      

    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: -140, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 999,
  },
  container: {
    width: '100%', 
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 0,
    overflow: 'hidden',
  },
  keyboardContainer: {
    width: '90%',
    maxWidth: 345,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 16,
    padding: 4,
  },
});

export default ExpandedImageCard;
