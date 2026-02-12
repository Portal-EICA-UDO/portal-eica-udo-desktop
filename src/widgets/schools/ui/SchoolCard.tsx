import React from "react";
import { Layers, University } from "lucide-react"; // Iconos modernos
import type { School } from "../types";

type Props = {
  school: School;
  lines?: number;
  children?: React.ReactNode;
};
const SchoolCard: React.FC<Props> = ({
  school = {
    id: "",
    nombre: "algo",
    mision: "algo",
    descripcion: "algo",
    dependencias: [{ id: "", nombre: "" }],
  },
  lines = 3,
  children,
}) => {
  // Simulación de color basado en el departamento o nombre
  const accentColor = "from-blue-600 to-indigo-700";

  return (
    <section className="w-full aspect-[2.5/4] max-w-sm bg-white/80 rounded-lg shadow sm:shadow-md overflow-hidden border border-white/10 flex flex-col gap-2.5 p-4">
      {/* Encabezado: Nombre y Badge */}

      <div className="mb-4">
        <div className="flex gap-0.5  ">
          <span className="text-xs font-semibold tracking-wider text-[#0A5C8D] uppercase bg-blue-50 px-2 py-1 rounded inline-flex items-center">
            Escuela
            <University size={"1.2rem"} className="inline ml-0.5" />
          </span>
        </div>
        <h3 className="mt-2 text-xl font-bold text-slate-800 leading-tight group-hover:text-blue-700 transition-colors">
          {school.nombre || "Escuela"}
        </h3>
      </div>

      {/* Descripción corta (Misión truncada) */}
      <p
        className="text-slate-600 text-sm mb-6 grow line-clamp-3"
        style={{
          display: "-webkit-box",
          WebkitLineClamp: lines,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {school.descripcion || "Descripción corta"}
      </p>

      {/* Mini Data: dependencias */}
      <div className="flex items-center gap-2 text-slate-500 text-xs mb-6">
        <Layers size={14} />
        <span className="font-medium">
          {school.dependencias?.length || 0} dependencias asociados
        </span>
      </div>

      <div className=" flex flex-col justify-between gap-1.5">
        <div className=" flex justify-center">{children}</div>
      </div>
    </section>
  );
};

export default SchoolCard;
