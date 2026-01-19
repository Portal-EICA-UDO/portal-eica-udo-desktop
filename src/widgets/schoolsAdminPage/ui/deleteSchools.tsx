import type { School } from "@widgets/subjectsAdminPage/types";
import { useState, type FC } from "react";
import { deleteSchools } from "../api";

type Props = {
  data: School[];
  onSuccess: () => void;
};

export const DeleteSchools: FC<Props> = ({ data, onSuccess }) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleDelete = async () => {
    try {
      await deleteSchools(data.map((item) => item.id));
      console.log("Carreras eliminadas correctamente: ", data);
      setSuccessMsg("Escuelas eliminadas correctamente");
      onSuccess();
    } catch (error) {
      console.error(error);
      setErrorMsg("Error al eliminar las carreras");
      return;
    }
  };

  return (
    <div>
      <h2>Eliminar escuelas</h2>
      <p>
        ¿Estás seguro de que deseas eliminar{" "}
        {data.length > 1
          ? "las escuelas seleccionadas"
          : "la escuela seleccionada"}{" "}
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
