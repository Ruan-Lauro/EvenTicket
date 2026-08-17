"use client"

import { useEffect, useState } from "react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { useRouter } from "next/navigation";
import { ApiError } from "next/dist/server/api-utils";
import { validateEmail, validateName, validatePassword } from "@/utils/authFunction";
import MainPage from "@/components/main";
import { CreateUserWithRole } from "@/services/userService";
import Hero from "@/components/hero";
import hero from "@/assets/hero4.webp";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";


export default function Admin() {
  
  const {user} = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    userRole: "ORGANIZER",
  });
  const [formError, setFormError] = useState("");
  const route = useRouter();

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    const updatedForm = { ...form, [name]: value };

    setForm(updatedForm);

    if (name === "name") {
      const nameError = validateName(updatedForm.name);
      setFormError(nameError);
    } else if (name === "email") {
      const emailError = validateEmail(updatedForm.email);
      setFormError(emailError);
    } else if (name === "password" || name === "confirmPassword") {
      const passwordError = validatePassword(updatedForm.password);
      const confirmPasswordError =
        updatedForm.confirmPassword &&
        updatedForm.confirmPassword !== updatedForm.password
          ? "As senhas não conferem."
          : "";

      setFormError(passwordError || confirmPasswordError);
    }
  };

  const handleSubmit  = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nameError = validateName(form.name);
    const emailError = validateEmail(form.email);
    const passwordError = validatePassword(form.password);
    const confirmPasswordError =
      form.confirmPassword !== form.password ? "As senhas não conferem." : "";
    const roleError = !form.userRole ? "Selecione uma função." : "";

    const errorMessage =
      nameError ||
      emailError ||
      passwordError ||
      confirmPasswordError ||
      roleError;

    if (errorMessage) {
      setFormError(errorMessage);
      return;
    }

    setFormError("");
    
    try{
        const result = await CreateUserWithRole({
            email: form.email,
            name: form.name,
            passwordHash: form.password,
            role: form.userRole,
        });
        console.log(result)
        if(result.message == "Usuário criado com sucesso"){
            toast.success(`Usuário ${form.name} criado com sucesso`);
            route.push('/home');
        }
    }catch(error){
        const apiError = error as ApiError;
        setFormError(apiError.message);
    }
 
  };

  useEffect(()=>{
    if(user && user.role !== "ADMIN") {
      toast.error("Você não tem acesso a essa página");
      return router.push("/home")
    }
  },[user])

    return(
        <MainPage page={4} >
            <Hero img={hero} keyword="Cadastro" text="Funcionários" />
            <main className="w-full h-screen flex justify-center items-center ">
                <div className="flex items-centermd:p-10 md:gap-10 text-text/80 rounded-xl bg-white">
                    <div className="flex flex-col items-center max-md:px-5">
                        <h2 className="font-bold mb-3 text-3xl max-md:text-center md:text-4xl">Cadastre um Funcionário</h2>
                        <p className="max-md:text-center">
                            Ele pode organizar ou bilheteiro que valida os tickets
                        </p>

                        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3 mt-10">
                            <Input
                            type="text"
                            name="name"
                            label="Nome *"
                            placeholder="Escreva seu nome completo"
                            required
                            value={form.name}
                            onChange={handleChange}
                            hasError={Boolean(form.name) && !!validateName(form.name)}
                            />
                            <Input
                            type="email"
                            name="email"
                            label="E-mail *"
                            placeholder="Escreva seu e-mail"
                            required
                            value={form.email}
                            onChange={handleChange}
                            hasError={Boolean(form.email) && !!validateEmail(form.email)}
                            />
                            <Input
                            type="password"
                            name="password"
                            label="Senha *"
                            placeholder="Escreva sua senha"
                            required
                            value={form.password}
                            onChange={handleChange}
                            hasError={Boolean(form.password) && !!validatePassword(form.password)}
                            autoComplete="new-password"
                            />
                            <Input
                            type="password"
                            name="confirmPassword"
                            label="Confirmar Senha *"
                            placeholder="Confirme sua senha"
                            required
                            value={form.confirmPassword}
                            onChange={handleChange}
                            hasError={
                                Boolean(form.confirmPassword) &&
                                (Boolean(validatePassword(form.password)) ||
                                form.confirmPassword !== form.password)
                            }
                            autoComplete="new-password"
                            />

                            <label className="text-[14px] font-bold" htmlFor="userRole">Função *</label>
                            <select
                                name="userRole"
                                id="userRole"
                                value={form.userRole}
                                onChange={handleChange}
                                className="border p-1.5 rounded-sm outline-none transition-colors border-black/10"
                            >
                                <option value="">Selecione</option>
                                <option value="ORGANIZER">Organizador</option>
                                <option value="CONCIERGE">Bilheteiro</option>
                            </select>

                            {formError && (
                            <p className="text-red-500 text-xs font-medium text-center mt-1">
                                {formError}
                            </p>
                            )}

                            <Button type="submit" className="mt-3">
                            Registre-se
                            </Button>
                        </form>
                    </div>
                </div>
            </main>
        </MainPage>
    );
}