
export function Card({imageSrc, title, lastName, children}: {imageSrc: string, title: string, lastName: string, children: React.ReactNode}) {
    return (
        <section
            className="w-[202px] h-[338px] bg-white/80 rounded-lg shadow sm:shadow-md overflow-hidden border border-white/10 flex flex-col"
        >
            <div
                className="h-[262px] px-2.5 pt-2.5 dark:bg-gray-700 flex items-center justify-center overflow-hidden"
            >
                <img src={imageSrc} className="w-full h-full object-cover rounded-lg" />
            </div>

            <div className="pt-1.5 h-16.5 flex flex-col justify-between">
                <h3 className="text-center h-[19px]">{title} {lastName}</h3>

                <div className="mt-1 flex justify-center">
                    {children}
                </div>
            </div>
        </section>
    );
}