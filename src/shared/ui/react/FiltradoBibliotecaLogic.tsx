import { useState, useMemo, useRef, useEffect } from 'react';
import { useController, type Control } from 'react-hook-form';

interface Option {
  id: string | number;
  name: string;
}

interface MultiSelectProps {
  control: Control<any>;
  name: string;
  options: Option[];
  placeholder?: string;
}

const MultiSelect = ({ control, name, options, placeholder = 'Buscar y seleccionar...' }: MultiSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<Option[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { field } = useController({
    name,
    control,
    defaultValue: [],
  });

  // Filtrar opciones basado en búsqueda
  const filteredOptions = useMemo(() => {
    return options.filter(option => 
      option.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selectedOptions.some(selected => selected.id === option.id)
    );
  }, [options, searchTerm, selectedOptions]);

  // Manejar selección
  const handleSelect = (option: Option) => {
    const newSelected = [...selectedOptions, option];
    setSelectedOptions(newSelected);
    field.onChange(newSelected.map(opt => opt.id)); // Envía solo los IDs al formulario
    setSearchTerm('');
    inputRef.current?.focus();
  };

  // Eliminar opción seleccionada
  const handleRemove = (optionId: string | number) => {
    const newSelected = selectedOptions.filter(opt => opt.id !== optionId);
    setSelectedOptions(newSelected);
    field.onChange(newSelected.map(opt => opt.id));
  };

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={wrapperRef}>
      {/* Input de búsqueda */}
      <div className="flex flex-wrap gap-2 p-2 border rounded-lg min-h-11">
        {/* Opciones seleccionadas */}
        {selectedOptions.map(option => (
          <span
            key={option.id}
            className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
          >
            {option.name}
            <button
              type="button"
              onClick={() => handleRemove(option.id)}
              className="ml-1 text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              ×
            </button>
          </span>
        ))}
        
        {/* Input para búsqueda */}
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={selectedOptions.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] outline-none bg-transparent"
        />
      </div>

      {/* Dropdown con opciones filtradas */}
      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
          {filteredOptions.map(option => (
            <div
              key={option.id}
              onClick={() => handleSelect(option)}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
            >
              {option.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;