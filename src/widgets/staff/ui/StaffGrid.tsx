
import React, { useEffect, useState } from 'react';
import { supabase } from '@shared/api';
// Componente Card importado, asumo que acepta propiedades como imagen, título, y children.
import { Card } from "@shared/ui/react/Card";
import { RCActiveModalButton } from '@shared/ui/react/RCModalButton';
import {Modal} from "@shared/ui/react/Modal";
import type { StaffWithMaterias, MateriasMap, Carrera } from '../types/type';

// Función para obtener la URL de la imagen
function getImageUrl(bucketName: string, fileName: string): string {
  return `https://ldnmltnoowonkijxtrag.supabase.co/storage/v1/object/public/${bucketName}/${fileName}`;
}

const StaffGrid = () => {
  // 1. Estados para manejar los datos y el error
  const [staffWithMaterias, setStaffWithMaterias] = useState<StaffWithMaterias[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>("");
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        // ... (Lógica de consulta a Supabase, inalterada)
        const { data: staffList, error: staffError } = await supabase
          .from('staff')
          .select('*')
          .order('nombre', { ascending: true });

        if (staffError) throw staffError;

        console.log("=== STAFF CONSULTA ===");
        console.log("Staff encontrados:", staffList?.length);

        if (staffList && staffList.length > 0) {
          const { data: allPensumRelations, error: pensumError } = await supabase
            .from('pensum')
            .select('*');

          if (pensumError) throw pensumError;

          const materiaIds = allPensumRelations
            ? [...new Set(allPensumRelations.map(p => p.id_materias))]
            : [];

          let materiasConCarreras = [];
          if (materiaIds.length > 0) {
            const { data: materiasFromDB, error: materiasError } = await supabase
              .from('materias')
              .select(`
                *,
                carreras (
                  id,
                  nombre
                )
              `)
              .in('id', materiaIds);

            if (materiasError) throw materiasError;

            materiasConCarreras = materiasFromDB || [];
          }

          const materiasMap: { [key: number]: MateriasMap } = {};
          materiasConCarreras.forEach(materia => {
            const carreraData = Array.isArray(materia.carreras) ? materia.carreras[0] : materia.carreras;

            materiasMap[materia.id] = {
              id: materia.id,
              nombre: materia.nombre,
              carrera: carreraData ? {
                id: carreraData.id,
                nombre: carreraData.nombre
              } : null
            };
          });

          const { data: todasCarreras, error: carrerasError } = await supabase
            .from('carreras')
            .select('id, nombre');

          if (carrerasError) throw carrerasError;

          const carrerasMap: { [key: number]: Carrera } = {};
          todasCarreras?.forEach(carrera => {
            carrerasMap[carrera.id] = carrera;
          });

          const processedStaff = staffList.map(staff => {
            const staffPensum = allPensumRelations
              ? allPensumRelations.filter(p => p.id_staff === staff.id)
              : [];

            const materiasDelStaff = staffPensum
              .map(p => {
                const materia = materiasMap[p.id_materias];
                if (!materia) return null;

                if (!materia.carrera && p.id_carrera) {
                  materia.carrera = carrerasMap[p.id_carrera] || null;
                }

                return materia;
              })
              .filter(m => m);

            const materiasUnicas: MateriasMap[] = [];
            const idsVistos = new Set();
            materiasDelStaff.forEach(materia => {
              if (!materia) return;
              if (!idsVistos.has(materia.id)) {
                idsVistos.add(materia.id);
                materiasUnicas.push(materia);
              }
            });

            return {
              ...staff,
              materias: materiasUnicas
            };
          });

          setStaffWithMaterias(processedStaff);

          console.log("=== STAFF PROCESADO ===");
          processedStaff.forEach((staff, i) => {
            console.log(`${i + 1}. ${staff.nombre}:`, staff.materias);
          });

        } else {
          setStaffWithMaterias([]);
        }

      } catch (e) {
        console.error("Error en la carga de datos:", e);
        setError(e as any);
        setStaffWithMaterias([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Función para obtener la URL de la imagen
  const getStaffImageUrl = (staff:StaffWithMaterias) => {
    if (!staff || !staff.imagen_url) {
      return getImageUrl("staff-imagenes", "default.jpg");
    }

    const imageFileName = staff.imagen_url.includes('.')
      ? staff.imagen_url
      : `${staff.imagen_url}.jpg`;

    return getImageUrl("staff-imagenes", imageFileName);
  };

  // --- Lógica de Renderizado de Estado (Loading, Error, No Data) ---

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

  if (!staffWithMaterias || staffWithMaterias.length === 0) {
    console.log("Renderizando sin datos");
    return (
      <div className="col-span-full text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay staff disponible</h3>
        <p className="text-gray-600">La base de datos no contiene registros de staff.</p>
      </div>
    );
  }


  // --- Renderizar las Tarjetas (Cards) ---
  return (
    <div className="gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-items-center max-w-7xl mx-auto w-full flex-1 p-4">
      {staffWithMaterias.map((staff, index) => {
        const imageUrl = getStaffImageUrl(staff);

        return (
          // Usamos el componente Card en lugar de la estructura div manual
          <Card
            key={staff.id || `staff-${index}`}
            title={staff.nombre}
            lastName={staff.apellido}
            imageSrc={imageUrl}
          >
            <RCActiveModalButton label='Saber mas'>
              <Modal
                title={staff.nombre}
                lastName={staff.apellido}
                imageSrc={imageUrl}
                materias={staff.materias}
                position={staff.posicion}
                email={staff.email}
                phone={staff.telefono}
                
                ></Modal>
            </RCActiveModalButton>
          </Card>
        );
      })}
    </div>
  );
};



export default StaffGrid;