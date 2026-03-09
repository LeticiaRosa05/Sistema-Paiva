package com.paiva.service;

import org.springframework.stereotype.Service;
import com.lowagie.text.pdf.PdfWriter;
import com.lowagie.text.*;
import java.io.ByteArrayOutputStream;
import com.paiva.model.Mensagem;
import com.paiva.model.Analise;
import java.util.List;

@Service
public class RelatorioService {
    public byte[] gerarRelatorioPdf(Analise analise, List<Mensagem> historico) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4);

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Fontes a serem usadas
            Font fontTitulo = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Font fontSubtitulo = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);
            Font fontNegrito = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
            Font fontNormal = FontFactory.getFont(FontFactory.HELVETICA, 12);

            // Título do PDF gerado
            Paragraph titulo = new Paragraph("SISTEMA PAIVA - RELATÓRIO TÉCNICO PERICIAL", fontTitulo);
            titulo.setAlignment(Element.ALIGN_CENTER);
            titulo.setSpacingAfter(20);
            document.add(titulo);

            // Linha de ID da Análise
            Paragraph pId = new Paragraph();
            pId.add(new Chunk("ID da Análise: ", fontNegrito));
            pId.add(new Chunk(String.valueOf(analise.getId()), fontNormal));
            document.add(pId);

            // Linha de Perito
            Paragraph pPerito = new Paragraph();
            pPerito.add(new Chunk("Perito responsável: ", fontNegrito));
            pPerito.add(new Chunk(analise.getUsuario().getNome(), fontNormal));
            document.add(pPerito);
            document.add(new Paragraph("----------------------------------------------------------------------------------------------------------------------------------"));
            document.add(new Paragraph(" "));

            // Laudo de origem do chat
            document.add(new Paragraph("Laudo técnico original: ", fontSubtitulo));
            Paragraph pLaudo = new Paragraph(formatarTextoIA(analise.getAnalise_IA()), fontNormal);
            pLaudo.setSpacingAfter(15);
            document.add(pLaudo);

            // Histórico do chat
            if (!historico.isEmpty()) {
                document.add(new Paragraph("Detalhamento e questionamentos: ", fontSubtitulo));

                for (Mensagem msg : historico) {
                    Paragraph pMsg = new Paragraph();
                    String label = msg.getOrigemRemetente().equals("user") ? "Perito: " : "Resposta da IA: ";

                    pMsg.add(new Chunk(label, fontNegrito));
                    pMsg.add(new Chunk(formatarTextoIA(msg.getTexto_mensagem()), fontNormal));
                    pMsg.setSpacingAfter(10);
                    document.add(pMsg);
                }
            }
            document.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return out.toByteArray();
    }

    // Remove caracteres indesejados da resposta da IA
    private String formatarTextoIA(String texto) {
        if (texto == null) return "";
        return texto.replace("**", "").replace("* ", "• ");
    }
}
