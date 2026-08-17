export const validateName = (name: string) => {
  if (name.length < 2) {
    return "Nome deve ter ao menos 2 caracteres.";
  }

  if (name.length > 100) {
    return "Nome muito longo.";
  }

  return "";
};

export const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "E-mail inválido.";
  }

  return "";
};

export const validatePassword = (password: string) => {
  if (password.length < 8) {
    return "A senha deve ter pelo menos 8 caracteres.";
  }

  if (!/[A-Z]/.test(password)) {
    return "Deve conter ao menos uma letra maiúscula.";
  }

  if (!/[0-9]/.test(password)) {
    return "Deve conter ao menos um número.";
  }

  return "";
};