import { email, role, name } from "../../nanostore";
import { useStore } from "@nanostores/react";
import { supabase } from "@shared/api";
import { RCActiveModalButton } from "@shared/ui/react/RCModalButton";
import { ChevronDown } from "lucide-react";
import { useEffect, type JSX } from "react";
import { AuthModal } from "./AuthModal";
import type { Session } from "@supabase/supabase-js";
import { isAdminOrSuperAdmin } from "../../lib/isAdminOrSuperAdmin";

type props = {
  drawer?: JSX.Element;
};
export const AuthButton: React.FC<props> = ({ drawer }) => {
  const $role = useStore(role);

  useEffect(() => {
    if (!$role) {
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (session) {
          console.log(session);
          const { user } = session as Session;
          const { data, error } = await supabase
            .from("roles")
            .select("*")
            .eq("user_id", user.id);

          if (data) {
            console.log("estoy entrandoooooo");
            role.set(data[0].role_name);
            email.set(user.email as string);
            name.set(user.user_metadata.name);
          }
        } else {
          role.set("unauthenticated");
        }
      });
    }
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      !session && role.set("unauthenticated");

      if (session && role.get() == "unauthenticated") {
        console.log(session);
        const { user } = session as Session;
        const { data, error } = await supabase
          .from("roles")
          .select("*")
          .eq("user_id", user.id);

        if (data) {
          console.log("estoy entrandoooooo");
          role.set(data[0].role_name);
          email.set(user.email as string);
          name.set(user.user_metadata.name);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    console.log($role);
  }, [$role]);
  const signOut = async () => {
    console.log("signing out");
    const { error } = await supabase.auth.signOut();
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
