import { useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { deleteProduct, listProducts } from '../../api/products';
import { SearchInput } from '../../components/ui/SearchInput';
import { Pagination } from '../../components/ui/Pagination';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { Alert } from '../../components/ui/Alert';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { getErrorMessage } from '../../utils/errorMessage';
import { ProductFormModal } from './ProductFormModal';
import type { Product } from '../../types/product';

const PAGE_SIZE = 10;

export function ProductsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null | undefined>(undefined);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['products', page, search],
    queryFn: () => listProducts({ page, pageSize: PAGE_SIZE, search: search || undefined }),
    placeholderData: keepPreviousData,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['products'] });
      setDeletingProduct(null);
    },
    onError: (err) => setDeleteError(getErrorMessage(err)),
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Produtos</h1>
          <p className="text-sm text-slate-500">Gerencie o catálogo de produtos</p>
        </div>
        <Button onClick={() => setEditingProduct(null)}>
          <Plus className="h-4 w-4" />
          Novo produto
        </Button>
      </div>

      <SearchInput
        placeholder="Buscar por nome, SKU ou marca..."
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
                    <th className="px-4 py-2">SKU</th>
                    <th className="px-4 py-2">Nome</th>
                    <th className="px-4 py-2">Marca</th>
                    <th className="px-4 py-2">Categoria</th>
                    <th className="px-4 py-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data?.items.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50">
                      <td className="px-4 py-2 font-mono text-xs text-slate-600">{product.sku}</td>
                      <td className="px-4 py-2 font-medium text-slate-800">{product.name}</td>
                      <td className="px-4 py-2 text-slate-600">{product.brand ?? '—'}</td>
                      <td className="px-4 py-2 text-slate-600">{product.category ?? '—'}</td>
                      <td className="px-4 py-2">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setEditingProduct(product)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-brand-600"
                            aria-label="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteError(null);
                              setDeletingProduct(product);
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
                        Nenhum produto encontrado
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

      {editingProduct !== undefined && (
        <ProductFormModal product={editingProduct} onClose={() => setEditingProduct(undefined)} />
      )}

      {deletingProduct && (
        <ConfirmDialog
          title="Excluir produto"
          description={`Tem certeza que deseja excluir "${deletingProduct.name}"? Esta ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          isLoading={deleteMutation.isPending}
          onCancel={() => setDeletingProduct(null)}
          onConfirm={() => deleteMutation.mutate(deletingProduct.id)}
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
