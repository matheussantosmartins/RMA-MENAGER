import { useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { deleteCustomer, listCustomers } from '../../api/customers';
import { SearchInput } from '../../components/ui/SearchInput';
import { Pagination } from '../../components/ui/Pagination';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { Alert } from '../../components/ui/Alert';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { getErrorMessage } from '../../utils/errorMessage';
import { CustomerFormModal } from './CustomerFormModal';
import type { Customer } from '../../types/customer';

const PAGE_SIZE = 10;

export function CustomersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [editingCustomer, setEditingCustomer] = useState<Customer | null | undefined>(undefined);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['customers', page, search],
    queryFn: () => listCustomers({ page, pageSize: PAGE_SIZE, search: search || undefined }),
    placeholderData: keepPreviousData,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCustomer(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['customers'] });
      setDeletingCustomer(null);
    },
    onError: (err) => setDeleteError(getErrorMessage(err)),
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Clientes</h1>
          <p className="text-sm text-slate-500">Gerencie os clientes cadastrados</p>
        </div>
        <Button onClick={() => setEditingCustomer(null)}>
          <Plus className="h-4 w-4" />
          Novo cliente
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <SearchInput
          placeholder="Buscar por nome ou e-mail..."
          onSearch={(value) => {
            setSearch(value);
            setPage(1);
          }}
        />
      </div>

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
                    <th className="px-4 py-2">Telefone</th>
                    <th className="px-4 py-2">Endereço</th>
                    <th className="px-4 py-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data?.items.map((customer) => (
                    <tr key={customer.id} className="hover:bg-slate-50">
                      <td className="px-4 py-2 font-medium text-slate-800">{customer.name}</td>
                      <td className="px-4 py-2 text-slate-600">{customer.email}</td>
                      <td className="px-4 py-2 text-slate-600">{customer.phone ?? '—'}</td>
                      <td className="px-4 py-2 text-slate-600">{customer.address ?? '—'}</td>
                      <td className="px-4 py-2">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setEditingCustomer(customer)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-brand-600"
                            aria-label="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteError(null);
                              setDeletingCustomer(customer);
                            }}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600"
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
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                        Nenhum cliente encontrado
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

      {editingCustomer !== undefined && (
        <CustomerFormModal
          customer={editingCustomer}
          onClose={() => setEditingCustomer(undefined)}
        />
      )}

      {deletingCustomer && (
        <ConfirmDialog
          title="Excluir cliente"
          description={`Tem certeza que deseja excluir "${deletingCustomer.name}"? Esta ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          isLoading={deleteMutation.isPending}
          onCancel={() => setDeletingCustomer(null)}
          onConfirm={() => deleteMutation.mutate(deletingCustomer.id)}
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
