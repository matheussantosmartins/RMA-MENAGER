import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getRma, createRma, updateRma } from '../../api/rmas';
import { listCustomers } from '../../api/customers';
import { listProducts } from '../../api/products';
import { listUsers } from '../../api/users';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { Spinner } from '../../components/ui/Spinner';
import { PRIORITY_LABELS, PRIORITY_OPTIONS } from '../../constants/rma';
import { getErrorMessage } from '../../utils/errorMessage';

const rmaFormSchema = z.object({
  customerId: z.string().uuid('Selecione um cliente'),
  productId: z.string().uuid('Selecione um produto'),
  serialNumber: z.string().optional().or(z.literal('')),
  issueDescription: z.string().min(10, 'Descreva o problema com ao menos 10 caracteres'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  assignedToId: z.string().optional().or(z.literal('')),
});

type RmaFormData = z.infer<typeof rmaFormSchema>;

export function RmaFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const rmaQuery = useQuery({
    queryKey: ['rma', id],
    queryFn: () => getRma(id!),
    enabled: isEditing,
  });

  const customersQuery = useQuery({
    queryKey: ['customers-options'],
    queryFn: () => listCustomers({ page: 1, pageSize: 100 }),
  });

  const productsQuery = useQuery({
    queryKey: ['products-options'],
    queryFn: () => listProducts({ page: 1, pageSize: 100 }),
  });

  const techniciansQuery = useQuery({
    queryKey: ['technicians-options'],
    queryFn: () => listUsers({ page: 1, pageSize: 100, role: 'TECHNICIAN' }),
    enabled: currentUser?.role === 'ADMIN',
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RmaFormData>({
    resolver: zodResolver(rmaFormSchema),
    values: rmaQuery.data
      ? {
          customerId: rmaQuery.data.customer.id,
          productId: rmaQuery.data.product.id,
          serialNumber: rmaQuery.data.serialNumber ?? '',
          issueDescription: rmaQuery.data.issueDescription,
          priority: rmaQuery.data.priority,
          assignedToId: rmaQuery.data.assignedTo?.id ?? '',
        }
      : undefined,
  });

  const mutation = useMutation({
    mutationFn: (data: RmaFormData) => {
      const payload = { ...data, assignedToId: data.assignedToId || undefined };
      return isEditing ? updateRma(id!, payload) : createRma(payload);
    },
    onSuccess: (rma) => navigate(`/rmas/${rma.id}`),
    onError: (err) => setSubmitError(getErrorMessage(err)),
  });

  if (isEditing && rmaQuery.isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex w-fit items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </button>

      <h1 className="text-xl font-semibold text-slate-900">
        {isEditing ? 'Editar RMA' : 'Novo RMA'}
      </h1>

      <form
        onSubmit={handleSubmit((data) => mutation.mutate(data))}
        className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        noValidate
      >
        {submitError && <Alert variant="error">{submitError}</Alert>}

        <Select label="Cliente" error={errors.customerId?.message} {...register('customerId')}>
          <option value="">Selecione um cliente</option>
          {customersQuery.data?.items.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name}
            </option>
          ))}
        </Select>

        <Select label="Produto" error={errors.productId?.message} {...register('productId')}>
          <option value="">Selecione um produto</option>
          {productsQuery.data?.items.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name} ({product.sku})
            </option>
          ))}
        </Select>

        <Input
          label="Número de série (opcional)"
          error={errors.serialNumber?.message}
          {...register('serialNumber')}
        />

        <Textarea
          label="Descrição do problema"
          rows={4}
          error={errors.issueDescription?.message}
          {...register('issueDescription')}
        />

        <Select label="Prioridade" error={errors.priority?.message} {...register('priority')}>
          {PRIORITY_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {PRIORITY_LABELS[option]}
            </option>
          ))}
        </Select>

        {currentUser?.role === 'ADMIN' && (
          <Select label="Atribuído a (opcional)" {...register('assignedToId')}>
            <option value="">Não atribuído</option>
            {techniciansQuery.data?.items.map((technician) => (
              <option key={technician.id} value={technician.id}>
                {technician.name}
              </option>
            ))}
          </Select>
        )}

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting || mutation.isPending}>
            {isEditing ? 'Salvar alterações' : 'Criar RMA'}
          </Button>
        </div>
      </form>
    </div>
  );
}
