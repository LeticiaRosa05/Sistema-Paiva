import React from 'react';

const Modals = ({
    modalUsuario,
    setModalUsuario,
    modalConfirmarExclusao,
    setModalConfirmarExclusao,
    modalRenomear,
    setModalRenomear,
    renomearAnalise,
    novoTituloTexto,
    setNovoTituloTexto,
    excluirAnalise,
    excluirConta
 }) => {
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
                excluirConta();
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

    {modalConfirmarExclusao && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="bg-[#001f3f] border border-red-500/30 p-6 rounded-2xl shadow-2xl max-w-xs w-full animate-in zoom-in duration-200 text-center">
            <h3 className="text-white font-black uppercase text-sm mb-2">Excluir Análise?</h3>
            <p className="text-zinc-400 text-xs mb-6">Deseja realmente apagar a análise #{modalConfirmarExclusao.id}?</p>
            <div className="flex gap-2">
            <button 
                onClick={() => { excluirAnalise(modalConfirmarExclusao.id); setModalConfirmarExclusao(null); }}
                className="flex-1 py-2 bg-red-600 text-white font-black uppercase text-[10px] rounded-lg"
            >
                Confirmar
            </button>
            <button onClick={() => setModalConfirmarExclusao(null)} className="flex-1 py-2 bg-zinc-800 text-zinc-300 font-black uppercase text-[10px] rounded-lg">
                Voltar
            </button>
            </div>
        </div>
        </div>
    )}
}