import { useState, type FC } from "react";
import type { DependenceTable } from "../types";
import { deleteDependences } from "../api/requests";
import { set } from "zod";
import { fi, is } from "zod/locales";

type Props = {
  data: DependenceTable[];
  onSuccess: () => void;
};

export const DeleteDependences: FC<Props> = ({ data, onSuccess }) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);

    try {
      await deleteDependences(data.map((item) => item.id));
      onSuccess();

      console.log("Carreras eliminadas correctamente: ", data);
    } catch (error) {
      if (data.length === 1) {
        setSuccessMsg("Dependencia eliminada correctamente");
      } else {
        setSuccessMsg("Dependencias eliminadas correctamente");
      }
      console.error(error);
      return;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h2>Eliminar dependencias</h2>
      <p>
        ¿Estás seguro de que deseas eliminar{" "}
        {data.length > 1
          ? "las dependencias seleccionadas"
          : "la dependencia seleccionada"}{" "}
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
    </div>
  );
};
