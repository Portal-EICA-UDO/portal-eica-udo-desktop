import React, { useEffect, useState } from 'react';
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

export default function Biblioteca(){
  const { control, watch } = useForm({ defaultValues: { interests: [], name: '' } });
  const selectedInterests = watch('interests') as Array<string | number> | undefined;
  const searchName = watch('name') as string | undefined;

  const [libros, setLibros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalLibro, setModalLibro] = useState<any | null>(null);
  
  const reloadLibros = async () => {
      try {
        const { data, error } = await supabase.from('libros').select('*');
        if (error) throw error;
        if (Array.isArray(data)) {
          setLibros(data as any[]);
        }
      } catch (err) {
        console.error('loadLibros error:', err);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    let mounted = true;
    const loadLibros = async () => {
      try {
        const { data, error } = await supabase.from('libros').select('*');
        if (error) throw error;
        if (mounted && Array.isArray(data)) {
          setLibros(data as any[]);
        }
      } catch (err) {
        console.error('loadLibros error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadLibros();
    return () => {
      mounted = false;
    };
  }, []);

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

  const librosFiltered = libros.filter(matchesFilter);
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

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto w-full flex flex-col min-h-[80vh]">
        <FiltradoBiblioteca control={control} name="interests" reloadLibros={reloadLibros}/>
        
        {loading ? (
          <p className="text-gray-600">Cargando libros...</p>
        ) : (
          <div className="gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-items-center max-w-7xl mx-auto w-full flex-1 p-4">
            {librosFiltered.map((libro) => {
              return (
                <BibliotecaCard
                  key={libro.id}
                  libro={libro}
                  onOpenDescription={(l, thumbnail) => setModalLibro({ ...l, __thumbnail: thumbnail })}
                />
              );
            })}
          </div>
        )}

        {modalLibro && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white max-w-lg w-full rounded-md overflow-hidden shadow-lg">
              <div className="w-full h-56 overflow-hidden">
                <img src={getCoverSrc(modalLibro)} alt={modalLibro.nombre} className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <h2 className="text-lg font-semibold">{modalLibro.nombre}</h2>
                <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{modalLibro.descripcion}</p>
                <div className="mt-4 flex gap-2">
                  {getDownloadHref(modalLibro) && (
                    <a href={getDownloadHref(modalLibro)} target="_blank" rel="noreferrer" download className="px-3 py-2 bg-blue-600 text-white rounded text-sm">Descargar</a>
                  )}
                  <button onClick={() => setModalLibro(null)} className="px-3 py-2 border rounded text-sm">Cerrar</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
