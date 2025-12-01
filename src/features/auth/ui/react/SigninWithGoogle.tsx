import { supabase } from "@shared/api";
import { useEffect, useState, type JSX } from "react";
import { email, role, name } from "../../nanostore";
import { useStore } from "@nanostores/react";
import { Circle, CircleUserRound, ChevronDown } from "lucide-react";
import { ShieldUser } from "lucide-react";

import type { Session } from "@supabase/supabase-js";
import { signUpWithOAuthRequest } from "@features/auth/api/requests";

type props = {
  loginLabel: string;
};

export const SigninWithGoogle: React.FC<props> = ({ loginLabel }) => {
  const [session, setSession] = useState<Session>();
  const $role = useStore(role);

  const signIn = async () => {
    await signUpWithOAuthRequest("google");
  };

  return (
    <button
      className="btn drawer-button text-center hover:bg-transparent px-4 py-1 text-(length:--font-default) font-medium rounded-full border border-sky-700 text-sky-700 hover:scale-105 transition"
      type="button"
      onClick={signIn}
    >
      {loginLabel}
    </button>
  );
};

// efecto de carga
