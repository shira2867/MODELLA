// "use client";
// import Image from "next/image";
// import React, { useState } from "react";
// import { useForm } from "react-hook-form";
// import { useRouter } from "next/navigation";
// import { initializeApp } from "firebase/app";
// import logo from '../../../public/logo.png';
// import Link from 'next/link';
// import { FormData } from "@/types/userTypes";

// import {
//   getAuth,
//   signInWithPopup,
//   GoogleAuthProvider,
//   createUserWithEmailAndPassword,
//   signOut,
//   User,
// } from "firebase/auth";
// import { useUserStore } from "@/store/userStore";

// import { useMutation } from "@tanstack/react-query";
// import styles from "./SignupForm.module.css";

// const firebaseConfig = {
//   apiKey: "AIzaSyDiO9v_BzyyJ8C0W_M_pNvGFHGOH0rcn0E",
//   authDomain: "modella-19e1a.firebaseapp.com",
//   projectId: "modella-19e1a",
//   storageBucket: "modella-19e1a.appspot.com",
//   messagingSenderId: "950370790683",
//   appId: "1:950370790683:web:c4b6c74355ac2bd7e077be",
// };

// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
// const provider = new GoogleAuthProvider();

// export default function AuthForm() {
//   const [user, setUser] = useState<User | null>(null);
//   const { register, handleSubmit } = useForm<FormData>();
//   const router = useRouter();
//   const setUserStore = useUserStore((state) => state.setUser);

//   // ---------- React Query mutations ----------
//   const registerUserMutation = useMutation({
//     mutationFn: async (payload: any) => {
//       const res = await fetch("/api/user/register", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//       return res.json();
//     },
//     onSuccess: (data, variables) => {
//       setUserStore({
//         name: variables.name || "",
//         email: variables.email || null,
//         profileImage: variables.profileImage || "",
//         gender: null,
//       });

//       if (data.message === "User updated") {
//         router.push("/login");
//       } else {
//         router.push("/complete-profile");
//       }
//     },
//     onError: (error: any) => {
//       alert(error.message || "Error creating account");
//     },
//   });

//   // ---------- Google Sign-In ----------
//   async function signInWithGoogle() {
//     try {
//       const result = await signInWithPopup(auth, provider);
//       const firebaseUser = result.user;

//       registerUserMutation.mutate({
//         name: firebaseUser.displayName,
//         email: firebaseUser.email,
//         profileImage: firebaseUser.photoURL,
//       });

//       setUser(firebaseUser);
//     } catch (error) {
//       console.error("Google Login Error:", error);
//     }
//   }

//   // ---------- Email/Password Sign-Up ----------
//   async function onSubmit(data: FormData) {
//     try {
//       const userCredential = await createUserWithEmailAndPassword(
//         auth,
//         data.email,
//         data.password
//       );
//       const firebaseUser = userCredential.user;
//       setUser(firebaseUser);

//       registerUserMutation.mutate({
//         email: firebaseUser.email,
//         password: data.password,
//         createdAt: new Date(),
//       });
//     } catch (error: any) {
//       if (error.code === "auth/email-already-in-use") {
//         alert("The email is already registered. Please log in instead.");
//       } else {
//         console.error(error);
//         alert(error.message || "Error creating account");
//       }
//     }
//   }

//   // ---------- Sign Out ----------
//   function signOutUser() {
//     signOut(auth)
//       .then(() => {
//         setUser(null);
//         useUserStore.getState().clearUser();
//       })
//       .catch(console.error);
//   }

//   // ---------- Render ----------
//   return (
//     <div className={styles.signupPage}>
//       <div className={styles.localHeader}>
//         <Link href="/">
//           <Image src={logo} alt="Project Logo" width={210} height={210} />
//         </Link>
//       </div>
//       <div className={styles.container}>
//         {!user ? (
//           <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
//             <h2>Create Your Account</h2>

//             <button
//               type="button"
//               onClick={signInWithGoogle}
//               className={styles.googleButton}
//             >
//               <Image src="/google.png" alt="Google" width={18} height={18} />
//               Continue with Google
//             </button>

//             <div className={styles.orDivider}>Or</div>

//             <input
//               {...register("email")}
//               placeholder="Email address"
//               className={styles.input}
//             />
//             <input
//               {...register("password")}
//               type="password"
//               placeholder="Password"
//               className={styles.input}
//             />

//             <label className={styles.checkboxContainer}>
//               <input type="checkbox" />
//               Receive news, updates and deals
//             </label>

