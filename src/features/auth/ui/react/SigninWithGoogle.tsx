import { supabase } from "@shared/api";
import { useEffect, useState } from "react";
import { email, role, name } from "../../nanostore";
import { useStore } from "@nanostores/react";
import { Circle, CircleUserRound, ChevronDown } from "lucide-react";
import { ShieldUser } from "lucide-react";

import type { Session } from "@supabase/supabase-js";

type props = {
  loginLabel: string;
  options?: any;
};

export const SigninWithGoogle: React.FC<props> = ({ loginLabel, options }) => {
  const [session, setSession] = useState<Session>();
  const $role = useStore(role);
  const $email = useStore(email);
  const $name = useStore(name);

  useEffect(() => {
    if (!$role) {
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (session) {
          setSession(session);

          const { user } = session as Session;
          const { data, error } = await supabase
            .from("roles")
            .select("*")
            .eq("user_id", user.id);

          if (data) {
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
      console.log(event, session);
      session ? setSession(session) : setSession(undefined);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + window.location.pathname,
      },
    });
  };
  const signOut = async () => {
    console.log("signing out");
    const { error } = await supabase.auth.signOut();
  };

  if ($role === "") {
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
  }

  if (session) {
    return (
      <div className="flex gap-0.5 items-center">
        <div
          onClick={signOut}
          className="px-3 py-1 flex relative text-center gap-1  text-(length:--font-default) font-medium rounded-full border border-b-red-400 text-red-400 hover:bg-red-400 hover:text-white transition"
        >
          <div className="w-max h-full">Cerrar Sesion</div>
          {/* <div className=" w-full h-full">{$name.split(" ")[0]}</div> */}
        </div>
        {options}
      </div>
    );
  }

  if (!session) {
    return (
      <button
        className="w-24 text-center px-4 py-1 text-sm font-medium rounded-full border border-sky-700 text-sky-700 hover:bg-sky-700 hover:text-white transition"
        type="button"
        onClick={signIn}
      >
        {loginLabel}
      </button>
    );
  }
};
