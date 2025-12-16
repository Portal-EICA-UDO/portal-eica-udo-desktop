import { useState, type FC } from "react";
import { deleteDegreeImage, deleteDegrees } from "../api";
import type { Data } from "../types";

type Props = {
  data: Data[];
  onSuccess: () => void;
};

export const DeleteDegrees: FC<Props> = ({ data, onSuccess }) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleDelete = async () => {
    console.log("data: ", data);

    try {
      await deleteDegrees(data.map((item) => item.id));

      await deleteDegreeImage(data.map((item) => item.imagen_url)[0]);

      onSuccess();
      setSuccessMsg("Carreras eliminadas correctamente");
      console.log("Carreras eliminadas correctamente: ", data);
    } catch (error) {
      setErrorMsg("Error al eliminar las carreras");
      console.error(error);
      return;
    }
  };

  return (
    <div>
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
