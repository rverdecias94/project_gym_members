export const processImage = (file) => {
  return new Promise((resolve, reject) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      reject(new Error('Formato inválido. Solo se permite png, jpg, webp, jpeg.'));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      reject(new Error('El archivo no debe superar los 2MB.'));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        let quality = 0.9;
        let dataUrl = '';
        let passes = 0;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const compress = () => {
          canvas.width = width;
          canvas.height = height;
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          dataUrl = canvas.toDataURL('image/jpeg', quality);
          // Calculate approx size in kb from base64 string
          const sizeKB = Math.round((dataUrl.length * 3) / 4 / 1024);

          if (sizeKB > 100 && passes < 15) {
            quality -= 0.1;
            if (quality < 0.3) {
              width *= 0.9;
              height *= 0.9;
              quality = 0.8;
            }
            passes++;
            compress();
          } else {
            resolve(dataUrl);
          }
        };

        compress();
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};
