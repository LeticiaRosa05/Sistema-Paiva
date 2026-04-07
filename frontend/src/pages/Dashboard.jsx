import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

import ChatArea from '../components/ChatArea';
import Sidebar from '../components/Sidebar';
import Modals from '../components/Modals';

function Dashboard() {
  const [modalConfirmarExclusao, setModalConfirmarExclusao] = useState(null);
  const [analiseSelecionada, setAnaliseSelecionada] = useState(null);
  const [novoTituloTexto, setNovoTituloTexto] = useState("");
  const [sidebarAberta, setSidebarAberta] = useState(true);
  const [modalRenomear, setModalRenomear] = useState(null);
  const [modalUsuario, setModalUsuario] = useState(false);
  const [menuAbertoId, setMenuAbertoId] = useState(null);
  const [nomeUsuario, setNomeUsuario] = useState("--");
  const [carregando, setCarregando] = useState(false);
  const [resultado, setResultado] = useState("");
  const [historico, setHistorico] = useState([]);
  const [arquivo, setArquivo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const nomeSalvo = localStorage.getItem('nomeUsuario');
    if (nomeSalvo) setNomeUsuario(nomeSalvo);
    carregarHistorico();
  }, []);

  useEffect(() => {
    const fecharMenu = () => setMenuAbertoId(null);
    window.addEventListener('click', fecharMenu);
    return () => window.removeEventListener('click', fecharMenu);
  }, []);

useEffect(() => { // tira o scroll da sidebar ao abrir o menu de contexto/mini modal das análises
  const sidebarNav = document.querySelector('nav.flex-1');
  if (sidebarNav) {
    if (menuAbertoId !== null) {
      sidebarNav.style.overflowY = 'hidden';
    } else {
      sidebarNav.style.overflowY = 'auto';
    }
  }
}, [menuAbertoId]);

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

  // exclui a análise
  async function excluirAnalise(id) {
      try {
          await api.delete(`/usuarios/analises/${id}`);
          setHistorico(historico.filter(a => a.id !== id));
          if (analiseSelecionada?.id === id) {
              setResultado("");
              setAnaliseSelecionada(null);
          }
      } catch (error) {
          console.error("Erro ao excluir análise", error);
          alert("Não foi possível excluir a análise.");
      }
  }

  // exclui a conta + analises/chats
  async function excluirConta() {
      try {
          await api.delete('/usuarios/minha-conta');
          localStorage.clear();
          navigate('/login');
      } catch (error) {
          console.error("Erro ao excluir conta", error);
          alert("Erro ao processar exclusão.");
      }
  }

  async function renomearAnalise() {
    const id = modalRenomear.id;

    if (!novoTituloTexto || novoTituloTexto.trim() === "") {
      return;
    }

    try {
      await api.patch(`/usuarios/analises/${id}/titulo`, novoTituloTexto, {
        headers: {"Content-Type": "text/plain"}
      });

      // atualiza a sidebar na aplicação/localmente
      setHistorico(historico.map(analise => analise.id === id ? {...analise, titulo: novoTituloTexto} : analise
      ));

      // limpa as variáveis e fecha o modal de renomear
      setModalRenomear(null);
      setNovoTituloTexto("");
    } catch (error) {
      console.error("Erro ao renomear análise ", error)
    }
  }

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
    <div className="z-[50] flex h-screen bg-black text-white font-sans">
      {/* sidebar */}
      <Sidebar 
        sidebarAberta={sidebarAberta}
        setSidebarAberta={setSidebarAberta}
        historico={historico}
        handleLogout={handleLogout}
        setArquivo={setArquivo}
        analiseSelecionada={analiseSelecionada}
        setAnaliseSelecionada={setAnaliseSelecionada}
        setResultado={setResultado}
        menuAbertoId={menuAbertoId}
        setMenuAbertoId={setMenuAbertoId}
        setModalRenomear={setModalRenomear}
        setModalConfirmarExclusao={setModalConfirmarExclusao}
      />

      <Modals
        modalUsuario={modalUsuario}
        setModalUsuario={setModalUsuario}
        modalConfirmarExclusao={modalConfirmarExclusao}
        setModalConfirmarExclusao={setModalConfirmarExclusao}
        modalRenomear={modalRenomear}
        setModalRenomear={setModalRenomear}
        renomearAnalise={renomearAnalise}
        novoTituloTexto={novoTituloTexto}
        setNovoTituloTexto={setNovoTituloTexto}
        excluirAnalise={excluirAnalise}
        excluirConta={excluirConta}
      />

      {/* painel principal */}
      <main className="z-[0] flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between pl-8 pr-4 shadow-md">
          <h2 className="text-sm font-bold tracking-tight text-zinc-300 uppercase">Ambiente de Perícia</h2>
          <div className="flex items-center gap-3">
            <div onClick={() => setModalUsuario(true)} className="text-right cursor-pointer group gap-2 bg-zinc-900 px-4 py-2 rounded-full hover:bg-blue-900/40 border-blue-400/10 transition-all">
                <p className="text-xs font-bold text-zinc-200">Perito(a) {nomeUsuario}</p>
                <p className="text-[10px] text-green-500 flex items-center justify-end gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Sistema Online
                </p>
            </div>
          </div>
        </header>

        <section className="flex-1 p-8 overflow-y-auto bg-zinc-950">
          <div className="max-w-4xl mx-auto">

            {/* Área Central de Resultados */}
            <ChatArea
              analiseSelecionada={analiseSelecionada} 
              resultado={resultado} 
              carregando={carregando}
              exportarPDF={exportarPDF}
              handleUpload={handleUpload}
              setArquivo={setArquivo}
            />

          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;