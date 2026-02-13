import { useEffect, useState } from 'react';
import { useController, type Control } from 'react-hook-form';
import MultiSelect from '@shared/ui/react/FiltradoBibliotecaLogic';
import { supabase } from '@shared/api/lib/supabaseClient';
import { RCActiveModalButton } from '@shared/ui/react/RCModalButton';
import { CreateBook } from './CrearLibro';
import { ManageEtiquetas } from './GestionarEtiquetas';

interface Props {
  control: Control<any>;
  name?: string;
  reloadLibros: () => void;
}

export default function FiltradoBiblioteca({ control, name = 'interests', reloadLibros }: Props) {
  const [options, setOptions] = useState<{ id: string | number; name: string }[]>([]);

  const { field: nameField } = useController({ name: 'name', control, defaultValue: '' });

  const loadEtiquetas = async () => {
      try {
        const { data, error } = await supabase
          .from('etiquetas')
          .select('id, nombre');
        if (error) throw error;
        if (Array.isArray(data)) {
          // Use tag name as id so the multi-select returns tag names (matches libro.etiquetas)
          setOptions(data.map((e: any) => ({ id: e.nombre, name: e.nombre })));
        }
      } catch (err) {
        console.error('loadEtiquetas error:', err);
      }
    };
    
  useEffect(() => {
    let mounted = true;
    
    loadEtiquetas();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-6 mb-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Biblioteca</h2>
          <p className="text-gray-600 mt-1">Buscar libros por nombre y etiquetas</p>
        </div>
        <div className="flex gap-2">
          <RCActiveModalButton label="Agregar Libro" icon="📚">
            <CreateBook reloadLibros={reloadLibros} />
          </RCActiveModalButton>
          <RCActiveModalButton label="Etiquetas" icon="🏷️">
            <ManageEtiquetas reloadEtiquetas={loadEtiquetas} />
          </RCActiveModalButton>
        </div>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <input
            type="text"
            value={nameField.value}
            onChange={(e) => nameField.onChange(e.target.value)}
            placeholder="Buscar por nombre..."
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</div>
        </div>

        <div>
          <MultiSelect
            control={control}
            name={name}
            options={options}
            placeholder="Buscar etiquetas..."
          />
        </div>
      </div>
    </div>
  );
}


