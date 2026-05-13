/**
 * Utilitário para compressão de imagens no lado do cliente usando Canvas API.
 * Reduz as dimensões e a qualidade para otimizar o armazenamento e performance.
 */

export async function compressImage(
  file: File, 
  maxWidth = 800, 
  maxHeight = 800, 
  quality = 0.7
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calcula novas dimensões mantendo o aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        // Desenha a imagem no canvas com as novas dimensões
        ctx.drawImage(img, 0, 0, width, height);
        
        // Exporta como JPEG comprimido
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = (e) => reject(new Error('Erro ao carregar imagem para compressão'));
    };
    reader.onerror = (e) => reject(new Error('Erro ao ler arquivo'));
  });
}
