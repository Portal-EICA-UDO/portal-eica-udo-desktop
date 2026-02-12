// src/components/SchoolInfo.jsx
import React, { useState } from "react";
import type { School } from "../types";

// Sub-componente para cada ítem del acordeón
type AccordionItemProps = {
  title: string;
  content: React.ReactNode;
  isOpen: boolean;
  onClick: () => void;
};
const AccordionItem: React.FC<AccordionItemProps> = ({
  title,
  content,
  isOpen,
  onClick,
}) => {
  return (
    <div className="border-b border-gray-200">
      <button
        className="flex justify-between items-center w-full p-4 text-lg font-semibold text-left text-gray-800 bg-white hover:bg-gray-50 focus:outline-none"
        onClick={onClick}
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        <svg
          className={`w-5 h-5 transition-transform duration-300 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          ></path>
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-screen opacity-100 p-4" : "max-h-0 opacity-0 p-0"
        }`}
      >
        <div className="text-gray-700">{content}</div>
      </div>
    </div>
  );
};

type props = {
  school: School;
};
export const Modal: React.FC<props> = ({ school: schoolData }) => {
  const [openItem, setOpenItem] = useState<null | number>(null); // Estado para controlar qué ítem está abierto

  const toggleItem = (index: number | null) => {
    setOpenItem(openItem === index ? null : index);
  };

  return (
    <article className="container mx-auto p-6 md:p-8 lg:p-10 bg-white  rounded-xl max-w-4xl mt-10 w-full grid md:grid-cols-3 gap-4 grid-cols-1 ">
      {/* Nombre de la escuela */}
      <div className="flex  text-center self-center md:gap-4 flex-col gap-2">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#0A5C8D] leading-tight">
          {schoolData.nombre}
        </h1>
        <p className="text-lg text-gray-600 ">
          Del pueblo venimos y hacia el pueblo vamos
        </p>
      </div>

      {/* Acordeón */}
      <div className="border border-gray-200 rounded-lg overflow-hidden col-span-2">
        <AccordionItem
          title="Misión"
          content={schoolData.mision}
          isOpen={openItem === 0}
          onClick={() => toggleItem(0)}
        />
        <AccordionItem
          title="Visión"
          content={schoolData.vision}
          isOpen={openItem === 1}
          onClick={() => toggleItem(1)}
        />
        <AccordionItem
          title="Objetivos"
          content={
            <ul className="list-disc pl-5 space-y-2">
              {schoolData.objetivos.split("\n").map((obj, index) => (
                <li key={index}>{obj}</li>
              ))}
            </ul>
          }
          isOpen={openItem === 2}
          onClick={() => toggleItem(2)}
        />
        <AccordionItem
          title="Descripción"
          content={schoolData.descripcion}
          isOpen={openItem === 3}
          onClick={() => toggleItem(3)}
        />
        <AccordionItem
          title="dependencias"
          content={
            <div className="space-y-3">
              {(schoolData.dependencias || []).length === 0 ? (
                <div className="text-gray-600">
                  No hay dependencias registrados.
                </div>
              ) : (
                (schoolData.dependencias || []).map((d, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-2 bg-gray-50 rounded gap-1"
                  >
                    <div className="font-medium text-gray-800">{d.nombre}</div>
                    <div className="text-sm text-gray-600">
                      Coordinador: {d.coordinador}
                    </div>
                  </div>
                ))
              )}
            </div>
          }
          isOpen={openItem === 4}
          onClick={() => toggleItem(4)}
        />
      </div>
    </article>
  );
};
