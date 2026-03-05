import { useState, useEffect } from "react";
import { supabase } from "@shared/api";

export default function AuthC() {
  const [session, setSession] = useState<any>(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signUp = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
  };
  if (!session) {
    return <button onClick={signUp}>Sign In with google</button>;
  } else {
    return <div>Logged in!</div>;
  }
}
