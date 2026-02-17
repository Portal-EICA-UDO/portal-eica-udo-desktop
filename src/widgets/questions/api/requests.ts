import emailjs from "@emailjs/browser"; // Importación necesaria
import type { EmailFormData } from "../types";

export const sendEmail = async (data: EmailFormData) => {
  console.log("Sending email with data:", data);
  await emailjs.send(
    "service_vi5t9xs",
    "template_0nzgjuo",
    {
      ...data,
    },
    {
      publicKey: import.meta.env.PUBLIC_EMAIL_JS_PUBLIC_KEY,
    },
  );
};
