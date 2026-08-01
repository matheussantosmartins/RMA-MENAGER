import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';

interface SearchInputProps {
  placeholder?: string;
  onSearch: (value: string) => void;
}

export function SearchInput({ placeholder = 'Buscar...', onSearch }: SearchInputProps) {
  const [value, setValue] = useState('');
  const debounced = useDebouncedValue(value);

  useEffect(() => {
    onSearch(debounced);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return (
    <div className="relative w-full max-w-xs">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm shadow-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
      />
    </div>
  );
}
