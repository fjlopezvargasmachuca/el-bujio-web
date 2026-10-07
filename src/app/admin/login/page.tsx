import Image from "next/image";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { loginAdmin } from "./actions";
import { PasswordInput } from "@/components/PasswordInput";

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const session = await getAdminSession();
  if (session) redirect("/admin");
  const params = await searchParams;

  return (
    <div className="login-wrap">
      <form className="card login-card" action={loginAdmin}>
        <div className="login-logo-wrap"><Image src="/logo-el-bujio.png" alt="Logo El Bujio" width={74} height={74} /></div>
        <div className="eyebrow">Administración</div>
        <h2 style={{ marginTop: 6 }}>El Bujio</h2>
        <p className="muted">Gestiona la carta, las ofertas, el menú del día y los datos de contacto.</p>
        <div className="field" style={{ marginTop: 18 }}>
          <label htmlFor="email">Correo</label>
          <input id="email" name="email" type="email" required autoComplete="username" />
        </div>
        <div className="field" style={{ marginTop: 12 }}>
          <label htmlFor="password">Contraseña</label>
          <PasswordInput />
        </div>
        {params.error ? <div className="status-box error">{params.error}</div> : null}
        <button className="button primary" type="submit" style={{ width: "100%", marginTop: 18 }}>Entrar</button>
        <a className="button ghost" href="/" style={{ width: "100%", marginTop: 8 }}>Volver a la web</a>
      </form>
    </div>
  );
}
