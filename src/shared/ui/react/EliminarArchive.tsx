export async function eliminarArchivo(fileUrl) {
  try {
    // Extraer el ID de la URL de Google Drive
    // Las URLs suelen ser: https://drive.google.com/file/d/ID_DEL_ARCHIVO/view...
    const fileId = fileUrl.match(/[-\w]{25,}/)[0]; 

    const dataSend = {
      dataReq: {
        id: fileId
      },
      fname: "deleteFileFromGoogleDrive"
    };

    const response = await fetch('https://script.google.com/macros/s/AKfycbysiik-3IbMroDCFlMIieb1rj5XsrQFR2IFB3ZNd0DmJPyT3JzRJ_Fhe-7AuKLCOxnI/exec', {
      method: "POST",
      body: JSON.stringify(dataSend)
    });

    const result = await response.json();
    
    if (result.status === "success") {
      return result;
    } else {
      throw new Error(result.message);
    }

  } catch (error) {
    console.error("Error al eliminar:", error);
    throw error;
  }
}