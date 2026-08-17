"use client";

import { useState } from "react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import img from "@/assets/img.jpg";
import logo from "@/assets/ticket.png";
import Image from "next/image";
import Link from "next/link";
import { loginApi, RegisterApi } from "@/services/authService";
import { useRouter } from "next/navigation";
import { ApiError } from "next/dist/server/api-utils";
import { validateEmail, validateName, validatePassword } from "@/utils/authFunction";



export default function Register() {

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [formError, setFormError] = useState("");
  const route = useRouter();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
    
    const errorMessage = nameError || emailError || passwordError || confirmPasswordError;

    if (errorMessage) {
      setFormError(errorMessage);
      return;
    }

    setFormError("");
    try{
        const result = await RegisterApi({
            email: form.email,
            name: form.name,
            password: form.password,
        });
        if(result.message == "Usuário criado com sucesso"){
            const loginResult =await loginApi({
                email: form.email,
                password: form.password,
            });
            if(loginResult.message !== "Login realizado com sucesso") return route.push('/login');
            route.push('/home');
        }
    }catch(error){
        const apiError = error as ApiError;
        setFormError(apiError.message);
    }
 
  };

  return (
    <main className="w-full h-screen flex justify-center items-center">
      <div className="flex items-center md:shadow-lg md:p-10 md:gap-10 text-text/80 rounded-xl ">
        <Image src={img} width={350} height={200} alt={"Image canva of the event"} loading="eager" className="max-lg:hidden  w-90 h-auto" />
        <div className="flex flex-col items-center w-75">
          <Image src={logo} width={120} height={100} alt="logo" className=" mb-5 w-30 h-auto" loading="eager" />
          <h2 className="font-bold mb-1 text-lg">Cadastre uma conta</h2>
          <p className="text-[12px]">
            Se você já tem uma conta, então faça{" "}
            <Link href="./login" className="text-blue hover:underline font-bold">
              Login
            </Link>{" "}
          </p>

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3 mt-3">
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
  );
}