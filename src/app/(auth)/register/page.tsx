"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Button, Input, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { registerSchema, type RegisterFormData } from "@/lib/validations/auth";
import { UserPlus } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError("");
    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const json = await res.json();
        setError(json.message || "Erreur lors de l'inscription");
        return;
      }

      // Auto sign in
      await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      router.push("/");
      router.refresh();
    } catch {
      setError("Erreur lors de l'inscription");
    }
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <Link href="/" className="mb-4 inline-block text-2xl font-bold text-blue-600">
          ERP Maroc
        </Link>
        <CardTitle>Créer un compte</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nom complet"
            placeholder="Votre nom"
            {...register("name")}
            error={errors.name?.message}
          />
          <Input
            label="Nom de l'entreprise"
            placeholder="Ma Société SARL"
            {...register("companyName")}
            error={errors.companyName?.message}
          />
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
            placeholder="Min. 8 caractères"
            {...register("password")}
            error={errors.password?.message}
          />
          <Button
            type="submit"
            className="w-full"
            isLoading={isSubmitting}
            leftIcon={<UserPlus className="h-4 w-4" />}
          >
            Créer mon compte
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Déjà un compte ?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Se connecter
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
