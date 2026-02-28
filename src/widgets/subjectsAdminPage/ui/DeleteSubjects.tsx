import { useState, type FC } from "react";
import { deleteSubjects } from "../api";
import { fi } from "zod/locales";

type Props = {
  data: any[];
  onSuccess: () => void;
};

export const DeleteSubjects: FC<Props> = ({ data, onSuccess }) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteSubjects(data.map((item) => item.id_materia));
      onSuccess();
      setSuccessMsg("Materias eliminadas correctamente");
    } catch (error) {
      setErrorMsg("Error al eliminar las materias");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <h2>Eliminar usuarios</h2>
      <p>
        ¿Estás seguro de que deseas eliminar{" "}
        {data.length > 1
          ? "las materias seleccionadas"
          : "la materia seleccionada"}{" "}
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
