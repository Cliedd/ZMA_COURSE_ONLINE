package com.ztf.zma.payment.service;

import com.ztf.zma.payment.domain.Payment;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;

/** Generates a one-page PDF receipt for a confirmed payment. */
@Service
public class InvoicePdfService {

    private static final DateTimeFormatter DATE_FORMAT =
            DateTimeFormatter.ofPattern("dd MMMM yyyy 'à' HH:mm").withZone(ZoneOffset.UTC);

    public byte[] generate(Payment payment) {
        try (PDDocument doc = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.A4);
            doc.addPage(page);

            var regular = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
            var bold = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);

            try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                float margin = 60;
                float y = page.getMediaBox().getHeight() - 80;

                writeLine(cs, bold, 20, margin, y, "ZTF Music Academy");
                y -= 22;
                writeLine(cs, regular, 10, margin, y, "Reçu de paiement");
                y -= 40;

                writeLine(cs, bold, 12, margin, y, "Facture " + safe(payment.getId()));
                y -= 30;

                y = field(cs, regular, margin, y, "Étudiant", safe(payment.getStudentId()));
                y = field(cs, regular, margin, y, "Cours", safe(payment.getCourseTitle()));
                y = field(cs, regular, margin, y, "Enseignant", safe(payment.getTeacherEmail()));
                y = field(cs, regular, margin, y, "Référence transaction", safe(payment.getTransactionId()));
                y = field(cs, regular, margin, y, "Statut", safe(payment.getStatus()));
                y = field(cs, regular, margin, y, "Date de confirmation",
                        payment.getConfirmedAt() != null ? DATE_FORMAT.format(payment.getConfirmedAt()) : "—");
                y -= 20;

                writeLine(cs, bold, 16, margin, y,
                        String.format("Montant payé : %.2f %s", payment.getAmount(), payment.getCurrency()));
                y -= 60;

                writeLine(cs, regular, 8, margin, y,
                        "Ce reçu est généré automatiquement et fait foi de paiement pour le cours mentionné ci-dessus.");
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            doc.save(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new UncheckedIOException("Failed to generate invoice PDF for payment " + payment.getId(), e);
        }
    }

    private float field(PDPageContentStream cs, PDType1Font font, float x, float y, String label, String value) throws IOException {
        writeLine(cs, font, 11, x, y, label + " : " + value);
        return y - 20;
    }

    private void writeLine(PDPageContentStream cs, PDType1Font font, float size, float x, float y, String text) throws IOException {
        cs.beginText();
        cs.setFont(font, size);
        cs.newLineAtOffset(x, y);
        cs.showText(text);
        cs.endText();
    }

    private String safe(String value) {
        return value != null && !value.isBlank() ? value : "—";
    }
}
