import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import FiltradoBiblioteca from './FiltradoBiblioteca';
import BibliotecaCard from '@shared/ui/react/BibliotecaCard';
import { supabase } from '@shared/api/lib/supabaseClient';

function extractDriveId(url: string | null | undefined) {
  if (!url) return null;
  const m1 = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (m1) return m1[1];
  const m2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (m2) return m2[1];
  const m3 = url.match(/open\?id=([a-zA-Z0-9_-]+)/);
  if (m3) return m3[1];
  const m4 = url.match(/drive.google.com\/file\/u\/0\/d\/([-_a-zA-Z0-9]+)/);
  if (m4) return m4[1];
  return null;
}

function driveViewUrl(driveId: string) {
  return `https://drive.google.com/uc?export=view&id=${driveId}`;
}

function driveDownloadUrl(driveId: string) {
  return `https://drive.google.com/uc?export=download&id=${driveId}`;
}

function driveThumbnailUrl(driveId: string, size = 600) {
  const googleUrl = `https://drive.google.com/thumbnail?sz=w${size}&id=${driveId}`;
  // Usamos un proxy gratuito para evitar el error 429
  return `https://images.weserv.nl/?url=${encodeURIComponent(googleUrl)}`;
}

function isHttpUrl(value: any) {
  return typeof value === 'string' && /^(https?:)?\/\//.test(value);
}

type BookItem = {
  id: number;
  nombre: string;
  descripcion: string;
  imagen_url: string;
  url: string;
};

