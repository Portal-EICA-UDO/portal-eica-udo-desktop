import React, { useEffect, useState } from 'react';
import { Card } from '@shared/ui/react/Card';
import { supabase } from '@shared/api';
import { RCActiveModalButton } from '@shared/ui/react/RCModalButton';
import {Modal} from "@shared/ui/react/Modal";
import type { Carrera } from '../type/type';


function getImageUrl(bucketName: string, fileName: string): string {
    const projectRef = "xyzcompany"; // Reemplaza con tu Project Ref
    return `https://ldnmltnoowonkijxtrag.supabase.co/storage/v1/object/public/${bucketName}/${fileName}`;
}

const CarrerasGrid = () => {
    const [data, setData] = useState<Carrera[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>("");
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const { data, error } = await supabase.from("carreras").select("*");
                if (error) throw error;
                setData(data);
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
                            `${carrera.imagen_url}.jpg`
                        )}
                        title={carrera.nombre}
                    >
                        <RCActiveModalButton label="Ver detalles">
                            <Modal
                                imageSrc={getImageUrl(
                                    "carreras-imagenes",
                                    `${carrera.imagen_url}.jpg`
                                )}
                                imageAlt="imagen"
                                title={carrera.nombre}
                                description={carrera.descripcion}
                                buttonLabel="descargar"
                            />
                        </RCActiveModalButton>
                    </Card>
                ))
            }
        </div>
    );
};

export default CarrerasGrid;