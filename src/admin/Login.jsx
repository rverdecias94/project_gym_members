import { useState } from "react"
import { supabase } from '../supabase/client';
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const LoginAdmin = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  })

  const handleChange = (e) => {
    let { name, value } = e.target;
    setCredentials(prev => (
      {
        ...prev,
        [name]: value
      }
    ))
  }
  const handleEnterAdminPanel = async () => {
    const { username, password } = credentials;
    if (!username || !password) {
      alert("Por favor ingresa usuario y contraseña");
      return;
    }

    try {
      // Consulta en la tabla `users_admin`
      const { data, error } = await supabase
        .from('users_admin')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .single();

      if (error) {
        console.error('Error al buscar en Supabase:', error.message);
        alert("Usuario o contraseña incorrectos");
        return;
      }

      if (data) {
        navigate('/admin/panel');
      } else {
        alert("Usuario o contraseña incorrectos");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Hubo un error al validar las credenciales");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-background p-5 relative">
      <div className="text-center bg-card shadow-md h-auto rounded-xl flex flex-col justify-start p-6 gap-6 w-full max-w-md border border-border">
        <h2 className="text-2xl font-bold text-foreground mb-4">Administración</h2>

        <div className="grid gap-2 text-left">
          <Label htmlFor="username">Usuario</Label>
          <Input
            id="username"
            type="text"
            value={credentials.username}
            onChange={handleChange}
            name="username"
            placeholder="mi_usuario"
            maxLength={20}
          />
        </div>

        <div className="grid gap-2 text-left">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            placeholder="************"
            maxLength={20}
          />
        </div>

        <Button
          onClick={handleEnterAdminPanel}
          variant="outline"
          className="w-full py-6 text-base mt-4"
        >
          Entrar al panel de Administración
        </Button>
      </div>
    </div>
  )
}

export default LoginAdmin