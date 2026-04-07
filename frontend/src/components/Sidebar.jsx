import iconDeletar from '../assets/icon-deletar.png';
import iconPencil from '../assets/icon-lapis.png';
import iconSaida from '../assets/icon-saida.png';
import React from 'react';

const Sidebar = ({ 
  sidebarAberta,
  setSidebarAberta,
  historico,
  handleLogout,
  setArquivo,
  analiseSelecionada,
  setAnaliseSelecionada,
  setResultado,
  menuAbertoId,
  setMenuAbertoId,
  setModalRenomear,
  setModalConfirmarExclusao
}) => {
  return (
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
                        setModalConfirmarExclusao(item);
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
  );
};

export default Sidebar;