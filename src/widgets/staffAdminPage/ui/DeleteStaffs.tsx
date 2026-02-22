import { useState, type FC } from "react";
import { deleteStaffs, deleteStaffImage } from "../api";
import type { StaffTable } from "../types";

type Props = {
  data: StaffTable[];
  onSuccess: () => void;
};

export const DeleteStaffs: FC<Props> = ({ data, onSuccess }) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteStaffs(data.map((item) => item.id));
      await deleteStaffImage(data.map((item) => item.imagen_url)[0]);
      onSuccess();
    } catch (error) {
      setErrorMsg("Error al eliminar el Staff");
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <h2>Eliminar staff</h2>
      <p>
        ¿Estás seguro de que deseas eliminar{" "}
        {data.length > 1 ? "el staff seleccionado" : "el staff seleccionado"} (
        {data.length})?
      </p>
      <button
        type="button"
        className="px-4 py-2 rounded bg-[#0A5C8D] hover:scale-105 text-white transition-transform "
        onClick={handleDelete}
      >
        {isLoading ? "Eliminando..." : "Eliminar"}
      </button>

      {errorMsg && <p className="text-red-500">{errorMsg}</p>}
    </div>
  );
};
