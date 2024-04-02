import { useEffect, useState } from 'react';
import { Button, Grid } from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import { supabase } from '../supabase/client';



const ImageUploader = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const BASEURL = "https://gjgclazfoptzgjdbxvgd.supabase.co/storage/v1/object/"

  /* useEffect(() => {
    saveImage()
  }, [selectedImage]) */

  /* const saveImage = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const { data, error } = await supabase.storage.from('member-image').upload(`images/${file.name}`, file, {
        cacheControl: '3600',
      });

      if (error) {
        console.error('Error uploading image:', error.message);
        return;
      }

      const imageUrl = data.Key;
      setSelectedImage(imageUrl);
    } catch (error) {
      console.error('Error uploading image:', error.message);
    }
  }; */

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setSelectedImage(reader.result);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const mediaStreamTrack = stream.getVideoTracks()[0];
      const imageCapture = new ImageCapture(mediaStreamTrack);
      const blob = await imageCapture.takePhoto();
      const imageUrl = URL.createObjectURL(blob);
      setSelectedImage(imageUrl);
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  return (
    <div style={{ width: "100%", marginLeft: 8 }}>
      <input
        accept="image/*"
        style={{ display: 'none' }}
        id="image-upload"
        type="file"
        onChange={handleImageChange}
      />
      <Grid style={{ display: "flex", gap: 10, width: "100%", justifyContent: "space-between" }}>
        <Grid item sm={6} xs={6}>
          <Button variant="contained" component="span">
            <DriveFolderUploadIcon />
            <label htmlFor="image-upload">

              <span style={{ marginLeft: 5 }}>
                Subir Imagen
              </span>
            </label>
          </Button>
        </Grid>
        <Grid item sm={6} xs={6}>
          <Button variant="contained" onClick={handleCameraCapture}>
            <CameraAltIcon />
            <span style={{ marginLeft: 5 }}>
              Tomar foto
            </span>
          </Button>
        </Grid>
      </Grid>
      <br />
      {selectedImage && (
        <img src={selectedImage} alt="Selected" style={{ maxWidth: '100%', marginTop: '10px', borderRadius: 5, width: "100%", height: "auto" }} />
      )}
      <br />
    </div>
  );
};

export default ImageUploader;
/*  <img src={`${BASEURL}/member-image/${selectedImage}`} alt="Selected" style={{ maxWidth: '100%', marginTop: '10px' }} /> */


/* import { useState } from 'react';
import { Button, Container, TextField } from '@mui/material';

const ImageUploader = () => {
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setSelectedImage(reader.result);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  

  return (
    <Container>
      <input
        accept="image/*"
        style={{ display: 'none' }}
        id="image-upload"
        type="file"
        onChange={handleImageChange}
      />
      <label htmlFor="image-upload">
        <Button variant="contained" component="span">
          Upload Image
        </Button>
      </label>

      <TextField
        label="Image Description"
        variant="outlined"
        fullWidth
        multiline
        rows={4}
        style={{ marginTop: '10px' }}
      />
    </Container>
  );
};

export default ImageUploader;
 */