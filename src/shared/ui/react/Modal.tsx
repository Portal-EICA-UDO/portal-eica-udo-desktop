import { role } from '@features/auth/nanostore';
import { useStore } from '@nanostores/react';
import { RCActiveModalButton } from './RCModalButton';
import { EliminarLibro } from './EliminarLibro';
export function Modal({
    id,
    title,
    imageSrc,
    imageAlt,
    lastName,
    position,
    email,
    phone,
    materias,
    buttonLabel,
    description,
    tags,
    buttonHref,
    isBook = false,
    reloadLibros,
}: {
    id?: string;
    title?: string;
    imageSrc?: string;
    imageAlt?: string;
    lastName?: string;
    position?: string;
    email?: string;
    phone?: string;
    materias?: Array<{
        id: number;
        nombre: string;
        carrera?: {
            id: number;
            nombre: string;
        } | null;
    }>;
    buttonLabel?: string;
    description?: string;
    tags?: string[];
    buttonHref?: string;
    isBook?: boolean;
    reloadLibros?: () => void;
}) {
    const $role = useStore(role);

    return (
        <article className="max-w-4xl overflow-hidden bg-white rounded-lg shadow-lg">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-6 sm:p-8 items-start">

                <div className="flex items-start justify-center sm:justify-start h-full">
                    <div className="bg-gray-200 rounded-md overflow-hidden shrink-0 w-full h-64 sm:h-80">
                        {
                            imageSrc ? (
                                <img
                                    src={imageSrc}
                                    alt={imageAlt}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500">
                                    <span className="text-sm">Sin imagen</span>
                                </div>
                            )
                        }
                    </div>
                </div>

                <div className="sm:col-span-2 flex flex-col">
                    <header className="mb-4 sm:mb-1">
                        {
                            title && (
                                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                    {title} {lastName}
                                </h3>
                            )
                        }
                        {
                            description && (
                                <p className="text-lg text-gray-600 mt-2">{description}</p>
                            )
                        }
                        {
                            position && (
                                <p className="text-lg text-[#0A5C8D] font-medium mt-2">{position}</p>
                            )
                        }
                    </header>


                    <div className="space-y-3 mb-6 sm:mb-8">
                        {email ? (
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                </svg>
                                <span className="text-gray-700">{email}</span>
                            </div>
                        ) : null}

                        {phone ? (
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                </svg>
                                <span className="text-gray-700">{phone}</span>
                            </div>
                        ) : null}
                    </div>


                    {
                        position === "Docente" && materias && materias.length > 0 ? (
                            <div className="mb-6 sm:mb-8">
                                <h4 className="text-lg font-semibold text-gray-900 mb-3">Materias que imparte:</h4>
                                <ul className="space-y-2">
                                    {materias.map((materia, i) => (
                                        <li className="flex items-start gap-2">
                                            <svg className="w-5 h-5 text-[#0A5C8D] shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                                            </svg>
                                            <div>
                                                <span className="text-gray-700">
                                                    {materia.nombre}
                                                    {materia.carrera ? (
                                                        <span className="text-gray-600 ml-1">
                                                            de la carrera <span className="font-medium">{materia.carrera.nombre}</span>
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-500 italic ml-1">(sin carrera asignada)</span>
                                                    )}
                                                </span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : position === "Docente" ? (
                            <div className="mb-6 sm:mb-8">
                                <h4 className="text-lg font-semibold text-gray-900 mb-3">Materias que imparte:</h4>
                                <p className="text-gray-500 italic">No hay materias asignadas</p>
                            </div>
                        ) : null
                    }


                    {
                        tags && tags.length > 0 ? (
                            <div className="mb-3 sm:mb-2 flex flex-wrap gap-2">
                                {tags.map((t, i) => (
                                    <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">{t}</span>
                                ))}
                            </div>
                        ) : null
                    }

                    <div className="mt-auto pt-6 border-t border-gray-200">
                        {buttonHref ? (
                            <a
                                href={buttonHref}
                                download
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#0A5C8D] text-white font-medium hover:bg-[#084a6b] transition-colors duration-200 w-full sm:w-auto"
                            >
                                {buttonLabel ?? 'Descargar'}
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </a>
                        ) : buttonLabel ? (
                            <button
                                type="button"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#0A5C8D] text-white font-medium hover:bg-[#084a6b] transition-colors duration-200 w-full sm:w-auto"
                            >
                                {buttonLabel}
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </button>
                        ) : null}
                        {isBook && ($role === 'admin' || $role === 'superAdmin') && id && (
                            <div className="mt-4">
                                <RCActiveModalButton label="Eliminar Archivo" color='bg-[#CF3115]'>
                                    <EliminarLibro libroId={id} reloadLibros={reloadLibros} />
                                </RCActiveModalButton>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </article>
    );
};