//             <button type="submit" className={styles.button}>
//               Create Account
//             </button>

//             <p className={styles.terms}>
//               By creating an account, you agree to the{" "}
//               <a href="#">Terms of Service</a> and{" "}
//               <a href="#">Privacy Policy</a>.
//             </p>

//             <p className={styles.loginLink}>
//               Already have an account? <a href="/login">Log in here</a>
//             </p>
//           </form>
//         ) : (
//           <div className={styles.userInfo}>
//             <h2>Welcome, {user.displayName || user.email}</h2>
//             {user.photoURL && (
//               <Image
//                 src={user.photoURL}
//                 alt="Profile"
//                 width={100}
//                 height={100}
//                 className={styles.profileImage}
//               />
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }



"use client";
import Image from "next/image";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import logo from "../../../public/logo.png";
import Link from "next/link";
import { FormData } from "@/types/userTypes";

import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";
import { auth, provider } from "@/app/firebase/config"; // 👈 שימוש בקובץ המשותף

import { useUserStore } from "@/store/userStore";
import { useMutation } from "@tanstack/react-query";
import styles from "./SignupForm.module.css";

export default function AuthForm() {
  const [user, setUser] = useState<User | null>(null);
  const { register, handleSubmit } = useForm<FormData>();
  const router = useRouter();
  const setUserStore = useUserStore((state) => state.setUser);

  // ---------- React Query mutations ----------  
  const registerUserMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch("/api/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return res.json();
    },
    onSuccess: (data, variables) => {
      setUserStore({
        name: variables.name || "",
        email: variables.email || null,
        profileImage: variables.profileImage || "",
        gender: null,
      });

      if (data.message === "User updated") {
        router.push("/login");
      } else {
        router.push("/complete-profile");
      }
    },
    onError: (error: any) => {
      alert(error.message || "Error creating account");
    },
  });

  // ---------- Google Sign-In ----------  
  async function signInWithGoogle() {
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      registerUserMutation.mutate({
        name: firebaseUser.displayName,
        email: firebaseUser.email,
        profileImage: firebaseUser.photoURL,
      });

      setUser(firebaseUser);
    } catch (error) {
      console.error("Google Login Error:", error);
    }
  }

  // ---------- Email/Password Sign-Up ----------  
  async function onSubmit(data: FormData) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const firebaseUser = userCredential.user;
      setUser(firebaseUser);

      registerUserMutation.mutate({
        email: firebaseUser.email,
        password: data.password,
        createdAt: new Date(),
      });
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        alert("The email is already registered. Please log in instead.");
      } else {
        console.error(error);
        alert(error.message || "Error creating account");
      }
    }
  }

  // ---------- Sign Out ----------  
  function signOutUser() {
    signOut(auth)
      .then(() => {
        setUser(null);
        useUserStore.getState().clearUser();
      })
      .catch(console.error);
  }

  // ---------- Render ----------  
  return (
    <div className={styles.signupPage}>
      <div className={styles.localHeader}>
        <Link href="/">
          <Image src={logo} alt="Project Logo" width={210} height={210} />
        </Link>
      </div>
      <div className={styles.container}>
        {!user ? (
          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            <h2>Create Your Account</h2>

            <button
              type="button"
              onClick={signInWithGoogle}
              className={styles.googleButton}
            >
              <Image src="/google.png" alt="Google" width={18} height={18} />
              Continue with Google
            </button>

            <div className={styles.orDivider}>Or</div>

            <input
              {...register("email")}
              placeholder="Email address"
              className={styles.input}
            />
            <input
              {...register("password")}
              type="password"
              placeholder="Password"
              className={styles.input}
            />

            <label className={styles.checkboxContainer}>
              <input type="checkbox" />
              Receive news, updates and deals
            </label>

            <button type="submit" className={styles.button}>
              Create Account
            </button>

            <p className={styles.terms}>
              By creating an account, you agree to the{" "}
              <a href="#">Terms of Service</a> and{" "}
              <a href="#">Privacy Policy</a>.
            </p>

            <p className={styles.loginLink}>
              Already have an account? <a href="/login">Log in here</a>
            </p>
          </form>
        ) : (
          <div className={styles.userInfo}>
            <h2>Welcome, {user.displayName || user.email}</h2>
            {user.photoURL && (
              <Image
                src={user.photoURL}
                alt="Profile"
                width={100}
                height={100}
                className={styles.profileImage}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
