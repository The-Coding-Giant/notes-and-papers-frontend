"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordStrength } from "@/components/ui/password-strength";
import { Spinner } from "@/components/ui/spinner";
import { loginAction, signupAction } from "@/services/actions/auth-actions";
import {
  forgotPasswordSchema,
  loginSchema,
  signupSchema,
  type ForgotPasswordValues,
  type LoginValues,
  type SignupValues,
} from "@/lib/validation";
import { useOnline } from "./offline-banner";

function Submit({ label, busy, disabled }: { label: string; busy: boolean; disabled: boolean }) {
  return (
    <Button type="submit" className="w-full" disabled={disabled} aria-disabled={disabled}>
      {busy ? <Spinner label="Please wait" /> : label}
    </Button>
  );
}

export function LoginForm({ next = "/account" }: { next?: string }) {
  const router = useRouter();
  const online = useOnline();
  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields, isValid, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema), mode: "onChange" });

  async function onSubmit(values: LoginValues) {
    const res = await loginAction(values);
    if (!res.ok) return void toast.error(res.error); // backend errors are always toasts, never inline
    toast.success("Welcome back!");
    router.push(next);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <p className="text-xs text-muted-foreground">Fields marked * are required.</p>
      <Field
        id="email"
        label="Email address"
        required
        error={touchedFields.email ? errors.email?.message : undefined}
      >
        <Input
          id="email"
          placeholder="you@example.com"
          type="email"
          autoComplete="email"
          aria-required="true"
          invalid={!!(touchedFields.email && errors.email)}
          {...register("email")}
        />
      </Field>
      <Field
        id="password"
        label="Password"
        required
        error={touchedFields.password ? errors.password?.message : undefined}
      >
        <Input
          id="password"
          placeholder="Enter your password"
          type="password"
          autoComplete="current-password"
          aria-required="true"
          invalid={!!(touchedFields.password && errors.password)}
          {...register("password")}
        />
      </Field>
      <div className="text-right text-sm">
        <Link href="/forgot-password" className="text-link hover:underline">
          Forgot password?
        </Link>
      </div>
      <Submit label="Log in" busy={isSubmitting} disabled={!isValid || isSubmitting || !online} />
      <p className="text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link href="/signup" className="text-link hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}

export function SignupForm() {
  const router = useRouter();
  const online = useOnline();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, touchedFields, isValid, isSubmitting },
  } = useForm<SignupValues>({ resolver: zodResolver(signupSchema), mode: "onChange" });
  const password = useWatch({ control, name: "password" });

  async function onSubmit(values: SignupValues) {
    const res = await signupAction(values);
    if (!res.ok) return void toast.error(res.error);
    toast.success("Account created. You are signed in.");
    router.push("/account");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <p className="text-xs text-muted-foreground">Fields marked * are required.</p>
      <Field
        id="name"
        label="Full name"
        required
        error={touchedFields.name ? errors.name?.message : undefined}
      >
        <Input
          id="name"
          placeholder="Your full name"
          autoComplete="name"
          aria-required="true"
          invalid={!!(touchedFields.name && errors.name)}
          {...register("name")}
        />
      </Field>
      <Field
        id="email"
        label="Email address"
        required
        error={touchedFields.email ? errors.email?.message : undefined}
      >
        <Input
          id="email"
          placeholder="you@example.com"
          type="email"
          autoComplete="email"
          aria-required="true"
          invalid={!!(touchedFields.email && errors.email)}
          {...register("email")}
        />
      </Field>
      <Field
        id="password"
        label="Password"
        required
        error={touchedFields.password ? errors.password?.message : undefined}
        hint="At least 8 characters with 1 uppercase letter, 1 number and 1 symbol."
      >
        <Input
          id="password"
          placeholder="At least 8 characters"
          type="password"
          autoComplete="new-password"
          aria-required="true"
          invalid={!!(touchedFields.password && errors.password)}
          {...register("password")}
        />
        <PasswordStrength value={password ?? ""} />
      </Field>
      <Submit
        label="Create account"
        busy={isSubmitting}
        disabled={!isValid || isSubmitting || !online}
      />
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-link hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const online = useOnline();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, touchedFields, isValid, isSubmitting, isSubmitSuccessful },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange",
  });

  async function onSubmit(values: ForgotPasswordValues) {
    toast.info("Password reset by email is not enabled yet. Ask an admin to reset it for you.");
    reset(values);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <p className="text-xs text-muted-foreground">Fields marked * are required.</p>
      <Field
        id="email"
        label="Email address"
        required
        error={touchedFields.email ? errors.email?.message : undefined}
      >
        <Input
          id="email"
          placeholder="you@example.com"
          type="email"
          autoComplete="email"
          aria-required="true"
          invalid={!!(touchedFields.email && errors.email)}
          {...register("email")}
        />
      </Field>
      <Submit
        label="Send reset link"
        busy={isSubmitting}
        disabled={!isValid || isSubmitting || !online}
      />
      {isSubmitSuccessful && (
        <p role="status" className="text-sm text-success">
          Check your inbox for the reset link.
        </p>
      )}
      <p className="text-center text-sm">
        <Link href="/login" className="text-link hover:underline">
          Back to log in
        </Link>
      </p>
    </form>
  );
}
