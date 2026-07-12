import { jsPDF } from "jspdf";
import { SongAnalysis } from "../types";

/**
 * Generates a beautiful study guide PDF containing side-by-side translated lyrics
 * and the complete vocabulary glossary.
 */
export function generateSongPDF(song: SongAnalysis): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);

  // Helper: Draw header banner
  function drawHeader(titleStr: string, subtitleStr: string) {
    doc.setFillColor(30, 41, 59); // Slate-800
    doc.rect(0, 0, pageWidth, 40, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("Learn English with Music", margin, 15);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(226, 232, 240); // Slate-200
    doc.text(`Study Guide: ${titleStr} - ${subtitleStr}`, margin, 24);
    doc.text(`Difficulty: ${song.difficulty}  |  Genre: ${song.genre}`, margin, 30);
  }

  let y = 50;

  // Draw Page 1 Header
  drawHeader(song.title, song.artist);

  // Summary section
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.rect(margin, y, contentWidth, 22, "FD");

  doc.setTextColor(51, 65, 85); // Slate-700
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("SÉLECTION & THÉMATIQUE DE LA CHANSON :", margin + 5, y + 6);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105); // Slate-600
  const splitSummary = doc.splitTextToSize(song.summary, contentWidth - 10);
  doc.text(splitSummary, margin + 5, y + 12);

  y += 32;

  // Side-by-side lyrics header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42); // Slate-900
  doc.text("Paroles & Traduction (Side-by-Side)", margin, y);
  
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.5);
  doc.line(margin, y + 2, pageWidth - margin, y + 2);
  y += 10;

  // Render sections
  song.lyricsSections.forEach((section) => {
    // Check page overflow
    if (y > pageHeight - 30) {
      doc.addPage();
      drawHeader(song.title, song.artist);
      y = 50;
    }

    // Section Type Header (e.g. Chorus)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(220, 38, 38); // Red-600
    doc.text(`[${section.sectionType}]`, margin, y);
    y += 6;

    // Render lines side by side
    section.lines.forEach((line) => {
      if (y > pageHeight - 20) {
        doc.addPage();
        drawHeader(song.title, song.artist);
        y = 50;
        // Repeat section header context
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(220, 38, 38);
        doc.text(`[${section.sectionType} - Suite]`, margin, y);
        y += 6;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42); // Slate-900
      
      const leftColX = margin;
      const rightColX = margin + (contentWidth / 2) + 4;
      const colWidth = (contentWidth / 2) - 4;

      const splitEnglish = doc.splitTextToSize(line.english, colWidth);
      const splitFrench = doc.splitTextToSize(line.french, colWidth);
      const maxLines = Math.max(splitEnglish.length, splitFrench.length);

      doc.text(splitEnglish, leftColX, y);
      
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139); // Slate-500
      doc.text(splitFrench, rightColX, y);

      y += (maxLines * 4.5) + 1.5;
    });

    y += 5; // space between sections
  });

  // VOCABULARY SECTION (Force to a new page)
  doc.addPage();
  drawHeader(song.title, song.artist);
  y = 50;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text("Dictionnaire d'Expressions & Vocabulaire", margin, y);
  
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.5);
  doc.line(margin, y + 2, pageWidth - margin, y + 2);
  y += 10;

  song.explanations.forEach((item, index) => {
    if (y > pageHeight - 45) {
      doc.addPage();
      drawHeader(song.title, song.artist);
      y = 50;
    }

    // Card background for word
    doc.setFillColor(241, 245, 249); // Slate-100
    doc.rect(margin, y, contentWidth, 30, "F");

    // Left border indicating category
    let categoryColor = [59, 130, 246]; // Blue for vocab
    if (item.type === "idiom") categoryColor = [168, 85, 247]; // Purple
    if (item.type === "slang") categoryColor = [234, 179, 8]; // Yellow
    if (item.type === "grammar") categoryColor = [16, 185, 129]; // Green
    if (item.type === "phrasal_verb") categoryColor = [239, 68, 68]; // Red

    doc.setFillColor(categoryColor[0], categoryColor[1], categoryColor[2]);
    doc.rect(margin, y, 2.5, 30, "F");

    // Title / Type
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(`${item.term}  =  "${item.meaningFr}"`, margin + 6, y + 6);

    doc.setFillColor(226, 232, 240);
    doc.rect(margin + 6, y + 8, 25, 4, "F");
    doc.setTextColor(71, 85, 105);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text(item.type.toUpperCase().replace("_", " "), margin + 8, y + 11);

    // Explanation
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    const splitExplanation = doc.splitTextToSize(item.explanation, contentWidth - 12);
    doc.text(splitExplanation, margin + 6, y + 16);

    // Example
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Exemple d'usage : "${item.example}"`, margin + 6, y + 25);

    y += 35;
  });

  // Footer on all pages
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // Slate-400
    doc.text(`Page ${i} sur ${totalPages}`, pageWidth - margin - 15, pageHeight - 8);
    doc.text("Apprentissage de l'anglais en musique - Propulsé par Gemini AI Studio", margin, pageHeight - 8);
  }

  doc.save(`LyricLingo_Etude_${song.title.replace(/\s+/g, "_")}.pdf`);
}

