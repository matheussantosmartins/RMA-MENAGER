import { useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ImagePlus, Trash2 } from 'lucide-react';
import { deleteRmaImage, uploadRmaImages } from '../../api/rmas';
import { Spinner } from '../../components/ui/Spinner';
import { Alert } from '../../components/ui/Alert';
import { getErrorMessage } from '../../utils/errorMessage';
import type { RmaImage } from '../../types/rma';

export function RmaImageGallery({ rmaId, images }: { rmaId: string; images: RmaImage[] }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['rma', rmaId] });
  };

  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => uploadRmaImages(rmaId, files),
    onSuccess: invalidate,
    onError: (err) => setError(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (imageId: string) => deleteRmaImage(rmaId, imageId),
    onSuccess: invalidate,
    onError: (err) => setError(getErrorMessage(err)),
  });

  return (
    <div className="flex flex-col gap-3">
      {error && <Alert variant="error">{error}</Alert>}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((image) => (
          <div
            key={image.id}
            className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200"
          >
            <img src={image.url} alt={image.filename} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => deleteMutation.mutate(image.id)}
              disabled={deleteMutation.isPending}
              className="absolute right-1.5 top-1.5 rounded-full bg-slate-900/60 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Remover imagem"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadMutation.isPending}
          className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-slate-300 text-slate-400 hover:border-brand-400 hover:text-brand-600"
        >
          {uploadMutation.isPending ? (
            <Spinner className="h-5 w-5" />
          ) : (
            <>
              <ImagePlus className="h-5 w-5" />
              <span className="text-xs">Adicionar</span>
            </>
          )}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length > 0) {
            setError(null);
            uploadMutation.mutate(files);
          }
          e.target.value = '';
        }}
      />
    </div>
  );
}
