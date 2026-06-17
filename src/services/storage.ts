import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

export const storageService = {
  uploadFotoCasal: async (
    casalId: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<string | null> => {
    if (!storage) return null;

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Arquivo muito grande. Máximo 5MB.');
    }

    const resizedBlob = await resizeImage(file, 400, 400);

    const storageRef = ref(storage, `casais/${casalId}/foto.jpg`);

    return new Promise((resolve, reject) => {
      const uploadTask = uploadBytesResumable(storageRef, resizedBlob);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress?.(progress);
        },
        (error) => {
          console.error('Erro no upload:', error);
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  },

  deleteFotoCasal: async (casalId: string): Promise<boolean> => {
    if (!storage) return false;
    try {
      const storageRef = ref(storage, `casais/${casalId}/foto.jpg`);
      await deleteObject(storageRef);
      return true;
    } catch (e) {
      console.error('Erro ao deletar foto:', e);
      return false;
    }
  }
};

function resizeImage(file: File, maxWidth: number, maxHeight: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');

      const size = Math.min(img.width, img.height);
      const sx = (img.width - size) / 2;
      const sy = (img.height - size) / 2;

      canvas.width = maxWidth;
      canvas.height = maxHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 2D context não disponível'));
        return;
      }

      ctx.drawImage(img, sx, sy, size, size, 0, 0, maxWidth, maxHeight);

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Falha ao criar blob'));
        },
        'image/jpeg',
        0.8
      );
    };
    img.onerror = () => reject(new Error('Falha ao carregar imagem'));
    img.src = URL.createObjectURL(file);
  });
}
