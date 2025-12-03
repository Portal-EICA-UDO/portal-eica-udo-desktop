import { useStore } from "@nanostores/react";
import { role } from "../../../../features/auth/nanostore";
import { RCActiveModalButton } from "@shared/ui/react/RCModalButton";
import { useEffect } from "react";
import { CreateDegreeModal } from "./CreateDegreeModal";

export const CreateDegreeButton = () => {
  const $role = useStore(role);
  useEffect(() => {
    console.log($role);
  }, [$role]);
  return (
    <>
      {$role === "admin" && (
        <RCActiveModalButton label="crear carrera">
          <div>
            <CreateDegreeModal />
          </div>
        </RCActiveModalButton>
      )}
    </>
  );
};
