import { useEffect, useState } from "react";
import SchoolCard from "./SchoolCard";
import { RCActiveModalButton } from "@shared/ui/react/RCModalButton";
import { BookOpenText } from "lucide-react";
import { Modal } from "./Modal";
import type { School } from "../types";
import { getSchools } from "../api/requests";

export const Schools = () => {
  const [data, setData] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>("");
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getSchools();

        const newData = data?.map((escuela: any) => {
          return {
            id: escuela.id,
            nombre: escuela.nombre,
            mision: escuela.mision,
            vision: escuela.vision,
            descripcion: escuela.descripcion,
            objetivos: escuela.objetivos,
            dependencias: escuela.dependencias.map((dep: any) => {
              return {
                nombre: dep.nombre,
                coordinador: dep.nombre,
              };
            }),
          };
        });
        if (error) throw error;
        setData(newData || []);
        console.log(data);
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
        <p className="text-gray-600">Cargando escuelas...</p>
      </div>
    );
  }

  if (error) {
    console.log("Renderizando error:", error);
    return (
      <div className="col-span-full text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Error al cargar datos
        </h3>
        <p className="text-gray-600">{error.message || "Error desconocido"}</p>
      </div>
    );
  }

  return (
    <div className="gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-items-center max-w-7xl mx-auto w-full flex-1 p-4">
      {data &&
        data.map((e: School, i) => (
          <SchoolCard key={i} school={e}>
            <RCActiveModalButton
              label="Saber mas"
              icon={<BookOpenText />}
              iconPosition="right"
            >
              <Modal school={e} />
            </RCActiveModalButton>
          </SchoolCard>
        ))}
    </div>
  );
};
