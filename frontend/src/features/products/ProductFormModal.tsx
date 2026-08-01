import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { createProduct, updateProduct } from '../../api/products';
import { getErrorMessage } from '../../utils/errorMessage';
import type { Product } from '../../types/product';

const productSchema = z.object({
  sku: z.string().min(2, 'SKU deve ter ao menos 2 caracteres'),
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  brand: z.string().optional().or(z.literal('')),
  category: z.string().optional().or(z.literal('')),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormModalProps {
  product?: Product | null;
  onClose: () => void;
}

export function ProductFormModal({ product, onClose }: ProductFormModalProps) {
  const queryClient = useQueryClient();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isEditing = Boolean(product);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      sku: product?.sku ?? '',
      name: product?.name ?? '',
      brand: product?.brand ?? '',
      category: product?.category ?? '',
    },
  });

  const mutation = useMutation({
    mutationFn: (data: ProductFormData) =>
      isEditing ? updateProduct(product!.id, data) : createProduct(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['products'] });
      onClose();
    },
    onError: (err) => setSubmitError(getErrorMessage(err)),
  });

  return (
    <Modal title={isEditing ? 'Editar produto' : 'Novo produto'} onClose={onClose}>
      <form
        onSubmit={handleSubmit((data) => mutation.mutate(data))}
        className="flex flex-col gap-4"
        noValidate
      >
        {submitError && <Alert variant="error">{submitError}</Alert>}

        <Input label="SKU" error={errors.sku?.message} {...register('sku')} />
        <Input label="Nome" error={errors.name?.message} {...register('name')} />
        <Input label="Marca" error={errors.brand?.message} {...register('brand')} />
        <Input label="Categoria" error={errors.category?.message} {...register('category')} />

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting || mutation.isPending}>
            {isEditing ? 'Salvar alterações' : 'Criar produto'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
