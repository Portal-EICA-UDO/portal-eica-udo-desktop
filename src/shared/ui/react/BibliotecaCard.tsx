import React, { useEffect, useState } from 'react';
import { Card } from '@shared/ui/react/Card';
import { RCActiveModalButton } from '@shared/ui/react/RCModalButton';
import { Modal } from '@shared/ui/react/Modal';

type Props = {
  libro: any;
  onOpenDescription: (libro: any, thumbnail?: string | null) => void;
};

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

// Render first page of PDF to dataURL using pdf.js
async function renderPdfToDataUrl(url: string) {
  try {
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf');
    // @ts-ignore
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
    const loadingTask = pdfjs.getDocument({ url });
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const renderTask = page.render({ canvasContext: ctx, viewport });
    await renderTask.promise;
    const dataUrl = canvas.toDataURL('image/png');
    try { pdf.destroy(); } catch (e) {}
    return dataUrl;
  } catch (err) {
    console.error('renderPdfToDataUrl error:', err);
    return null;
  }
}

export default function BibliotecaCard({ libro, onOpenDescription }: Props) {
  const [thumbnail, setThumbnail] = useState<string>('/images/placeholder.png');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!libro) return;
      // priority: portada, imagen_url
      if (isHttpUrl(libro.portada)) {
        if (mounted) {
          setThumbnail(libro.portada);
          console.debug('BibliotecaCard: using portada', libro.portada);
        }
        return;
      }
      if (isHttpUrl(libro.imagen_url)) {
        if (mounted) {
          setThumbnail(libro.imagen_url);
          console.debug('BibliotecaCard: using imagen_url', libro.imagen_url);
        }
        return;
      }

      const url = libro.url_download;
      const id = extractDriveId(url);
      if (id) {
        if (mounted) {
          const src = driveThumbnailUrl(id, 600);
          setThumbnail(src);
          console.debug('BibliotecaCard: using drive thumbnail', src);
        }
        return;
      }

      if (typeof url === 'string' && url.toLowerCase().endsWith('.pdf')) {
        const dataUrl = await renderPdfToDataUrl(url);
        if (dataUrl && mounted) {
          setThumbnail(dataUrl);
          console.debug('BibliotecaCard: rendered PDF to dataUrl');
          return;
        }
      }

      // fallback to drive view or placeholder
      if (isHttpUrl(url)) {
        const id2 = extractDriveId(url);
        if (id2) {
          if (mounted) {
            const src = driveViewUrl(id2);
            setThumbnail(src);
            console.debug('BibliotecaCard: using drive view url', src);
          }
          return;
        }
        if (mounted) {
          setThumbnail(url);
          console.debug('BibliotecaCard: using raw url', url);
        }
        return;
      }

      // final fallback to placeholder (ensures no null/empty src)
      if (mounted) setThumbnail((prev) => prev || '/images/placeholder.png');

      
    };
    load();
    return () => { mounted = false; };
  }, [libro]);

  const getDownloadHref = (lib: any) => {
    if (!lib?.url_download) return undefined;
    if (isHttpUrl(lib.url_download)) {
      const id = extractDriveId(lib.url_download);
      if (id) return driveDownloadUrl(id);
      return lib.url_download;
    }
    return lib.url_download;
  };

  const downloadHref = getDownloadHref(libro);

  return (
    <Card imageSrc={thumbnail ?? '/images/placeholder.png'} title={libro.nombre}>
      <div className="flex items-center gap-2">
        {libro.descripcion && (
          <RCActiveModalButton label={"Descripción"}>
            <Modal
              title={libro.nombre}
              imageSrc={thumbnail ?? '/images/placeholder.png'}
              imageAlt={libro.nombre}
              description={libro.descripcion}
              tags={(() => {
                const etiquetas = libro.etiquetas ?? libro.tags ?? libro.etiquetas_json ?? [];
                let arr = etiquetas;
                if (typeof etiquetas === 'string') {
                  try { arr = JSON.parse(etiquetas); } catch { arr = []; }
                }
                if (!Array.isArray(arr)) arr = [];
                return arr.map((a: any) => String(a));
              })()}
              buttonLabel="Descargar"
              buttonHref={downloadHref}
            />
          </RCActiveModalButton>
        )}
      </div>
    </Card>
  );
}
