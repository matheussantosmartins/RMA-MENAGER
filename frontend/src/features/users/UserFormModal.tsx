import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { createUser, updateUser } from '../../api/users';
import { getErrorMessage } from '../../utils/errorMessage';
import type { User } from '../../types/user';

function buildUserSchema(isEditing: boolean) {
  return z.object({
    name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
    email: z.string().email('E-mail inválido'),
    password: isEditing
      ? z.union([z.string().length(0), z.string().min(8, 'Senha deve ter ao menos 8 caracteres')])
      : z.string().min(8, 'Senha deve ter ao menos 8 caracteres'),
    role: z.enum(['ADMIN', 'TECHNICIAN']),
  });
}

type UserFormData = z.infer<ReturnType<typeof buildUserSchema>>;

interface UserFormModalProps {
  user?: User | null;
  onClose: () => void;
}

export function UserFormModal({ user, onClose }: UserFormModalProps) {
  const queryClient = useQueryClient();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isEditing = Boolean(user);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(buildUserSchema(isEditing)),
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      password: '',
      role: user?.role ?? 'TECHNICIAN',
    },
  });

  const mutation = useMutation({
    mutationFn: (data: UserFormData) => {
      if (isEditing) {
        return updateUser(user!.id, { ...data, password: data.password || undefined });
      }
      return createUser(data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users'] });
      onClose();
    },
    onError: (err) => setSubmitError(getErrorMessage(err)),
  });

  return (
    <Modal title={isEditing ? 'Editar usuário' : 'Novo usuário'} onClose={onClose}>
      <form
        onSubmit={handleSubmit((data) => mutation.mutate(data))}
        className="flex flex-col gap-4"
        noValidate
      >
        {submitError && <Alert variant="error">{submitError}</Alert>}

        <Input label="Nome" error={errors.name?.message} {...register('name')} />
        <Input label="E-mail" type="email" error={errors.email?.message} {...register('email')} />
        <Input
          label={isEditing ? 'Nova senha (opcional)' : 'Senha'}
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <Select label="Perfil" error={errors.role?.message} {...register('role')}>
          <option value="TECHNICIAN">Técnico</option>
          <option value="ADMIN">Administrador</option>
        </Select>

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting || mutation.isPending}>
            {isEditing ? 'Salvar alterações' : 'Criar usuário'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
