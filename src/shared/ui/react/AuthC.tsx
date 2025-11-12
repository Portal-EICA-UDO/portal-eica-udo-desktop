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

      // const { user } = session;
      // if (event === "SIGNED_IN" && user) {
      //   // const {data, error} = supabase.auth.getUser();
      //   console.log("User signed in:", session);

      //   const { data, error } = await supabase
      //     .from("roles")
      //     .select("*")
      //     .eq("user_id", user.id);

      //   console.log(data);
      //   if (data.length === 0) {
      //     const { data, error } = await supabase
      //       .from("roles")
      //       .insert([{ user_id: user.id, role_name: "miembro" }]);
      //     if (error) {
      //       console.error("Error inserting role:", error);
      //     } else {
      //       console.log("Role inserted:", data);
      //     }
      //   } else {
      //     console.log("Roles:", data[0].role_name);
      //   }
      // }
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
