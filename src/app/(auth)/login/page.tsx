"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Button, Input, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError("");
    const result = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
    });

    if (result?.error) {
      setError("Email ou mot de passe incorrect");
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <Link href="/" className="mb-4 inline-block text-2xl font-bold text-blue-600">
          ERP Maroc
        </Link>
        <CardTitle>Connexion</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="votre@email.ma"
            {...register("email")}
            error={errors.email?.message}
          />
          <Input
            label="Mot de passe"
            type="password"
            placeholder="••••••••"
            {...register("password")}
            error={errors.password?.message}
          />
          <Button
            type="submit"
            className="w-full"
            isLoading={isSubmitting}
            leftIcon={<LogIn className="h-4 w-4" />}
          >
            Se connecter
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Pas encore de compte ?{" "}
          <Link href="/register" className="text-blue-600 hover:underline">
            Créer un compte
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
