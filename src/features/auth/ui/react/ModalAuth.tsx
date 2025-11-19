import { useStore } from "@nanostores/react";
import { email, role, name } from "../../nanostore";

export const ModalAuth = () => {
  const $role = useStore(role);
  const $email = useStore(email);
  const $name = useStore(name);
  return (
    <div>
      <div>ModalAuth</div>
      <div>role: {$role}</div>
      <div>email: {$email}</div>
      <div>name: {$name}</div>
    </div>
  );
};
