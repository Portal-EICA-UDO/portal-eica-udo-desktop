import { useState, type FC } from "react";
import { deleteSubjects } from "../api";

type Props = {
  data: any[];
  onSuccess: () => void;
};

export const DeleteSubjects: FC<Props> = ({ data, onSuccess }) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleDelete = async () => {
    try {
      await deleteSubjects(data.map((item) => item.id_materia));
      onSuccess();
      setSuccessMsg("Materias eliminadas correctamente");
    } catch (error) {
      setErrorMsg("Error al eliminar las materias");
      return;
    }
  };

  return (
    <div>
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
        className="px-4 py-2 rounded bg-sky-700 text-white"
        onClick={handleDelete}
      >
        Eliminar
      </button>

      {errorMsg && <p className="text-red-500">{errorMsg}</p>}
      {successMsg && <p className="text-green-500">{successMsg}</p>}
    </div>
  );
};
