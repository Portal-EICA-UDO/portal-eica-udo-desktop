import { email, role, name, fullName } from "../../nanostore";
import { useStore } from "@nanostores/react";
import { supabase } from "@shared/api";
import { RCActiveModalButton } from "@shared/ui/react/RCModalButton";
import { ChevronDown } from "lucide-react";
import { useEffect, type JSX } from "react";
import { AuthModal } from "./AuthModal";
import type { Session } from "@supabase/supabase-js";
import { isAdminOrSuperAdmin } from "../../lib/isAdminOrSuperAdmin";
import {
  getProfileRequest,
  getSessionRequest,
  logoutRequest,
} from "./../../api/requests";

type props = {
  drawer?: JSX.Element;
};
export const AuthButton: React.FC<props> = ({ drawer }) => {
  const $role = useStore(role);

  useEffect(() => {
    (async () => {
      const resp = await getSessionRequest();
      const session = resp.session;
      if (session && role.get() == "") {
        const { user } = session as Session;
        const profile = await getProfileRequest(user.id);

        if (profile) {
          console.log("estoy entrandoooooo");
          role.set(profile.role_name);
          email.set(profile.email as string);
          name.set(profile.name);
          fullName.set(profile.full_name);
        }
      }
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(event, session);
      !session && role.set("unauthenticated");
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    console.log($role);
  }, [$role]);
  const signOut = async () => {
    console.log("signing out");
    await logoutRequest();
    role.set("unauthenticated");
    email.set("");
    name.set("");
  };

  if ($role == "unauthenticated")
    return (
      <RCActiveModalButton
        label="Iniciar Sesión"
        icon={<ChevronDown size={16} />}
      >
        <div>
          <AuthModal />
        </div>
      </RCActiveModalButton>
    );

  if (isAdminOrSuperAdmin($role))
    return (
      <div className="flex gap-1.5 items-center">
        <div
          onClick={signOut}
          className="px-3 py-2.5  flex relative text-center gap-1  text-(length:--font-default) font-medium rounded-full  text-red-400    border-2 border-red-400 hover:scale-105 transition"
        >
          <div className="w-max h-full">Cerrar Sesion</div>
          {/* <div className=" w-full h-full">{$name.split(" ")[0]}</div> */}
        </div>

        {drawer}
      </div>
    );

  if ($role === "miembro")
    return (
      <div className="flex gap-1.5 items-center">
        <div
          onClick={signOut}
          className="px-3 py-2.5  flex relative text-center gap-1  text-(length:--font-default) font-medium rounded-full  text-red-400    border-2 border-red-400 hover:scale-105 transition"
        >
          <div className="w-max h-full">Cerrar Sesion</div>
          {/* <div className=" w-full h-full">{$name.split(" ")[0]}</div> */}
        </div>
        {drawer}
      </div>
    );

  return (
    <div className="w-12 text-center">
      <div
        className="
    inline-block
    w-8
    h-8
    border-[5px]
    border-solid
    border-x-[#006699]
    border-y-transparent
    rounded-full
    box-border
    animate-spin
"
      ></div>
    </div>
  );
};
