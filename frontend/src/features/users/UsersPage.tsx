import { useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { deleteUser, listUsers } from '../../api/users';
import { SearchInput } from '../../components/ui/SearchInput';
import { Pagination } from '../../components/ui/Pagination';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { Alert } from '../../components/ui/Alert';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../utils/errorMessage';
import { UserFormModal } from './UserFormModal';
import type { User } from '../../types/user';

const PAGE_SIZE = 10;
const ROLE_LABELS: Record<string, string> = { ADMIN: 'Administrador', TECHNICIAN: 'Técnico' };

export function UsersPage() {
  const { user: currentUser } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<User | null | undefined>(undefined);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['users', page, search],
    queryFn: () => listUsers({ page, pageSize: PAGE_SIZE, search: search || undefined }),
    placeholderData: keepPreviousData,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users'] });
      setDeletingUser(null);
    },
    onError: (err) => setDeleteError(getErrorMessage(err)),
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Usuários</h1>
          <p className="text-sm text-slate-500">Gerencie contas de administradores e técnicos</p>
        </div>
        <Button onClick={() => setEditingUser(null)}>
          <Plus className="h-4 w-4" />
          Novo usuário
        </Button>
      </div>

      <SearchInput
        placeholder="Buscar por nome ou e-mail..."
        onSearch={(value) => {
          setSearch(value);
          setPage(1);
        }}
      />

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Spinner className="h-6 w-6" />
          </div>
        ) : isError ? (
          <div className="p-4">
            <Alert variant="error">{getErrorMessage(error)}</Alert>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-2">Nome</th>
                    <th className="px-4 py-2">E-mail</th>
                    <th className="px-4 py-2">Perfil</th>
                    <th className="px-4 py-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data?.items.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50">
                      <td className="px-4 py-2 font-medium text-slate-800">{user.name}</td>
                      <td className="px-4 py-2 text-slate-600">{user.email}</td>
                      <td className="px-4 py-2 text-slate-600">{ROLE_LABELS[user.role]}</td>
                      <td className="px-4 py-2">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setEditingUser(user)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-brand-600"
                            aria-label="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            disabled={user.id === currentUser?.id}
                            title={
                              user.id === currentUser?.id
                                ? 'Você não pode excluir sua própria conta'
                                : undefined
                            }
                            onClick={() => {
                              setDeleteError(null);
                              setDeletingUser(user);
                            }}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                            aria-label="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {data?.items.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                        Nenhum usuário encontrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {data && <Pagination meta={data.meta} onPageChange={setPage} />}
          </>
        )}
      </div>

      {editingUser !== undefined && (
        <UserFormModal user={editingUser} onClose={() => setEditingUser(undefined)} />
      )}

      {deletingUser && (
        <ConfirmDialog
          title="Excluir usuário"
          description={`Tem certeza que deseja excluir "${deletingUser.name}"? Esta ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          isLoading={deleteMutation.isPending}
          onCancel={() => setDeletingUser(null)}
          onConfirm={() => deleteMutation.mutate(deletingUser.id)}
        />
      )}
      {deleteError && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm">
          <Alert variant="error">{deleteError}</Alert>
        </div>
      )}
    </div>
  );
}
