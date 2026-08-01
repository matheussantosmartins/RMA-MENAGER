import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { createCustomer, updateCustomer } from '../../api/customers';
import { getErrorMessage } from '../../utils/errorMessage';
import type { Customer } from '../../types/customer';

const customerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerFormModalProps {
  customer?: Customer | null;
  onClose: () => void;
}

export function CustomerFormModal({ customer, onClose }: CustomerFormModalProps) {
  const queryClient = useQueryClient();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isEditing = Boolean(customer);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: customer?.name ?? '',
      email: customer?.email ?? '',
      phone: customer?.phone ?? '',
      address: customer?.address ?? '',
    },
  });

  const mutation = useMutation({
    mutationFn: (data: CustomerFormData) =>
      isEditing ? updateCustomer(customer!.id, data) : createCustomer(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['customers'] });
      onClose();
    },
    onError: (err) => setSubmitError(getErrorMessage(err)),
  });

  return (
    <Modal title={isEditing ? 'Editar cliente' : 'Novo cliente'} onClose={onClose}>
      <form
        onSubmit={handleSubmit((data) => mutation.mutate(data))}
        className="flex flex-col gap-4"
        noValidate
      >
        {submitError && <Alert variant="error">{submitError}</Alert>}

        <Input label="Nome" error={errors.name?.message} {...register('name')} />
        <Input label="E-mail" type="email" error={errors.email?.message} {...register('email')} />
        <Input label="Telefone" error={errors.phone?.message} {...register('phone')} />
        <Input label="Endereço" error={errors.address?.message} {...register('address')} />

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting || mutation.isPending}>
            {isEditing ? 'Salvar alterações' : 'Criar cliente'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
