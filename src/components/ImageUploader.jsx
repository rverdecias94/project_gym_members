/* eslint-disable react/prop-types */

import { useEffect, useState, useRef } from 'react';
import Webcam from 'react-webcam';
import { Camera, FolderUp, RefreshCcw, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const IMAGE_DEFAULT = '/CI.png';

const ImageUploader = ({ setImageBase64, image }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageFormated, setImageformated] = useState(null);
  const [imageScr, setImageSrc] = useState(null);
  const [facingMode, setFacingMode] = useState("environment");
  const [activeTab, setActiveTab] = useState("upload");

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

  const saveImage = async (event) => {
    setImageSrc(null);
    const file = event.target.files[0];
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

        let quality = 0.7;
        let base64Image = canvas.toDataURL('image/jpeg', quality);

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
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-2 mb-4">
          <TabsTrigger value="upload" className="text-xs sm:text-sm">Subir foto</TabsTrigger>
          <TabsTrigger value="capture" className="text-xs sm:text-sm">Cámara</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4 m-0">
          <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden border-2 border-dashed border-border bg-muted/20 flex items-center justify-center">
            <img 
              src={imageScr ? imageScr : selectedImage ? selectedImage : IMAGE_DEFAULT}
              alt="Perfil"
              className={cn(
                "w-full h-full object-contain",
                !imageScr && !selectedImage && "opacity-50 p-4"
              )}
            />
          </div>

          <div className="relative">
            <input
              accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              id="image-upload"
              type="file"
              onChange={saveImage}
            />
            <Button variant="outline" className="w-full flex items-center justify-center gap-2 pointer-events-none">
              <FolderUp className="w-4 h-4" />
              <span>Seleccionar desde el equipo</span>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="capture" className="space-y-4 m-0">
          <div className="flex gap-2 justify-end mb-2">
            <Button
              variant="outline"
              size="icon"
              className="lg:hidden bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 hover:text-primary"
              onClick={() => setFacingMode(facingMode === 'user' ? 'environment' : 'user')}
              title="Cambiar cámara"
            >
              <RefreshCcw className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20 hover:text-destructive"
              onClick={() => setImageSrc(null)}
              title="Borrar foto actual"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden border-2 border-border bg-muted/20">
            {imageScr ? (
              <img 
                src={imageScr}
                alt="Captura"
                className="w-full h-full object-cover" 
              />
            ) : (
              <Webcam
                audio={false}
                className="w-full h-full object-cover"
                screenshotFormat='image/png'
                ref={webCamRef}
                videoConstraints={{
                  facingMode: facingMode
                }}
              />
            )}
          </div>

          <Button 
            variant="default" 
            className="w-full flex items-center justify-center gap-2"
            onClick={capture}
          >
            <Camera className="w-4 h-4" />
            <span>Capturar foto</span>
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ImageUploader;
