import type { School } from "@widgets/subjectsAdminPage/types";
import { useState, type FC } from "react";
import { deleteSchools } from "../api";

type Props = {
  data: School[];
  onSuccess: () => void;
};

export const DeleteSchools: FC<Props> = ({ data, onSuccess }) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(false);

  const handleDelete = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      await deleteSchools(data.map((item) => item.id));
      console.log("Carreras eliminadas correctamente: ", data);
      onSuccess();
    } catch (error) {
      console.error(error);
      setErrorMsg("Error al eliminar las carreras");
    }
    setLoading(false);
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
        {isLoading ? "Eliminando..." : "Eliminar"}
      </button>

      {errorMsg && <p className="text-red-500">{errorMsg}</p>}
    </div>
  );
};
