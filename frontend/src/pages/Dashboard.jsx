import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import iconSaida from '../assets/icon-saida.png';
import iconPencil from '../assets/icon-lapis.png';
import iconDeletar from '../assets/icon-deletar.png';

function Dashboard() {
  const [arquivo, setArquivo] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [resultado, setResultado] = useState("");
  const [historico, setHistorico] = useState([]);
  const [nomeUsuario, setNomeUsuario] = useState("--");
  const [analiseSelecionada, setAnaliseSelecionada] = useState(null);
  const [sidebarAberta, setSidebarAberta] = useState(true);
  const [modalUsuario, setModalUsuario] = useState(false);
  const [menuAbertoId, setMenuAbertoId] = useState(null);
  const [modalRenomear, setModalRenomear] = useState(null);
  const [novoTituloTexto, setNovoTituloTexto] = useState("");
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
      <aside className={`relative bg-[#001f3f] flex flex-col shadow-xl transition-all duration-300 ease-in-out ${sidebarAberta ? 'w-64' : 'w-20'}`}>
        
        {/* botão retrátil */}
        <button
          onClick={() => setSidebarAberta(!sidebarAberta)}
          className="absolute -right-3 top-[3.2rem] bg-blue-600 hover:bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center border-2 border-[#001f3f] shadow-md z-50 transition-transform active:scale-90"
        >
          <span className="text-[10px]">{sidebarAberta ? "❮" : "❯"}</span>
        </button>

        {/* logo Paiva */}
        <div className="p-4 flex flex-col gap-6">
          <div className={`h-12 bg-white p-2 rounded-lg flex justify-center transition-all text-[#ff4d00] font-black text-xl italic tracking-tighter`}>
            <span className={`duration-500 delay-200 ${sidebarAberta ? 'opacity-100' : 'opacity-100'}`}>P</span>
            <span className={`duration-500 delay-200 ${sidebarAberta ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>AIVA</span>
          </div>
        </div>

        {/* botão nova análise */}
        <div className="px-4 mb-4">
          <button 
            onClick={() => {setResultado(""); setAnaliseSelecionada(null); setArquivo(null);}}
            className={`h-12 flex items-center justify-center gap-2 w-full bg-blue-800/40 hover:bg-blue-700 border border-blue-400/20 rounded-xl p-3 transition-all text-white font-black text-[10px] uppercase`}
          >
            <span className="text-sm ml-2">⇋</span>
            <span className={`transition-all duration-500 delay-200 h-auto ${sidebarAberta ? 'opacity-100 w-auto mr-2' : 'opacity-0 w-0 h-0 overflow-hidden'}`}>Nova Análise</span>
          </button>
        </div>

        {/* históricos com IDs centralizados */}
        <nav className="flex-1 p-4 overflow-y-auto custom-scrollbar">
          <div className="space-y-2">
            {historico.map((item) => (
              <div
                key={item.id}
                className={`group relative p-3 rounded-lg cursor-pointer transition-all flex items-center ${sidebarAberta ? 'justify-between gap-3' : 'justify-center'} ${analiseSelecionada?.id === item.id ? 'bg-blue-700 shadow-inner' : 'bg-blue-900/20 hover:bg-blue-800'}`}
              >
                {/* Área de clique para selecionar a análise */}
                <div 
                  className="flex items-center gap-3 flex-1 min-w-0" 
                  onClick={() => { setAnaliseSelecionada(item); setResultado(item.analise_IA); }}
                >
                  <span className="font-black text-[10px] w-6 text-center shrink-0">#{item.id}</span>
                  {sidebarAberta && (
                    <p className="text-[11px] truncate uppercase font-bold tracking-tight text-blue-100">
                      {item.titulo || "Análise Forense"} {/*mostra o nome que o usuário renomeou ou o padrão*/}
                    </p>
                  )}
                </div>

                {/* Botão de 3 Pontinhos */}
                {sidebarAberta && (
                  <div className="relative">
                    <button
                      id={`btn-menu-${item.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuAbertoId(menuAbertoId === item.id ? null : item.id);
                      }}
                      className="text-xl text-blue-600 font-extrabold p-1 hover: rounded text-blue-300 transition-all"
                    >⋮</button>

                    {/* mini modal dos 3 pontinhos */}
                    {menuAbertoId === item.id && (
                      <div className="fixed bg-[#00152b] border border-blue-500/30 rounded-lg shadow-2xl z-[9999] py-1 w-32 animate-in fade-in zoom-in duration-150" style={{
                        top: document.getElementById(`btn-menu-${item.id}`)?.getBoundingClientRect().top + "px",
                        left: (document.getElementById(`btn-menu-${item.id}`)?.getBoundingClientRect().right + 10) + "px"
                        }}>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuAbertoId(null);
                            setModalRenomear(item);
                          }}
                          className="w-full text-left px-4 py-2 text-[10px] font-black uppercase text-blue-100 hover:bg-blue-800 transition-colors flex items-center"
                        >
                          <img src={iconPencil} className="w-4 h-4 mr-1" alt="Renomear" /> Renomear
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuAbertoId(null);
                            //setModalConfirmarExclusao(item);
                          }}
                          className="w-full text-left px-4 py-2 text-[10px] font-black uppercase text-blue-100 hover:bg-red-900/60 transition-colors flex items-center"
                        >
                          <img src={iconDeletar} className="w-4 h-4 mr-1" alt="Deletar" /> Deletar
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>

        {/* footer */}
        <div className="p-4 mt-auto border-t border-blue-900/50">
          <button 
            onClick={handleLogout}
            className={`h-12 w-full flex items-center justify-center gap-2 p-2 text-[10px] font-black uppercase bg-red-900/40 text-red-500 hover:bg-red-900/70 rounded transition-colors rounded-xl transition-all ${sidebarAberta ? 'gap-2' : ''}`}
            title="Sair do Sistema"
          >
            <span className={`text-lg duration-0.5 delay-200 ${sidebarAberta ? 'hidden' : 'opacity-100 ml-1'}`}><img src={iconSaida} className="w-6 h-6" alt="Sair" /></span>
            <span className={`duration-500 delay-200 h-auto text-[10px] font-black ${sidebarAberta ? 'opacity-100' : 'opacity-0 w-0 h-0 overflow-hidden'}`}>Encerrar Sessão</span>
          </button>
        </div>
      </aside>

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
              <div className="bg-white text-zinc-900 p-8 rounded-xl shadow-2xl min-h-[500px] animate-in fade-in slide-in-from-bottom-4 duration-500 mt-6">
                <div className="flex justify-between items-center border-b border-zinc-200 pb-4 mb-6">
                    <h3 className="text-zinc-400 text-[10px] uppercase font-black tracking-widest">Relatório Forense Automatizado</h3>
                    <button onClick={exportarPDF} className="text-[10px] font-bold text-blue-600 hover:underline">Exportar PDF</button>
                </div>
                <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap leading-relaxed font-serif text-base text-justify">{resultado}</p>
                </div>
              </div>
            )}

            {/* modal de exclusão de conta */}
            {modalUsuario && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm border-none">
                <div className="bg-[#001f3f] border border-red-500/30 p-8 rounded-2xl shadow-2xl max-w-sm w-full mx-4 animate-in fade-in zoom-in duration-300">
                  <h2 className="text-xl flex justify-center font-black text-white uppercase tracking-tighter mb-4">
                    Excluir Conta de Perito
                  </h2>
                  <p className="text-zinc-400 text-center text-sm mb-6 leading-relaxed">
                    Esta ação é irreversível. Todas as suas análises e dados serão apagados permanentemente do Sistema PAIVA.
                  </p>
                  
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={() => {
                        // Aqui chamaremos a API de exclusão no futuro
                        console.log("Solicitando exclusão de conta...");
                        setModalUsuario(false);
                      }}
                      className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-black uppercase text-[10px] rounded-lg transition-colors shadow-lg shadow-red-900/20"
                    >
                      Confirmar Exclusão
                    </button>
                    <button 
                      onClick={() => setModalUsuario(false)}
                      className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-black uppercase text-[10px] rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {modalRenomear && (
              <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm">
                <div className="bg-[#001f3f] border border-blue-500/30 p-6 rounded-2xl shadow-2xl max-w-xs w-full animate-in zoom-in duration-200">
                  <h3 className="text-white font-black uppercase text-sm mb-4">Renomear Análise</h3>
                  
                  <input 
                    type="text"
                    className="w-full bg-blue-900/20 border border-blue-500/30 rounded-lg p-2 text-white text-xs mb-6 focus:outline-none focus:border-blue-400"
                    placeholder="Digite o novo título..."
                    value={novoTituloTexto}
                    onChange={(e) => setNovoTituloTexto(e.target.value)}
                  />

                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        renomearAnalise(modalRenomear.id, novoTituloTexto);
                        setModalRenomear(null);
                        setNovoTituloTexto("");
                      }}
                      className="flex-1 py-2 bg-blue-600 text-white font-black uppercase text-[10px] rounded-lg"
                    >
                      Salvar
                    </button>
                    <button onClick={() => setModalRenomear(null)} className="flex-1 py-2 bg-zinc-800 text-zinc-300 font-black uppercase text-[10px] rounded-lg">
                      Cancelar
                    </button>
                  </div>
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
