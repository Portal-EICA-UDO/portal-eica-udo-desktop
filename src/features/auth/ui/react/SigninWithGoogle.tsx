import { supabase } from "@shared/api";
import { useEffect, useState } from "react";
import { email, role, name } from "../../nanostore";
import { useStore } from "@nanostores/react";

import type { Session } from "@supabase/supabase-js";

type props = {
  loginLabel: string;
};

export const SigninWithGoogle: React.FC<props> = ({ loginLabel }) => {
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
      session && setSession(session);
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
      <div className="w-24 text-center px-4 py-1 text-sm font-medium rounded-full border border-sky-700 text-sky-700 hover:bg-sky-700 hover:text-white transition">
        {$name.split(" ")[0]}
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
