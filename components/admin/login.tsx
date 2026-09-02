"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Send, ArrowRight } from "lucide-react";
import Loading from "@/components/loading";

const CODE_LENGTH = 6;

interface LoginProps {
  onSuccess: () => void;
}

export default function Login({ onSuccess }: LoginProps) {
  const [step, setStep] = useState<"login" | "code">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [shake, setShake] = useState(false);
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [verifying, setVerifying] = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);
  const codeRefs = useRef<Array<HTMLInputElement | null>>([]);

  const isCodeComplete = code.every((c) => c !== "");

  /* ===== Handlers ===== */
  const handleLogin = useCallback(() => {
    if (!email.trim() || !password.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 800);
      return;
    }
    setStep("code");
    setTimeout(() => codeRefs.current[0]?.focus(), 450);
  }, [email, password]);

  const handleBack = useCallback(() => {
    setStep("login");
    setTimeout(() => emailRef.current?.focus(), 450);
  }, []);

  const handleCodeChange = (index: number, value: string) => {
    const digit = value.replace(/[^0-9]/g, "").slice(-1);
    setCode((prev) => {
      const next = [...prev];
      next[index] = digit;

      if (digit && index < CODE_LENGTH - 1) {
        codeRefs.current[index + 1]?.focus();
      }

      if (digit && next.every((c) => c !== "")) {
        submitCode(next.join(""));
      }

      return next;
    });
  };

  const handleCodeKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && code[index] === "" && index > 0) {
      codeRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter" && isCodeComplete) {
      handleContinue();
    }
  };

  const handleCodePaste = (
    index: number,
    e: React.ClipboardEvent<HTMLInputElement>
  ) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, CODE_LENGTH);

    if (!pasted) return;

    setCode((prev) => {
      const next = [...prev];
      pasted.split("").forEach((char, i) => {
        next[i] = char;
      });

      if (next.every((c) => c !== "")) {
        submitCode(next.join(""));
      }

      return next;
    });

    const focusIndex =
      pasted.length === CODE_LENGTH
        ? CODE_LENGTH - 1
        : Math.min(pasted.length, CODE_LENGTH - 1);

    codeRefs.current[focusIndex]?.focus();
  };

  const submitCode = useCallback(
    (fullCode: string) => {
      setVerifying(true);

      // TODO: remplacer par le véritable appel de vérification du code
      setTimeout(() => {
        setVerifying(false);
        onSuccess();
      }, 1800);
    },
    [onSuccess]
  );

  const handleContinue = () => {
    if (!isCodeComplete) return;
    submitCode(code.join(""));
  };

  /* ===== Animation variants ===== */
  const cardVariants = {
    hidden: {
      opacity: 0,
      y: -800,
      scaleX: 0.2,
      scaleY: 0.5,
    },
    visible: {
      opacity: 1,
      y: 0,
      scaleX: 1,
      scaleY: 1,
      transition: {
        duration: 2.4,
        ease: [0.16, 1, 0.3, 1],
        opacity: { duration: 0.8 },
        scaleX: { delay: 1.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] },
        scaleY: {
          delay: 1.1,
          duration: 0.7,
          ease: [0.16, 1, 0.3, 1],
        },
      },
    },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: -40 },
    visible: (delay: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay,
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1],
      },
    }),
  };

  const imageVariants = {
    hidden: { x: 120, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        delay: 2.6,
        duration: 0.9,
        ease: [0.34, 1.56, 0.64, 1],
      },
    },
  };

  const codeInputVariants = {
    hidden: { opacity: 0, scale: 0.6, y: 12 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        delay: 0.15 + i * 0.06,
        duration: 0.4,
        ease: [0.34, 1.56, 0.64, 1],
      },
    }),
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center font-[family-name:var(--font-poppins)] text-[15px] font-semibold text-slate-400">
      {/* Loader */}
      <Loading show={verifying} text="Vérification du code..." />

      <style jsx global>{`
        input:-webkit-autofill {
          transition: background-color 6000s, color 6000s;
        }
      `}</style>

      {/* Login card */}
      <section className="relative z-10 mx-4 grid h-screen items-center sm:mx-auto sm:w-[400px] lg:w-auto">
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-[#14142b] p-10 px-4 shadow-[0_20px_60px_rgba(0,0,0,0.8)] sm:rounded-3xl sm:p-14 sm:px-6 lg:grid lg:grid-cols-[360px_480px] lg:items-center lg:gap-28 lg:rounded-[4rem] lg:py-6 lg:pl-28 lg:pr-6"
        >
          {/* Slide wrapper */}
          <div className="w-full overflow-hidden lg:max-w-[360px]">
            <motion.div
              className="flex w-[200%]"
              animate={{
                x: step === "code" ? "-50%" : "0%",
              }}
              transition={{
                duration: 0.5,
                ease: [0.4, 0, 0.2, 1],
              }}
            >
              {/* ===== Slide 1: Login ===== */}
              <div className="w-1/2 shrink-0 px-1">
                <motion.h2
                  custom={0.3}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  className="mb-12 text-center text-2xl text-slate-100 font-[family-name:var(--font-montserrat)] lg:text-4xl"
                >
                  Bienvenue 👋
                </motion.h2>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleLogin();
                  }}
                >
                  <motion.div
                    custom={0.5}
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    className="mb-10 grid gap-4"
                  >
                    {/* Email */}
                    <motion.div
                      animate={
                        shake
                          ? {
                              x: [0, -10, 10, -8, 8, -4, 4, 0],
                              borderColor: "#f87171",
                            }
                          : { x: 0 }
                      }
                      transition={{ duration: 0.5 }}
                      className="group relative flex h-16 items-center rounded-[4rem] border-2 border-white/[0.15] bg-[#14142b] transition-colors focus-within:border-[#00c896] focus-within:shadow-[0_0_0_3px_rgba(0,200,150,0.15)] sm:h-14"
                    >
                      <Mail
                        className="absolute left-5 h-6 w-6 text-slate-400 transition-colors group-focus-within:text-[#00c896]"
                        strokeWidth={2}
                      />
                      <input
                        ref={emailRef}
                        type="email"
                        id="email"
                        autoComplete="email"
                        required
                        placeholder=" "
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="peer h-full w-full bg-transparent pl-[3.25rem] font-semibold text-slate-100 outline-none"
                      />
                      <label
                        htmlFor="email"
                        className="pointer-events-none absolute left-[3.25rem] text-slate-400 transition-opacity peer-focus:opacity-0 peer-[:not(:placeholder-shown)]:opacity-0"
                      >
                        Email
                      </label>
                    </motion.div>

                    {/* Password */}
                    <motion.div
                      animate={
                        shake
                          ? {
                              x: [0, -10, 10, -8, 8, -4, 4, 0],
                              borderColor: "#f87171",
                            }
                          : { x: 0 }
                      }
                      transition={{ duration: 0.5 }}
                      className="group relative flex h-16 items-center rounded-[4rem] border-2 border-white/[0.15] bg-[#14142b] transition-colors focus-within:border-[#00c896] focus-within:shadow-[0_0_0_3px_rgba(0,200,150,0.15)] sm:h-14"
                    >
                      <Lock
                        className="absolute left-5 h-6 w-6 text-slate-400 transition-colors group-focus-within:text-[#00c896]"
                        strokeWidth={2}
                      />
                      <input
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        required
                        placeholder=" "
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="peer h-full w-full bg-transparent pl-[3.25rem] font-semibold text-slate-100 outline-none"
                      />
                      <label
                        htmlFor="password"
                        className="pointer-events-none absolute left-[3.25rem] text-slate-400 transition-opacity peer-focus:opacity-0 peer-[:not(:placeholder-shown)]:opacity-0"
                      >
                        Mot de passe
                      </label>
                    </motion.div>
                  </motion.div>

                  <motion.button
                    custom={0.7}
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-2 flex h-16 w-full items-center justify-center gap-2 rounded-[4rem] bg-gradient-to-br from-[#00c896] to-[#059669] text-lg font-semibold text-white shadow-[0_4px_20px_rgba(0,200,150,0.3)] transition-shadow hover:shadow-[0_6px_30px_rgba(0,200,150,0.45)] sm:h-14 sm:text-base"
                  >
                    Se connecter <Send className="h-6 w-6" strokeWidth={2} />
                  </motion.button>
                </form>
              </div>

              {/* ===== Slide 2: Code secret ===== */}
              <div className="w-1/2 shrink-0 px-1">
                <AnimatePresence mode="wait">
                  {step === "code" && (
                    <motion.div
                      key="code-step"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                    >
                      <motion.h2
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25, duration: 0.5 }}
                        className="mb-4 text-center text-2xl text-slate-100 font-[family-name:var(--font-montserrat)] lg:text-4xl"
                      >
                        🔐 Code secret
                      </motion.h2>

                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35, duration: 0.5 }}
                        className="mb-10 text-center text-[13px] font-normal text-slate-400"
                      >
                        Entrez votre code à 6 chiffres pour continuer
                      </motion.p>

                      <div className="mb-10 flex flex-nowrap justify-center gap-2.5">
                        {code.map((digit, i) => (
                          <motion.input
                            key={i}
                            custom={i}
                            variants={codeInputVariants}
                            initial="hidden"
                            animate="visible"
                            ref={(el) => {
                              codeRefs.current[i] = el;
                            }}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={1}
                            value={digit}
                            disabled={verifying}
                            onChange={(e) =>
                              handleCodeChange(i, e.target.value)
                            }
                            onKeyDown={(e) => handleCodeKeyDown(i, e)}
                            onPaste={(e) => handleCodePaste(i, e)}
                            whileFocus={{ scale: 1.08 }}
                            className="h-[52px] w-[42px] rounded-2xl border-2 border-white/[0.15] bg-[#0b0b1a] text-center text-2xl font-bold text-slate-100 caret-[#00c896] outline-none transition-[border-color,box-shadow] focus:border-[#00c896] focus:shadow-[0_0_0_3px_rgba(0,200,150,0.15)] disabled:opacity-50 sm:h-[58px] sm:w-12 sm:text-[1.6rem]"
                          />
                        ))}
                      </div>

                      <motion.button
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.55, duration: 0.45 }}
                        type="button"
                        onClick={handleContinue}
                        disabled={!isCodeComplete || verifying}
                        whileHover={
                          isCodeComplete && !verifying
                            ? { scale: 1.02 }
                            : undefined
                        }
                        whileTap={
                          isCodeComplete && !verifying
                            ? { scale: 0.98 }
                            : undefined
                        }
                        className={`mt-2 flex h-14 w-full items-center justify-center gap-2 rounded-[4rem] bg-gradient-to-br from-[#00c896] to-[#059669] text-base font-semibold text-white shadow-[0_4px_20px_rgba(0,200,150,0.3)] transition-[box-shadow,opacity] hover:shadow-[0_6px_30px_rgba(0,200,150,0.45)] sm:h-16 sm:text-lg ${
                          isCodeComplete && !verifying
                            ? "pointer-events-auto opacity-100"
                            : "pointer-events-none opacity-55"
                        }`}
                      >
                        Continuer{" "}
                        <ArrowRight className="h-6 w-6" strokeWidth={2} />
                      </motion.button>

                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.65, duration: 0.4 }}
                        onClick={verifying ? undefined : handleBack}
                        className={`mt-5 block text-center text-[13px] text-slate-400 transition-colors hover:text-[#00c896] ${
                          verifying
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }`}
                      >
                        ← Retour à la connexion
                      </motion.span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* Image (desktop only) */}
          <motion.div
            variants={imageVariants}
            initial="hidden"
            animate="visible"
            className="hidden overflow-hidden rounded-[3rem] lg:block"
          >
            <motion.img
              src="/login-bg.png"
              alt="Image de connexion"
              className="block w-[480px] rounded-[3rem]"
              animate={{
                scale: [1, 1.06, 1],
              }}
              transition={{
                duration: 10,
                ease: "easeInOut",
                repeat: Infinity,
                delay: 3.5,
              }}
            />
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}