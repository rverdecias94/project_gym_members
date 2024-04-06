/* eslint-disable react/prop-types */

import { useEffect, useState } from 'react';
import { Button, Grid } from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import "./css/styles.css"


const ImageUploader = ({ setImageBase64, image }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageFormated, setImageformated] = useState(null);

  useEffect(() => {
    console.log(image)
    if (image && image !== null) {
      setSelectedImage(image);
    }
  }, [image])

  useEffect(() => {
    setImageBase64(imageFormated)
  }, [imageFormated, setImageBase64])


  const saveImage = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      const imageUrl = reader.result;
      setSelectedImage(imageUrl);
      setImageformated(imageUrl);
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
    <div style={{ width: "100%" }}>

      <input
        accept="image/*"
        style={{ display: 'none' }}
        id="image-upload"
        type="file"
        onChange={saveImage}
      />
      <Grid style={{ display: "flex", gap: 10, width: "100%", justifyContent: "space-between" }}>
        <Grid item sm={6} xs={6} style={{ width: "50%" }}>
          <Button variant="contained" component="span" style={{ width: "100%" }}>
            <DriveFolderUploadIcon />
            <label htmlFor="image-upload">
              <span style={{ marginLeft: 5 }}>
                Subir Imagen
              </span>
            </label>
          </Button>
        </Grid>
        <Grid item sm={6} xs={6} style={{ width: "50%" }}>
          <Button variant="contained" onClick={handleCameraCapture} style={{ width: "100%" }} >
            <CameraAltIcon />
            <span style={{ marginLeft: 5 }}>
              Tomar foto
            </span>
          </Button>
        </Grid>
      </Grid>
      <br />
      {selectedImage &&
        <div className='containerProfileImage'>
          <img src={selectedImage}
            alt="Imagen de Perfil"
            className='imgProfile' />
        </div>
      }
      <br />
    </div>
  );
};

export default ImageUploader;
