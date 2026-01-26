import { useState, type FC } from "react";
import { deleteStaff, deleteStaffImage } from "../api";
import type { StaffTable } from "../types";

type Props = {
  data: StaffTable[];
  onSuccess: () => void;
};

export const DeleteStaffs: FC<Props> = ({ data, onSuccess }) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDelete = async () => {
    try {
      await deleteStaff(data.map((item) => item.id));

      await deleteStaffImage(data.map((item) => item.imagen_url)[0]);

      onSuccess();
    } catch (error) {
      setErrorMsg("Error al eliminar el Staff");
      console.error(error);
      return;
    }
  };

  return (
    <div>
      <h2>Eliminar staff</h2>
      <p>
        ¿Estás seguro de que deseas eliminar{" "}
        {data.length > 1 ? "el staff seleccionado" : "el staff seleccionado"} (
        {data.length})?
      </p>
      <button
        type="button"
        className="px-4 py-2 rounded bg-sky-700 text-white"
        onClick={handleDelete}
      >
        Eliminar
      </button>

      {errorMsg && <p className="text-red-500">{errorMsg}</p>}
    </div>
  );
};
