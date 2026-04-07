import React from 'react';

const ChatArea = ({
  analiseSelecionada,
  resultado,
  carregando,
  exportarPDF
}) => {
  // Define o que exibir (uma análise do histórico ou um resultado novo)
  const conteudo = analiseSelecionada ? analiseSelecionada.analise_IA : resultado;

  return (
    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
      {carregando ? (
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-blue-400 font-black uppercase text-xs tracking-widest animate-pulse">
            IA processando...
          </p>
        </div>
      ) : conteudo ? (
        <div className="max-w-4xl mx-auto bg-[#00152b]/50 border border-blue-900/30 p-10 rounded-3xl shadow-2xl backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex justify-between items-center border-b border-zinc-200 pb-4 mb-6">
              <h3 className="text-zinc-400 text-[10px] uppercase font-black tracking-widest">Relatório Forense Automatizado</h3>
              <button onClick={exportarPDF} className="text-[10px] font-bold text-blue-600 hover:underline">Exportar PDF</button>
          </div>
          <pre className="text-blue-100 font-medium leading-relaxed whitespace-pre-wrap text-sm selection:bg-blue-500/30">
            {conteudo}
          </pre>
        </div>
      ) : (
        <div className="h-full flex flex-col items-center justify-center text-center px-4">
          <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 border border-blue-500/20">
            <span className="text-4xl">🔍</span>
          </div>
          <h2 className="text-white font-black uppercase text-xl tracking-tighter mb-2">Pronto para a Perícia</h2>
          <p className="text-zinc-500 text-sm max-w-xs leading-relaxed">
            Selecione uma análise no histórico ou faça o upload de um novo arquivo para começar.
          </p>
        </div>
      )}
    </div>
  );
};

export default ChatArea;