export function isAdminOrSuperAdmin(role: string) {
  return role === "admin" || role === "superAdmin";
}
