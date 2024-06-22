/* eslint-disable react/prop-types */

import { useEffect, useState } from 'react';
import { Button, Grid } from '@mui/material';
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import "./css/styles.css"

const IMAGE_DEFAULT = '/img/CI.png'

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

  return (
    <div style={{ width: "100%" }}>

      <input
        accept="image/*"
        style={{ display: 'none' }}
        id="image-upload"
        type="file"
        onChange={saveImage}
      />

      <div className='containerProfileImage'>
        <img src={selectedImage ? selectedImage : IMAGE_DEFAULT}
          alt="Imagen de Perfil"
          className='imgProfile' />
      </div>

      <Grid item lg={12} xl={12} md={12} sm={12} xs={12}>
        <Button variant="contained" component="span" style={{ width: "100%", float: "left", padding: 10, margin: "-3px 0px 4% 1%" }}>
          <DriveFolderUploadIcon />
          <label htmlFor="image-upload">
            <span style={{ marginLeft: 5, fontSize: 12 }}>
              Subir Imagen
            </span>
          </label>
        </Button>
      </Grid>

    </div>
  );
};

export default ImageUploader;
