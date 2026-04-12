import { useEffect, useId, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function Register() {
  const emailId = useId();
  const passwordId = useId();
  const confirmId = useId();

  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    document.title = "Crear cuenta | Gym Platform";
  }, []);

  const onChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const email = form.email.trim();
    const password = form.password;
    const confirmPassword = form.confirmPassword;

    if (!email || !password) {
      toast.error("Completa correo y contraseña.");
      return;
    }

    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      toast.success("Registro exitoso. Revisa tu correo si se requiere confirmación.");
      navigate("/login");
    } catch (err) {
      const message = err?.message || "No se pudo completar el registro.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container flex min-h-screen items-center justify-center py-10">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Crear cuenta</CardTitle>
            <CardDescription>
              Regístrate para acceder al sistema. Si ya tienes cuenta, inicia sesión.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor={emailId}>Correo</Label>
                <Input
                  id={emailId}
                  type="email"
                  value={form.email}
                  onChange={onChange("email")}
                  autoComplete="email"
                  placeholder="correo@ejemplo.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor={passwordId}>Contraseña</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setPasswordVisible((v) => !v)}
                    aria-label={passwordVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {passwordVisible ? "Ocultar" : "Mostrar"}
                  </Button>
                </div>
                <Input
                  id={passwordId}
                  type={passwordVisible ? "text" : "password"}
                  value={form.password}
                  onChange={onChange("password")}
                  autoComplete="new-password"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={confirmId}>Confirmar contraseña</Label>
                <Input
                  id={confirmId}
                  type={passwordVisible ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={onChange("confirmPassword")}
                  autoComplete="new-password"
                  required
                />
              </div>

              <div className="space-y-3">
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Creando cuenta..." : "Registrarme"}
                </Button>
                <Button type="button" variant="outline" className="w-full" asChild>
                  <Link to="/login">Ya tengo cuenta</Link>
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Al registrarte aceptas los{" "}
                <Link to="/terms-conditions" className="underline underline-offset-4 hover:text-foreground">
                  Términos y Condiciones
                </Link>
                .
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Register;

