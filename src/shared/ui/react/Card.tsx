export function Card({
  imageSrc,
  title,
  lastName = "",
  children,
}: {
  imageSrc: string;
  title: string;
  lastName?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="w-full aspect-[2.5/4] max-w-sm bg-white/80 rounded-lg shadow sm:shadow-md overflow-hidden border border-white/10 flex flex-col gap-2.5 p-2.5">
      <div className="  flex items-center justify-center overflow-hidden flex-1">
        <img
          src={imageSrc}
          alt={title}
          className="w-full h-full object-cover rounded-lg"
          onError={(e) => {
            const img = e.currentTarget as HTMLImageElement;
            img.onerror = null;
            img.src = "/images/placeholder.png";
          }}
        />
      </div>

      <div className=" flex flex-col justify-between gap-1.5">
        <h3
          className="text-center font-normal truncate"
          title={`${title} ${lastName}`}
        >
          {title} {lastName}
        </h3>

        <div className=" flex justify-center">{children}</div>
      </div>
    </section>
  );
}
