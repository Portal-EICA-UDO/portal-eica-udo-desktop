import React, { useEffect, useState } from 'react';
import { Card } from '@shared/ui/react/Card';
import { supabase } from '@shared/api';
import { RCActiveModalButton } from '@shared/ui/react/RCModalButton';
import { Modal } from "@shared/ui/react/Modal";
import type { Carrera } from '../type/type';


function getImageUrl(bucketName: string, fileName: string): string {
    const projectRef = "xyzcompany"; // Reemplaza con tu Project Ref
    return `https://ldnmltnoowonkijxtrag.supabase.co/storage/v1/object/public/${bucketName}/${fileName}`;
}

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

function isHttpUrl(value: any) {
    return typeof value === 'string' && /^(https?:)?\/\//.test(value);
}

function driveDownloadUrl(driveId: string) {
    return `https://drive.google.com/uc?export=download&id=${driveId}`;
}

const getDownloadHref = (lib: any) => {
    if (!lib?.horario_url) return undefined;
    if (isHttpUrl(lib.horario_url)) {
        const id = extractDriveId(lib.horario_url);
        if (id) return driveDownloadUrl(id);
        return lib.horario_url;
    }
    return lib.horario_url;
};

const CarrerasGrid = () => {
    const [data, setData] = useState<Carrera[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>("");
    const [dependencias, setDependencias] = useState<any[]>([]);
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const { data, error } = await supabase.from("carreras").select(
                    `id,
                    nombre,
                    imagen_url,
                    descripcion,
                    horario_url,
                    dependencias (
                        id,
                        nombre,
                        id_carrera,
                        staff (
                            id,
                            nombre,
                            apellido
                        )
                    )`

                );
                if (error) throw error;
                setData((data as any) as Carrera[]);
                console.log("Carreras obtenidas:", data);
            } catch (e) {
                setError(e as any);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="col-span-full text-center py-12">
                <p className="text-gray-600">Cargando staff...</p>
            </div>
        );
    }

    if (error) {
        console.log("Renderizando error:", error);
        return (
            <div className="col-span-full text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar datos</h3>
                <p className="text-gray-600">{error.message || "Error desconocido"}</p>
            </div>
        );
    }

    return (
        <div
            className="gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-items-center max-w-7xl mx-auto w-full flex-1 p-4"
        >
            {
                data &&
                data.map((carrera: Carrera, i) => (
                    <Card
                        imageSrc={getImageUrl(
                            "carreras-imagenes",
                            `${carrera.imagen_url}`
                        )}
                        title={carrera.nombre}
                        key={i}
                    >
                        <RCActiveModalButton label="Ver detalles">
                            <Modal
                                imageSrc={getImageUrl(
                                    "carreras-imagenes",
                                    `${carrera.imagen_url}`
                                )}
                                imageAlt="imagen"
                                title={carrera.nombre}
                                description={carrera.descripcion}
                                buttonHref={getDownloadHref(carrera)}
                                buttonLabel="Descargar"
                                dependency={carrera.dependencias}
                            />
                        </RCActiveModalButton>
                    </Card>
                ))
            }
        </div>
    );
};

export default CarrerasGrid;