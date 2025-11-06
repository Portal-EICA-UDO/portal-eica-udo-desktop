// Con `output: 'static'` configurado:
// export const prerender = false;
import type { APIRoute } from "astro";
export const prerender = false;

export const GET: APIRoute = async ({ cookies, redirect }) => {
  cookies.delete("sb-access-token", { path: "/" });
  cookies.delete("sb-refresh-token", { path: "/" });
  return redirect("/auth/signin");
};