/**
 * Generates a beautiful Certificate of Course Completion PDF
 */
export function generateCertificatePDF(studentName: string, songTitle: string, artistName: string, score: number): void {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Background cream color
  doc.setFillColor(253, 251, 247);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Multi-layered elegant border
  doc.setDrawColor(30, 41, 59); // Slate-800
  doc.setLineWidth(1.5);
  doc.rect(8, 8, pageWidth - 16, pageHeight - 16);

  doc.setDrawColor(202, 138, 4); // Gold-600
  doc.setLineWidth(0.6);
  doc.rect(11, 11, pageWidth - 22, pageHeight - 22);

  // Corners decors
  const corners = [
    [11, 11], [pageWidth - 11, 11], [11, pageHeight - 11], [pageWidth - 11, pageHeight - 11]
  ];
  doc.setFillColor(202, 138, 4);
  corners.forEach(([cx, cy]) => {
    doc.circle(cx, cy, 2, "F");
  });

  // Certificate Header
  doc.setTextColor(30, 41, 59);
  doc.setFont("times", "bolditalic");
  doc.setFontSize(32);
  doc.text("CERTIFICAT DE RÉUSSITE", pageWidth / 2, 38, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(71, 85, 105);
  doc.text("Ce diplôme d'anglais musical est fièrement décerné à", pageWidth / 2, 52, { align: "center" });

  // Student Name
  doc.setTextColor(220, 38, 38); // Crimson red
  doc.setFont("times", "bold");
  doc.setFontSize(28);
  doc.text(studentName.toUpperCase(), pageWidth / 2, 68, { align: "center" });

  // Divider line
  doc.setDrawColor(202, 138, 4);
  doc.setLineWidth(0.8);
  doc.line(pageWidth / 2 - 60, 74, pageWidth / 2 + 60, 74);

  // Body text
  doc.setTextColor(30, 41, 59);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const textBody = `Pour avoir complété avec succès le cours d'anglais intensif basé sur la chanson d'apprentissage\n` +
    `"${songTitle}" par l'artiste ${artistName}.\n\n` +
    `L'élève a validé l'analyse approfondie des paroles, la compréhension critique en Live Mode\n` +
    `et a obtenu la note finale d'excellence de :`;
  doc.text(textBody, pageWidth / 2, 85, { align: "center" });

  // Score
  doc.setTextColor(16, 185, 129); // Emerald-500
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(`${score} / 5 BONNES RÉPONSES (${Math.round((score / 5) * 100)}%)`, pageWidth / 2, 115, { align: "center" });

  // Badge/Stamp Design
  const badgeX = pageWidth / 2;
  const badgeY = 145;
  doc.setFillColor(254, 240, 138); // Yellow-100
  doc.setDrawColor(202, 138, 4);
  doc.setLineWidth(0.5);
  doc.circle(badgeX, badgeY, 14, "FD");
  doc.circle(badgeX, badgeY, 12.5, "D");

  doc.setTextColor(161, 98, 7); // Gold-800
  doc.setFont("times", "bold");
  doc.setFontSize(7.5);
  doc.text("EXCELLENCE", badgeX, badgeY - 2, { align: "center" });
  doc.setFontSize(6);
  doc.text("MUSIC & CO.", badgeX, badgeY + 1.5, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("★ ★ ★", badgeX, badgeY + 6, { align: "center" });

  // Signature lines
  const sigLineY = 160;
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.3);
  doc.line(marginToSigLeft(40), sigLineY, marginToSigLeft(90), sigLineY);
  doc.line(pageWidth - 90, sigLineY, pageWidth - 40, sigLineY);

  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8.5);
  doc.text("Professeur de Langue Gemini", 65, sigLineY + 5, { align: "center" });
  doc.text("Signature de l'Élève", pageWidth - 65, sigLineY + 5, { align: "center" });

  // Date
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(`Émis le : ${new Date().toLocaleDateString("fr-FR")}`, 15, pageHeight - 15);
  doc.text(`ID Certificat : LL-${Math.floor(100000 + Math.random() * 900000)}`, pageWidth - 45, pageHeight - 15);

  doc.save(`Certificat_LyricLingo_${studentName.replace(/\s+/g, "_")}.pdf`);
}

function marginToSigLeft(val: number): number {
  return val;
}
