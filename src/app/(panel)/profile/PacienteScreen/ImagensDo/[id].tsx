import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import GenericHeader from "@/src/components/GenericHeader";
import GalleryCard from "@/src/components/ImagesCard/GalleryCard";
import { PatientInfoCard } from "@/src/components/PatientInfoCard/PatientInfoCard";
import PlusButton from "@/src/components/PlusButton/PlusButton";
import { supabase } from "@/src/lib/supabase";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, SafeAreaView, StyleSheet, View } from "react-native";
import { ImageItem } from '@/src/utils/image';
import ExpandedImageCard from '@/src/components/ExpandedImageCard/ExpandedImageCard';

interface Patient {
  name: string;
  regions: string[];
  nurse_id: string;
}

interface IndexedRegion {
  name: string;
  index: number;
}

export default function ImagesOfPatient() {
  const [loading, setLoading] = useState<boolean>(false);
  const [patientName, setPatientName] = useState<string>("");
  const [patientRegion, setPatientRegion] = useState<string>("");
  const [images, setImages] = useState<ImageItem[]>([]);
  const [nurseId, setNurseId] = useState('');
  const [openedImageId, setOpenedImageId] = useState<string | null>(null);

  const openedImage = images.find(img => img.id === openedImageId);

  const { id, index } = useLocalSearchParams();
  
  async function fetchImages() {
    const { data, error } = await supabase
      .from('region_images')
      .select('*')
      .eq('patient_id', id)
      .eq('region', patientRegion)
      .order('created_at', {ascending: false});

    if (error) {
      console.error('Erro ao buscar imagens: ', error);
    } else if (data) {
      const signedImages = await Promise.all(
        data.map(async (item) => {
          console.log("fetching images...")
          const {data: signedUrlData } = await supabase
            .storage
            .from('cicatrify-images')
            .createSignedUrl(item.image_path, 60*60);

            return {
              ...item,
              image_url: signedUrlData?.signedUrl || '',
            };
        })
      );
      setImages(signedImages);
      console.log("Imagem setada!");
    }
  }

  useEffect(() => {
    if (patientRegion) {
      fetchImages();
    }
  }, [patientRegion]);

function getFormattedDateTimeLocale() {
  const [date, time] = new Date().toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).split(/[\u200E,\s]+/); // quebra por vírgula, espaço ou caractere oculto

  return `${date} às ${time}`;
}


  // abre a câmera e tira a foto e salva no supabase
  async function handleNewPhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Permissão de acesso à câmera negada');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.01,
      base64: true
    })

    if (!result.canceled) {
      const photo = result.assets[0];

      const fileName = `${Date.now()}-${photo.fileName || 'image'}.jpg`;
      const filePath = photo.uri;
      const base64 = photo.base64;
      const photoDate = getFormattedDateTimeLocale();
      console.log("DATA DA FOTO: ", photoDate);
      console.log(photo.uri);

      const { data, error: uploadError } = await supabase.storage
        .from('cicatrify-images')
        .upload(fileName, decode(base64!), {
          contentType: 'image/jpeg',
          upsert: true,
        });

        if (uploadError) {
          console.error('Erro ao fazer upload no storage: ', uploadError);
          return
        }


        const { error: insertError } = await supabase
          .from('region_images')
          .insert([
            {
              patient_id: id,
              region: patientRegion,
              image_path: fileName,
              nurse_id: nurseId
              
            },
          ]);

        if (insertError) {
          console.error('Erro ao salvar no banco: ', insertError);
        } else {
          console.log('Imagem salva com sucesso');
          fetchImages();
        }
    }
  }

  async function fetchPatientData() {
    setLoading(true);

    if (!id) {
      setLoading(false);
      return;
    }

    const { data: patient, error } = await supabase
      .from("patients")
      .select("name, regions, nurse_id")
      .eq("id", id)
      .single<Patient>(); // Tipa o retorno com a interface `Patient`

    if (error) {
      console.error("Erro ao buscar paciente:", error);
    } else if (patient) {
      setPatientName(patient.name);
      setNurseId(patient.nurse_id);
      const indexedRegions: IndexedRegion[] = patient.regions.map((region, i) => ({
        name: region,
        index: i,
      }));

      const selectedRegion = indexedRegions.find((item) => item.index === Number(index));

      if (selectedRegion) {
        setPatientRegion(selectedRegion.name);
      }
    }

    setLoading(false);
  }

  async function handleSaveComment(comment: string) {
    if (!openedImageId) return;
    console.log("id da imagem com comentário: ", openedImageId);

    const { error } = await supabase
      .from('region_images')
      .update({comment: comment}) // atualiza a coluna comment
      .eq('id', openedImageId);
    
    if (error) {
      Alert.alert("Erro", "Não foi possível salvar o comentário.");
      console.error("Erro ao atualizar comentário: ", error);
    } else {
      console.log("teste de comentário: ", comment)
      Alert.alert("Sucesso", "Comentário salvo");
      await fetchImages();
      setOpenedImageId(null);
    }
  }

  async function handleDeleteImage() {
    if (!openedImage) return;

    Alert.alert(
      "Apagar registro",
      "Tem certeza que deseja apagar esta imagem permanentemente? Esta ação não pode ser desfeita.",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Apagar",
          onPress: async () => {
            try {
              const { error: storageError } = await supabase
                .storage
                .from('cicatrify-images')
                .remove([openedImage.image_path]);

              if (storageError) {
                throw storageError;
              }

              const { error: dbError } = await supabase
                .from('region_images')
                .delete()
                .eq('id', openedImage.id);
              
                if (dbError) {
                  throw dbError;
                }

                Alert.alert("Sucesso", "A imagem foi apagada.");
                setOpenedImageId(null);
                await fetchImages();
              } catch (error) {
                console.error("Erro ao apagar imagem:", error);
                Alert.alert("Erro", "Não foi possível apagar a imagem.");
              }
          },
          style: "destructive"
        }
      ]
    );
  }

    useEffect(() => {
      fetchPatientData();
    }, []);

  return (
    <View style={{ flexGrow: 1 }}>
      <GenericHeader hasArrowBack={true} title="Imagens" />
      <SafeAreaView style={styles.container}>
        <View style={styles.infoCards}>
          <PatientInfoCard icon="user" content={patientName} label="Paciente" />
          <PatientInfoCard icon="landPlot" content={patientRegion} label="Região" />
        </View>
        
        {openedImage &&
          <ExpandedImageCard 
            image={openedImage} 
            onClose={() => setOpenedImageId(null)} 
            onSaveComment={handleSaveComment}
            onDelete={handleDeleteImage}
          />
        }

        <GalleryCard  
          images={images}
          onImagePress={(id) => setOpenedImageId(id)}
        />
        <PlusButton onPress={handleNewPhoto}/>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{
    padding: 24,
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    marginTop: 24,
  },

  infoCards: {
    gap: 16
  }
})
