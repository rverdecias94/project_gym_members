/* eslint-disable react/prop-types */

import { useEffect, useState, useRef } from 'react';
import { Box, Button, Grid, Tab, Tabs, Typography } from '@mui/material';
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import "./css/styles.css"
import Webcam from 'react-webcam';
import PropTypes from 'prop-types';
import FlipCameraIosIcon from '@mui/icons-material/FlipCameraIos';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
const IMAGE_DEFAULT = '/img/CI.png'

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 1 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}
CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const ImageUploader = ({ setImageBase64, image }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageFormated, setImageformated] = useState(null);
  const [imageScr, setImageSrc] = useState(null);
  const [facingMode, setFacingMode] = useState("environment");
  const [value, setValue] = useState(0);


  const webCamRef = useRef(null);

  useEffect(() => {
    if (image && image !== null) {
      setSelectedImage(image);
    }
    else {
      setImageSrc(null);
      setSelectedImage(null);
    }
  }, [image])

  useEffect(() => {
    setImageBase64(imageFormated)
  }, [imageFormated, setImageBase64])



  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const saveImage = async (event) => {
    setImageSrc(null);
    const file = event.target.files[0];
    console.log(file)
    if (file) {
      const resizedImage = await resizeImage(file, 500, 500, 50);
      setSelectedImage(resizedImage);
      setImageformated(resizedImage);
    }
  };

  async function capture() {
    setSelectedImage(null);
    const imgSrc = webCamRef.current.getScreenshot();
    if (imgSrc) {
      const resizedImage = await resizeBase64Image(imgSrc, 500, 500, 50);
      setImageSrc(resizedImage);
      setImageformated(resizedImage);
    }
  }

  const resizeImage = (file, maxWidth, maxHeight, maxSizeKB) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;

        img.onload = () => {
          let canvas = document.createElement('canvas');
          let ctx = canvas.getContext('2d');

          const scaleFactor = Math.min(maxWidth / img.width, maxHeight / img.height);
          canvas.width = img.width * scaleFactor;
          canvas.height = img.height * scaleFactor;

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          let quality = 0.7;
          let base64Image = canvas.toDataURL('image/jpeg', quality);

          // Asegúrate de que el tamaño sea menor que maxSizeKB
          while (base64Image.length > maxSizeKB * 1024) {
            base64Image = canvas.toDataURL('image/jpeg', quality);
            quality -= 0.05;
          }

          resolve(base64Image);
        };

        img.onerror = (error) => {
          reject(error);
        };
      };

      reader.onerror = (error) => {
        reject(error);
      };
    });
  };


  const resizeBase64Image = (base64Str, maxWidth, maxHeight, maxSizeKB) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = base64Str;

      img.onload = () => {
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');

        const scaleFactor = Math.min(maxWidth / img.width, maxHeight / img.height);
        canvas.width = img.width * scaleFactor;
        canvas.height = img.height * scaleFactor;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        let quality = 0.7; // Calidad inicial, puedes ajustarla según sea necesario
        let base64Image = canvas.toDataURL('image/jpeg', quality);

        // Asegúrate de que el tamaño sea menor que maxSizeKB
        while (base64Image.length > maxSizeKB * 1024 && quality > 0.1) {
          quality -= 0.05;
          base64Image = canvas.toDataURL('image/jpeg', quality);
        }

        resolve(base64Image);
      };

      img.onerror = (error) => {
        reject(error);
      };
    });
  };





  return (
    <div style={{ width: "101%" }}>
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={value}
            onChange={handleChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="scrollable auto tabs example"
          >
            <Tab label="Subir foto" {...a11yProps(0)} />
            <Tab label="Capturar Foto" {...a11yProps(1)} />
          </Tabs>
          {/* </ScrollableTabs> */}
        </Box>
        <CustomTabPanel value={value} index={0}>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="image-upload"
            type="file"
            onChange={saveImage}
          />

          <div className='containerProfileImage'>
            <img src={imageScr ? imageScr : selectedImage ? selectedImage : IMAGE_DEFAULT}
              alt="Imagen de Perfil"
              className='imgProfile' />
          </div>

          <Grid item lg={12} xl={12} md={12} sm={12} xs={12} style={{ display: "flex", gap: 10 }}>
            <Button variant="contained" component="span" style={{ width: "100%", padding: 10, margin: "-3px 0px 4% 0" }}>
              <DriveFolderUploadIcon />
              <label htmlFor="image-upload">
                <span style={{ marginLeft: 5, fontSize: 12 }}>
                  Subir foto
                </span>
              </label>
            </Button>

          </Grid>
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          <Grid item lg={12} xl={12} md={12} sm={12} xs={12}>
            <Grid item style={{ display: "flex", gap: 10 }}>
              <Button
                variant="contained"
                color='success'
                style={{ width: "fit-content", padding: 10, margin: "4% 0px 0px 0px", backgroundColor: "#356dac" }}
                onClick={() => setFacingMode(facingMode === 'user' ? 'environment' : 'user')}
              >
                <FlipCameraIosIcon />
              </Button>
              <Button
                variant="contained"
                color='error'
                style={{ width: "fit-content", padding: 10, margin: "4% 0px 0px 0px", backgroundColor: "#e74c60" }}
                onClick={() => setImageSrc(null)}
              >
                <DeleteForeverIcon />
              </Button>
            </Grid>
            {
              imageScr ? <img src={imageScr}
                alt="Imagen de Perfil"
                className='imgProfile' />
                :
                <Grid style={{ border: "2px dashed rgb(89 120 177 / 54%)", margin: "1rem 0", borderRadius: 10 }}>
                  <Webcam
                    audio={false}
                    height={250}
                    width={"100%"}
                    screenshotFormat='image/png'
                    ref={webCamRef}
                    videoConstraints={{
                      height: 250,
                      width: 400,
                      facingMode: facingMode
                    }}
                  />
                </Grid>

            }

            <Button variant="contained" component="span" style={{ width: "100%", padding: 10, margin: "-3px 0px 4% 0" }}
              onClick={capture}
            >
              <DriveFolderUploadIcon />
              <span style={{ marginLeft: 5, fontSize: 12 }}>
                Capturar foto
              </span>
            </Button>

          </Grid>
        </CustomTabPanel>
      </Box >
    </div >
  );
};

export default ImageUploader;
