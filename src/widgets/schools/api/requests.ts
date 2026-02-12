import { supabase } from "@shared/api";

export const getSchools = async () => {
  const { data, error } = await supabase.from("escuelas").select(
    `
            id,
            nombre,
            mision,
            vision,
            descripcion,
            objetivos,
            dependencias (
              nombre,
              staff (
                nombre
              )

            )
          
          `,
  );

  if (error) throw error;
  return data;
};
