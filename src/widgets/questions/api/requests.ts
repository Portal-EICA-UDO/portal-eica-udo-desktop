import emailjs from "@emailjs/browser"; // Importación necesaria
import type { EmailFormData } from "../types";

export const sendEmail = async (data: EmailFormData) => {
  await emailjs.send(
    "service_t1r1dvn",
    "template_egf6neh",
    {
      ...data,
    },
    {
      publicKey: import.meta.env.PUBLIC_EMAIL_JS_PUBLIC_KEY,
    },
  );
};
