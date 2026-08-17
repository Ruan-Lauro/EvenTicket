"use client"
import Button from "@/components/Button";
import Input from "@/components/Input";
import img from "@/assets/img.jpg";
import logo from "@/assets/ticket.png";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginApi } from "@/services/authService";

export default function login() {

    const [error, setError] = useState("");
    const route = useRouter();

    async function handleSubmit(formData: FormData) {
        const email = formData.get("email");
        const password = formData.get("password");

        if (typeof email !== "string" || typeof password !== "string") {
            setError("E-mail e senha são obrigatórios.");
            return;
        }
        
        try {
            setError("");
            const result = await loginApi({
                email,
                password,
            });

            if (result && result.message === "Login realizado com sucesso") {
                route.push('/home');
            }
        } catch(error) {
          
             if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Erro ao fazer login.");
            }
        }

    }

    return (
        <main className="w-full h-screen flex justify-center items-center ">
            <div className="flex items-center md:shadow-lg sm:p-10 sm:gap-10 text-text/80 rounded-xl">
                <div className="flex flex-col items-center w-75" >
                    <Image src={logo} width={350} height={200} alt="logo" className="mb-5 w-30 h-auto" loading="eager" />
                    <h2 className="font-bold mb-1 text-lg" >Entre na sua conta</h2>
                    <p className="text-[12px]" >Se você não tem uma conta, então se <Link href='./register' className="text-blue hover:underline font-bold" >Registre</Link> </p>
                    <form action={handleSubmit}  className="w-full flex flex-col gap-3 mt-3">
                        <Input type="email" name="email" label="E-mail *" placeholder="Escreva seu e-mail" required />
                        <Input type="password" name="password" label="Senha *" placeholder="Escreva sua senha" required />
                        {error && (
                            <p className="text-red-700 text-center" >{error}</p>
                        )}
                        <Button type="submit" className="mt-5" >
                            Login
                        </Button>
                    </form>
                </div>
                  <Image src={img} width={350} height={200} alt={"Image canva of the event"} loading="eager" className="max-lg:hidden w-90 h-auto"/>
            </div>
        </main>
    );
}