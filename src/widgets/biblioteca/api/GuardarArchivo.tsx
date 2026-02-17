export function guardarArchivo(file, extras = {}) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    // Leemos el archivo como DataURL
    reader.readAsDataURL(file);

    // Cuando termine la conversión a Base64
    reader.onload = async () => {
      try {
        const rawLog = reader.result.split(',')[1];

        const dataSend = {
          dataReq: {
            data: rawLog,
            name: file.name,
            type: file.type,// Aquí puedes pasar las etiquetas
          },
          fname: "uploadFilesToGoogleDrive"
        };

        const response = await fetch('https://script.google.com/macros/s/AKfycbysiik-3IbMroDCFlMIieb1rj5XsrQFR2IFB3ZNd0DmJPyT3JzRJ_Fhe-7AuKLCOxnI/exec', {
          method: "POST",
          body: JSON.stringify(dataSend)
        });

        const result = await response.json();
        resolve(result); // Devolvemos la respuesta exitosa

      } catch (error) {
        reject(error); // Si falla el fetch o el parseo
      }
    };

    // Si hay un error leyendo el archivo local
    reader.onerror = (error) => reject(error);
  });
}