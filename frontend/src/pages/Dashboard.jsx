import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function Dashboard() {
  const [arquivo, setArquivo] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [resultado, setResultado] = useState("");
  const [historico, setHistorico] = useState([]);
  const [nomeUsuario, setNomeUsuario] = useState("--");
  const [analiseSelecionada, setAnaliseSelecionada] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const nomeSalvo = localStorage.getItem('nomeUsuario');
    if (nomeSalvo) setNomeUsuario(nomeSalvo);
    carregarHistorico();
  }, []);

  async function carregarHistorico() {
      try {
          const response = await api.get('/usuarios/analises');
          const historicoOrdenado = response.data.sort((a, b) => { // ordena o histórico de acordo com a data em que os itens foram criados
            return new Date(b.horaEnvio) - new Date(a.horaEnvio);
          });
          setHistorico(historicoOrdenado);
      } catch (error) {
          console.error("Erro ao carregar histórico", error);
      }
  }

  const exportarPDF = async () => {
    if (!resultado) return alert("Não há análise para exportar.");

    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      const dataAtual = new Date();
      const dataEmissao = dataAtual.toLocaleDateString();
      const horaEmissao = dataAtual.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const margemEsquerda = 20;
      let y = 20; // Posição vertical inicial

      // Cabeçalho
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(0, 31, 63);
      doc.text("SISTEMA PAIVA - RELATÓRIO TÉCNICO PERICIAL", margemEsquerda, y);
      y += 12;

      const imprimirLinhaInfo = (rotulo, resposta) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0); // Preto para o rótulo
        doc.text(rotulo, margemEsquerda, y);
        
        const larguraRotulo = doc.getTextWidth(rotulo);
        doc.setTextColor(100); // Cinza (cor 100) para a resposta
        doc.text(resposta, margemEsquerda + larguraRotulo + 2, y);
        y += 6;
      }

      const idAnalise = historico.find(h => h.analise_IA === resultado)?.id || "N/A";

      imprimirLinhaInfo("ID da análise: ", `${idAnalise}`);
      imprimirLinhaInfo("Perito responsável: ", nomeUsuario);
      imprimirLinhaInfo("Data de emissão: ", `${dataEmissao}, ${horaEmissao}`);

      y += 2;
      doc.setTextColor(0, 31, 63);
      doc.text("-".repeat(145), margemEsquerda, y); // Linha divisória
      y += 12;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("Laudo Técnico Original:", margemEsquerda, y);
      y += 10;

      doc.setFont("times", "normal");
      doc.setFontSize(12);

      // Limpeza de caracteres da mensagem da IA
      const textoLimpo = resultado.replace(/\*\*/g, "").replace(/\* /g, "• ");
      const linhas = doc.splitTextToSize(textoLimpo, 170);

      linhas.forEach((linha) => {
        if (y > 275) {
          doc.addPage();
          y = 20;
        }
        doc.text(linha, margemEsquerda, y, {align: 'justify', maxWidth: 170});
        y += 7;
      });

      // enumerador de páginas
      const totalPaginas = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPaginas; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(150);
        doc.text(
          `Página ${i} de ${totalPaginas} - Documento gerado eletronicamente pelo Sistema Paiva`,
          105, 290, { align: "center" }
        );
      }

      doc.save(`Laudo_paiva_ID${idAnalise}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); // retira o token e nome do usuário logado do localstorage ao deslogar
    localStorage.removeItem('nomeUsuario');
    navigate('/login');
  };

  const handleUpload = async () => {
    if (!arquivo) return alert("Selecione um arquivo primeiro, por gentileza.");
    const formData = new FormData();
    formData.append('file', arquivo);

    setCarregando(true);

    try {
      const response = await api.post('/usuarios/analisar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const dadosAnalise = response.data; // O objeto completo vindo do Java
      setAnaliseSelecionada(dadosAnalise); // Salva o objeto para o PDF usar
      setResultado(dadosAnalise.analise_IA);

      const textoAnalise = response.data.analise_IA || response.data;
      setResultado(textoAnalise);

      carregarHistorico(); // atualiza o histórico para a nova análise aparecer na lista

    } catch (error) {
        console.error("ERRO NO UPLOAD:", error.response?.data || error.message);
        alert("Erro na análise. Verifique o console.");
    } finally {
        setCarregando(false);
    }
  };

  return (
    <div className="flex h-screen bg-black text-white font-sans">
      {/* SIDEBAR - Azul Marinho */}
        <aside className="w-64 bg-paiva-marinho flex flex-col shadow-xl">
        <div className="p-6 text-center border-b border-blue-900">
           <div className="bg-white p-2 rounded-lg mb-2 flex justify-center items-center">
             <span className="text-paiva-laranja font-bold text-xl italic">PAIVA</span>
          </div>
          <p className="text-[10px] uppercase tracking-widest text-blue-300 font-bold">Forense Digital</p>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <h4 className="text-xs font-bold text-blue-400 mb-4 px-2 uppercase">Histórico Recente</h4>
          <div className="space-y-2">
            {historico.length > 0 ? historico.map((item) => (
              <div 
                key={item.id} 
                onClick={() => {
                  setAnaliseSelecionada(item);
                  setResultado(item.analise_IA);
                }}
                className="p-3 bg-blue-900/20 border border-blue-800/50 rounded cursor-pointer hover:bg-blue-800 transition"
              >
                <p className="text-xs font-medium truncate">Análise #{item.id}</p>
                <span className="text-[9px] text-blue-400">Clique para visualizar</span>
              </div>
            )) : (
              <p className="text-[10px] text-blue-500 px-2 italic">Nenhuma análise encontrada.</p>
            )}
          </div>
        </nav>

        <button onClick={handleLogout} className="p-4 bg-red-900/20 hover:bg-red-600 transition text-xs font-bold uppercase border-t border-red-900/30">
          Sair do Sistema
        </button>
      </aside>

      {/*painel principal*/}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-8 shadow-md">
          <h2 className="text-sm font-bold tracking-tight text-zinc-300 uppercase">Ambiente de Perícia</h2>
          <div className="flex items-center gap-3">
            <div className="text-right">
                <p className="text-xs font-bold text-zinc-200">Perito(a) {nomeUsuario}</p>
                <p className="text-[10px] text-green-500 flex items-center justify-end gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Sistema Online
                </p>
            </div>
          </div>
        </header>

        <section className="flex-1 p-8 overflow-y-auto bg-zinc-950">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/*card/espaço de upload*/}
            <div className="bg-zinc-900 p-8 rounded-xl border border-zinc-800 shadow-2xl">
              <h3 className="text-paiva-laranja text-xs font-black uppercase mb-4 tracking-widest">Entrada de Dados</h3>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <input 
                  type="file" 
                  className="block w-full text-xs text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-paiva-laranja file:text-white hover:file:bg-orange-600 cursor-pointer"
                  onChange={(e) => setArquivo(e.target.files[0])}
                />
                <button 
                  onClick={handleUpload}
                  disabled={carregando}
                  className="w-full sm:w-auto px-8 py-2 bg-blue-700 text-[10px] font-black uppercase rounded-full hover:bg-blue-600 transition disabled:opacity-50 shadow-lg shadow-blue-900/20"
                >
                  {carregando ? "IA Processando..." : "Iniciar Análise"}
                </button>
              </div>
            </div>

            {resultado && ( // resultado da análise
              <div className="bg-white text-zinc-900 p-8 rounded-xl shadow-2xl min-h-[500px] animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center border-b border-zinc-200 pb-4 mb-6">
                    <h3 className="text-zinc-400 text-[10px] uppercase font-black tracking-widest">Relatório Forense Automatizado</h3>
                    <button onClick={exportarPDF} className="text-[10px] font-bold text-blue-600 hover:underline">Exportar PDF</button>
                </div>
                <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap leading-relaxed font-serif text-base text-justify">{resultado}</p>
                </div>
              </div>
            )}

          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
