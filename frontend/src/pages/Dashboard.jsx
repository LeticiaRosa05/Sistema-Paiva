import React, { useState } from 'react';
import api from '../services/api';

function Dashboard(params) {
    const [arquivo, setArquivo] = useState(null);
    const [carregando, setCarregando] = useState(false);

    const handleUpload = async () => {
        if (!arquivo) return alert("Selecione um arquivo primeiro, por gentileza.");

        const formData = new FormData();
        formData.append('file', arquivo);

        setCarregando(true);
        try {
            const response = await api.post('/usuarios/analisar', formData, {
                headers: { 'Content-Type': 'multipart/form-data'}
            });
            alert("Análise concluída: " + response.data);
        } catch (error) {
            console.error(error);
            alert("Erro ao processar análise.");
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
        <h2>Painel de Controle - Sistema Paiva</h2>
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
            <h3>Nova Análise Forense</h3>
            <input type="file" onChange={(e) => setArquivo(e.target.files[0])} />
            <button onClick={handleUpload} disabled={carregando}>
            {carregando ? "IA Analisando..." : "Iniciar Análise"}
            </button>
        </div>
        </div>
    )
}

export default Dashboard;
