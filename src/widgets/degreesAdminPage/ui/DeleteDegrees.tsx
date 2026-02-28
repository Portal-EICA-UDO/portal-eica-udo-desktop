import { useState, type FC } from "react";
import { deleteDegreeImage, deleteDegrees } from "../api";
import type { DegreeTable } from "../types";
import { eliminarArchivo } from "@shared/ui/react/EliminarArchive";

type Props = {
  data: DegreeTable[];
  onSuccess: () => void;
};

export const DeleteDegrees: FC<Props> = ({ data, onSuccess }) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(false);

  const handleDelete = async () => {
    console.log("data: ", data);
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await deleteDegrees(data.map((item) => item.id));

      // await deleteDegreeImage(data.map((item) => item.imagen_url)[0]);
      await Promise.all(
        data.map(async (item) => {
          await deleteDegreeImage(item.imagen_url);
        }),
      );

      await Promise.all(
        data.map(async (item) => {
          await eliminarArchivo(item.horario_url);
        }),
      );

      onSuccess();
      setSuccessMsg("Carreras eliminadas correctamente");
      console.log("Carreras eliminadas correctamente: ", data);
    } catch (error) {
      setErrorMsg("Error al eliminar las carreras");
      console.error(error);
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <h2>Eliminar usuarios</h2>
      <p>
        ¿Estás seguro de que deseas eliminar{" "}
        {data.length > 1
          ? "las carreras seleccionadas"
          : "la carrera seleccionada"}{" "}
        ({data.length})?
      </p>
      <button
        type="button"
        className="px-4 py-2 rounded bg-[#0A5C8D] hover:scale-105 text-white transition-transform cursor-pointer"
        onClick={handleDelete}
      >
        {isLoading ? "Eliminando..." : "Eliminar"}
      </button>

      {errorMsg && <p className="text-red-500">{errorMsg}</p>}
      {successMsg && <p className="text-green-500">{successMsg}</p>}
    </div>
  );
};
