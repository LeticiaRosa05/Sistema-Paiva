package com.paiva.service;

import org.springframework.stereotype.Service;
import com.lowagie.text.pdf.PdfWriter;
import java.io.ByteArrayOutputStream;
import com.paiva.model.Mensagem;
import com.paiva.model.Analise;
import com.lowagie.text.*;
import java.util.List;

@Service
public class RelatorioService {
    public byte[] gerarRelatorioPdf(Analise analise, List<Mensagem> historico) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4);

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Título do PDF gerado
            Font fontTitulo = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Paragraph titulo = new Paragraph("SISTEMA PAIVA - RELATÓRIO TÉCNICO PERICIAL", fontTitulo);
            titulo.setAlignment(Element.ALIGN_CENTER);
            document.add(titulo);

            document.add(new Paragraph(" ")); // Linha em branco

            // Adiciona os dados da análise
            document.add(new Paragraph("ID da Análise: " + analise.getId()));
            document.add(new Paragraph("Perito responsável: " + analise.getUsuario().getNome()));
            document.add(new Paragraph("-----------------------------------------------------------------------"));

            // Laudo de origem do chat
            document.add(new Paragraph("Laudo técnico original: ", FontFactory.getFont(FontFactory.HELVETICA_BOLD)));
            document.add(new Paragraph(analise.getAnalise_IA()));

            document.add(new Paragraph(" "));

            // Histórico do chat
            if (!historico.isEmpty()) {
                document.add(new Paragraph("Detalhamento e questionamentos: ", FontFactory.getFont(FontFactory.HELVETICA_BOLD)));
                for (Mensagem msg : historico) {
                    String prefixo = msg.getOrigemRemetente().equals("user") ? "Pergunta": "Resposta da IA: ";
                    document.add(new Paragraph(prefixo + msg.getTexto_mensagem()));
                }
            }
            document.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return out.toByteArray();
    }
}
