import React, { useState } from 'react';
import api from '../services/api';

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/login', { email, senha });
      localStorage.setItem('token', response.data.token);
      alert("Bem-vinda, Perita Letícia!");
      // Aqui você usaria o useNavigate para ir para a Dashboard
      const tempoTotal = 5 * 60 * 60 * 1000; // 5 horas em milissegundos
      setTimeout(() => {
          alert("O acesso expira em 30 minutos.");
      }, tempoTotal - (30 * 60 * 1000)); 
    
      setTimeout(() => {
          alert("Atenção: Seu acesso expira em 15 minutos.");
      }, tempoTotal - (15 * 60 * 1000));
    } catch (error) {
      alert("Erro ao entrar. Verifique suas credenciais.");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '100px' }}>
      <h1>Sistema Paiva</h1>
      <p>Análise Forense Inteligente</p>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', width: '300px', gap: '10px' }}>
        <input 
          type="email" 
          placeholder="E-mail" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <input 
          type="password" 
          placeholder="Senha" 
          value={senha} 
          onChange={(e) => setSenha(e.target.value)} 
          required 
        />
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}

export default Login;