export default function Biblioteca() {
  const { control, watch } = useForm({ defaultValues: { interests: [], name: '' } });
  const selectedInterests = watch('interests') as Array<string | number> | undefined;
  const searchName = watch('name') as string | undefined;

  const [libros, setLibros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalLibro, setModalLibro] = useState<any | null>(null);

  const pageSize = 6;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const listContainerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<any>(null);
  const [data, setData] = useState<BookItem[]>([]);



  const reloadLibros = async () => {
    await loadLibros();
    // Al ejecutarse esto, 'libros' cambia, 'librosFiltered' se recalcula,
    // y si hay más items, 'totalPages' aumentará automáticamente.
  };

  const loadLibros = useCallback(async () => {
    // Solo ponemos loading true la primera vez para no "parpadear" al recargar
    try {
      const { data, error } = await supabase
        .from('libros')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLibros(data || []);
    } catch (err) {
      console.error('Error cargando libros:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLibros();
  }, [loadLibros]);

  useEffect(() => {
    // Siempre restaurar el scroll si no hay modales activos detectados
    if (!modalLibro) {
      document.documentElement.style.overflow = 'auto';
      document.body.style.overflow = 'auto';
    }
  }, [modalLibro, currentPage]);

  

  useEffect(() => {
    setTotalCount(librosFiltered.length);
    // Solo reiniciamos a la pág 1 si hay una búsqueda activa o filtro de intereses
    // Si solo cambia la cantidad de libros (borrado), nos mantenemos en la página
  }, [searchName, selectedInterests]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchName, selectedInterests]);



  // Thumbnail logic moved into each BibliotecaCard to keep this component simple

  const matchesFilter = (libro: any) => {
    // name filter
    if (searchName && typeof searchName === 'string' && searchName.trim() !== '') {
      const q = searchName.trim().toLowerCase();
      if (!libro?.nombre || typeof libro.nombre !== 'string') return false;
      const name = libro.nombre.toLowerCase();
      // Split title into words and check if any sequence of words (starting at a word boundary)
      // starts with the query. This allows multi-word queries like "nacidos de" to match
      // "nacidos de la bruma" while still requiring starts-with behavior on word boundaries.
      const words = name.split(/\s+/).filter(Boolean);
      let matched = false;
      for (let i = 0; i < words.length && !matched; i++) {
        const phrase = words.slice(i).join(' ');
        if (phrase.startsWith(q)) matched = true;
      }
      if (!matched) return false;
    }

    if (!selectedInterests || selectedInterests.length === 0) return true;
    const etiquetas = libro.etiquetas ?? libro.tags ?? libro.etiquetas_json ?? [];
    let arr: any = etiquetas;
    if (typeof etiquetas === 'string') {
      try {
        arr = JSON.parse(etiquetas);
      } catch {
        arr = [];
      }
    }
    // if etiquetas stored as object like {"0":"Lengua"}, convert to values array
    if (arr && typeof arr === 'object' && !Array.isArray(arr)) {
      try {
        arr = Object.values(arr);
      } catch {
        arr = [];
      }
    }
    if (!Array.isArray(arr)) arr = [];
    const arrStr = arr.map((a: any) => String(a));
    // Require ALL selectedInterests to be present (AND semantics)
    const selected = (selectedInterests || []).map(si => String(si));
    return selected.every(si => arrStr.includes(si));
  };

  const librosFiltered = useMemo(() => {
    return libros.filter(matchesFilter);
  }, [libros, searchName, selectedInterests]);
  const totalPages = Math.ceil(librosFiltered.length / pageSize);

  useEffect(() => {
    // Solo actuamos si no estamos en la página 1 y la página actual es mayor a la cuenta total de páginas
    if (currentPage > 1 && currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Minimal getCoverSrc used for modal preview only (lightweight fallback)
  const getCoverSrc = (libro: any) => {
    if (!libro) return '/images/placeholder.png';
    // prefer thumbnail set by BibliotecaCard when opening modal
    if (libro.__thumbnail) return libro.__thumbnail;
    if (typeof libro.portada === 'string' && /^(https?:)?\/\//.test(libro.portada)) return libro.portada;
    if (typeof libro.imagen_url === 'string' && /^(https?:)?\/\//.test(libro.imagen_url)) return libro.imagen_url;
    const id = extractDriveId(libro.url_download);
    if (id) return driveViewUrl(id);
    return '/images/placeholder.png';
  };


  const getDownloadHref = (libro: any) => {
    if (!libro.url_download) return undefined;
    if (isHttpUrl(libro.url_download)) {
      const id = extractDriveId(libro.url_download);
      if (id) return driveDownloadUrl(id);
      return libro.url_download;
    }
    return libro.url_download;
  };

  const librosPaginados = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return librosFiltered.slice(start, start + pageSize);
  }, [librosFiltered, currentPage]);


  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
      // El timeout asegura que React ya renderizó los nuevos elementos
      setTimeout(() => {
        listContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const PaginationControls: React.FC = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex justify-center items-center space-x-2 p-4 border-t border-gray-100 mt-4">
        {/* Botón Anterior */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 cursor-pointer rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Anterior
        </button>

        {/* Números de página */}
        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => handlePageChange(number)}
            className={`px-3 py-1 text-sm font-medium rounded-md cursor-pointer transition-colors duration-150 ${number === currentPage
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 bg-white border border-gray-300 hover:bg-blue-50 hover:text-blue-700'
              }`}
          >
            {number}
          </button>
        ))}

        {/* Botón Siguiente */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 cursor-pointer rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Siguiente
        </button>
      </div>

    );
  };

  return (
    <div className="w-full" ref={listContainerRef}>
      <div className="max-w-7xl mx-auto w-full flex flex-col min-h-[80vh]">
        <FiltradoBiblioteca control={control} name="interests" reloadLibros={reloadLibros} />

        {loading ? (
          <p className="text-gray-600 p-4">Cargando libros...</p>
        ) : (
          <>
            {/* El GRID solo para los libros */}
            <div className="gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-items-center max-w-7xl mx-auto w-full flex-1 p-4" ref={listContainerRef}>
              {librosPaginados.map((libro) => (
                <BibliotecaCard
                  key={libro.id}
                  libro={libro}
                  onOpenDescription={(l, thumbnail) => setModalLibro({ ...l, __thumbnail: thumbnail })}
                  reloadLibros={reloadLibros}
                />
              ))}
            </div>

            {/* LA PAGINACIÓN fuera del Grid */}

            <PaginationControls />

          </>
        )}

        {/* Modal (se mantiene igual) */}
        {/* ... */}
      </div>
    </div>
  );
}
