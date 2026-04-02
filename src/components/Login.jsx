

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Checkbox } from "@/components/ui/checkbox";
import GoogleSignIn from './GoogleSignIn';

const SignIn = () => {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificamos si ya aceptó antes
    const accepted = localStorage.getItem('acceptedTerms');
    if (accepted === 'true') {
      setAcceptedTerms(true);
    }
  }, []);

  const handleTermsChange = (checked) => {
    setAcceptedTerms(checked);
    if (checked) {
      localStorage.setItem('acceptedTerms', 'true');
    } else {
      localStorage.removeItem('acceptedTerms');
    }
  };

  const handleTermsClick = (e) => {
    e.preventDefault();
    window.open('/terms-conditions', '_blank');
  };

  return (
    <div
      className="flex min-h-screen justify-center items-center p-5 bg-cover bg-center bg-no-repeat fixed inset-0"
      style={{ backgroundImage: "url(/login-bg.webp)" }}
    >
      <div className="text-center bg-[#282b824a] shadow-[0_0_5px_1px_#4f52b2] h-auto rounded-[3%] flex flex-col justify-between p-8 backdrop-blur-md w-full max-w-md">
        <span className="flex items-center justify-center">
          <img src="/logo_sign_in.webp" alt="logo" className="w-[150px] h-[150px] object-contain" />
        </span>

        <div className="my-6">
          <h2 className="text-xl font-bold text-white mt-4">
            Nunca fue tan fácil
          </h2>
          <h2 className="text-xl font-bold text-white mb-8">
            ¡Simplifica la gestión de tu gimnasio!
          </h2>
        </div>

        <div className="flex justify-center items-center gap-2 mb-8">
          {!acceptedTerms && (
            <Checkbox
              id="terms"
              checked={acceptedTerms}
              onCheckedChange={handleTermsChange}
              className="border-white data-[state=checked]:bg-[#ffd506] data-[state=checked]:text-black"
            />
          )}

          <label htmlFor="terms" className="text-white text-sm cursor-pointer">
            {!acceptedTerms ? "Acepto los " : "Aceptaste los "}
            <button
              onClick={handleTermsClick}
              className="text-[#ffd506] underline font-bold hover:text-[#e7c107] bg-transparent border-none p-0 cursor-pointer ml-1"
            >
              Términos y Condiciones
            </button>
          </label>
        </div>

        <GoogleSignIn acceptedTerms={acceptedTerms} />
      </div>
    </div>
  );
};

export default SignIn;
