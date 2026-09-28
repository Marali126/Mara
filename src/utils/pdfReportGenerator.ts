import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SessaoTreino, PerfilAluno, EstatisticasProgresso } from '../types';

export function calcularEstatisticas(sessoes: SessaoTreino[]): EstatisticasProgresso {
  if (sessoes.length === 0) {
    return {
      totalSessoes: 0,
      totalPalavras: 0,
      tempoTotalSegundos: 0,
      mediaPPM: 0,
      mediaFlesch: 0,
      taxaConclusao: 0,
      distribuicaoNiveis: {}
    };
  }

  const totalSessoes = sessoes.length;
  const totalPalavras = sessoes.reduce((acc, s) => acc + (s.totalPalavras || 0), 0);
  const tempoTotalSegundos = sessoes.reduce((acc, s) => acc + (s.tempoSegundos || 0), 0);
  const mediaPPM = Math.round(sessoes.reduce((acc, s) => acc + (s.velocidadePPM || 0), 0) / totalSessoes);
  const mediaFlesch = Math.round(sessoes.reduce((acc, s) => acc + (s.flesch || 50), 0) / totalSessoes);
  const concluidas = sessoes.filter((s) => s.concluida).length;
  const taxaConclusao = Math.round((concluidas / totalSessoes) * 100);

  const distribuicaoNiveis: Record<string, number> = {};
  for (const s of sessoes) {
    const nivel = s.nivel || 'Outro';
    distribuicaoNiveis[nivel] = (distribuicaoNiveis[nivel] || 0) + 1;
  }

  return {
    totalSessoes,
    totalPalavras,
    tempoTotalSegundos,
    mediaPPM,
    mediaFlesch,
    taxaConclusao,
    distribuicaoNiveis
  };
}

export interface GerarPdfOptions {
  perfil: PerfilAluno;
  sessoes: SessaoTreino[];
  logoBase64?: string | null;
  incluirAssinatura?: boolean;
}

export function gerarRelatorioPDF(options: GerarPdfOptions): jsPDF {
  const { perfil, sessoes, logoBase64, incluirAssinatura = true } = options;
  const stats = calcularEstatisticas(sessoes);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  let currentY = margin;

  // ----------------------------------------------------
  // CABEÇALHO DO DOCUMENTO
  // ----------------------------------------------------
  // Barra superior decorativa
  doc.setFillColor(30, 41, 59); // Slate-800
  doc.rect(margin, currentY, contentWidth, 3, 'F');
  currentY += 6;

  // Se houver logo, desenha
  let headerTextStartX = margin;
  if (logoBase64 && logoBase64.startsWith('data:image')) {
    try {
      const logoW = 32;
      const logoH = 18;
      doc.addImage(logoBase64, 'JPEG', margin, currentY, logoW, logoH, undefined, 'FAST');
      headerTextStartX = margin + logoW + 6;
    } catch {
      // Ignora erro de formato de imagem
      headerTextStartX = margin;
    }
  }

  // Título e Subtítulo
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42); // Slate-900
  doc.text('RELATÓRIO DE EVOLUÇÃO EM FLUÊNCIA VERBAL', headerTextStartX, currentY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.text(
    'Treino de Prosódia Sintática, Ritmo Leitor e Decodificação Automatizada',
    headerTextStartX,
    currentY + 10
  );

  const dataEmissao = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  doc.setFontSize(8);
  doc.text(`Data de Emissão: ${dataEmissao}  |  Doc ID: FL-${Date.now().toString().slice(-6)}`, headerTextStartX, currentY + 15);

  currentY = Math.max(currentY + 22, currentY + 18);

  // Linha divisória
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.setLineWidth(0.4);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 5;

  // ----------------------------------------------------
  // SEÇÃO 1: IDENTIFICAÇÃO DO ALUNO / PACIENTE
  // ----------------------------------------------------
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.setDrawColor(203, 213, 225); // Slate-300
  doc.roundedRect(margin, currentY, contentWidth, 23, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text('DADOS DO ALUNO E PROFISSIONAL RESPONSÁVEL', margin + 4, currentY + 5.5);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);

  const col1X = margin + 4;
  const col2X = margin + 68;
  const col3X = margin + 128;

  // Linha 1 de dados
  doc.text(`Aluno(a): `, col1X, currentY + 11);
  doc.setFont('helvetica', 'bold');
  doc.text(perfil.nome || 'Não informado', col1X + 14, currentY + 11);

  doc.setFont('helvetica', 'normal');
  doc.text(`Série/Turma: `, col2X, currentY + 11);
  doc.setFont('helvetica', 'bold');
  doc.text(perfil.anoEscolar || 'Não informado', col2X + 19, currentY + 11);

  doc.setFont('helvetica', 'normal');
  doc.text(`Meta de Fluência: `, col3X, currentY + 11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(180, 83, 9); // Amber-700
  doc.text(`${perfil.metaPPM || 110} PPM`, col3X + 26, currentY + 11);

  // Linha 2 de dados
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'normal');
  doc.text(`Instituição: `, col1X, currentY + 17);
  doc.setFont('helvetica', 'bold');
  doc.text(perfil.escola || 'Não informado', col1X + 16, currentY + 17);

  doc.setFont('helvetica', 'normal');
  doc.text(`Avaliador(a): `, col2X, currentY + 17);
  doc.setFont('helvetica', 'bold');
  doc.text(perfil.avaliador || 'Não informado', col2X + 19, currentY + 17);

  doc.setFont('helvetica', 'normal');
  doc.text(`Data de Início: `, col3X, currentY + 17);
  doc.setFont('helvetica', 'bold');
  doc.text(perfil.dataInicio || dataEmissao, col3X + 20, currentY + 17);

  currentY += 27;

  // ----------------------------------------------------
  // SEÇÃO 2: QUADRO DE INDICADORES GLOBAIS DE DESEMPENHO (KPIs)
  // ----------------------------------------------------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text('INDICADORES DE DESEMPENHO EM LEITURA', margin, currentY);
  currentY += 3;

  const cardW = (contentWidth - 12) / 4;
  const cardH = 17;

  const kpis = [
    {
      titulo: 'Sessões Concluídas',
      valor: `${stats.totalSessoes}`,
      sub: `${stats.taxaConclusao}% taxa de término`,
      bg: [238, 242, 255], // Indigo-50
      border: [199, 210, 254],
      color: [67, 56, 202]
    },
    {
      titulo: 'Total de Palavras',
      valor: `${stats.totalPalavras.toLocaleString('pt-BR')}`,
      sub: `~${Math.round(stats.tempoTotalSegundos / 60)} min de prática`,
      bg: [240, 253, 244], // Emerald-50
      border: [187, 247, 208],
      color: [21, 128, 61]
    },
    {
      titulo: 'Velocidade Média',
      valor: `${stats.mediaPPM} PPM`,
      sub: `Meta: ${perfil.metaPPM || 110} PPM (${stats.mediaPPM >= (perfil.metaPPM || 110) ? 'Alcançada ✓' : 'Em treino'})`,
      bg: [254, 243, 199], // Amber-50
      border: [253, 230, 138],
      color: [180, 83, 9]
    },
    {
      titulo: 'Complexidade Flesch',
      valor: `${stats.mediaFlesch}/100`,
      sub: stats.mediaFlesch >= 75 ? 'Muito Fácil' : stats.mediaFlesch >= 60 ? 'Fácil/Médio' : 'Intermediário/Difícil',
      bg: [245, 243, 255], // Purple-50
      border: [221, 214, 254],
      color: [109, 40, 217]
    }
  ];

  kpis.forEach((kpi, idx) => {
    const kpiX = margin + idx * (cardW + 4);
    doc.setFillColor(kpi.bg[0], kpi.bg[1], kpi.bg[2]);
    doc.setDrawColor(kpi.border[0], kpi.border[1], kpi.border[2]);
    doc.roundedRect(kpiX, currentY, cardW, cardH, 2, 2, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(kpi.titulo, kpiX + 3, currentY + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
    doc.text(kpi.valor, kpiX + 3, currentY + 10.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.sub, kpiX + 3, currentY + 14.5);
  });

  currentY += cardH + 6;

  // ----------------------------------------------------
  // SEÇÃO 3: DISTRIBUIÇÃO POR NÍVEL ESCOLAR
  // ----------------------------------------------------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text('DISTRIBUIÇÃO DOS TEXTOS PRATICADOS POR ETAPA ESCOLAR', margin, currentY);
  currentY += 3;

  const niveisEsperados = [
    { label: 'Muito Fácil (1º-2º ano)', key: 'Muito Fácil' },
    { label: 'Fácil (3º-4º ano)', key: 'Fácil' },
    { label: 'Intermediário (5º-6º ano)', key: 'Intermediário' },
    { label: 'Avançado (7º-9º ano)', key: 'Avançado' },
    { label: 'Ensino Médio', key: 'Ensino Médio' }
  ];

  const nivelCols = niveisEsperados.length;
  const nivelW = (contentWidth - (nivelCols - 1) * 3) / nivelCols;

  niveisEsperados.forEach((item, idx) => {
    const nX = margin + idx * (nivelW + 3);
    const count = stats.distribuicaoNiveis[item.key] || 0;
    const pct = stats.totalSessoes > 0 ? Math.round((count / stats.totalSessoes) * 100) : 0;

    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(nX, currentY, nivelW, 11, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(30, 41, 59);
    doc.text(item.key, nX + 2.5, currentY + 4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`${count} texto${count !== 1 ? 's' : ''} (${pct}%)`, nX + 2.5, currentY + 8);
  });

  currentY += 16;

  // ----------------------------------------------------
  // SEÇÃO 4: HISTÓRICO DE SESSÕES (TABELA AUTOTABLE)
  // ----------------------------------------------------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text('HISTÓRICO CRONOLÓGICO DE LEITURAS E DESEMPENHO', margin, currentY);
  currentY += 2;

  const tableBody = sessoes.map((s, idx) => {
    const dataFormatada = new Date(s.dataHora).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });

    const minutos = Math.floor(s.tempoSegundos / 60);
    const segundos = s.tempoSegundos % 60;
    const tempoStr = minutos > 0 ? `${minutos}m ${segundos}s` : `${segundos}s`;

    return [
      `#${sessoes.length - idx}`,
      dataFormatada,
      s.textoTitulo,
      s.nivel,
      `${s.totalPalavras}`,
      tempoStr,
      `${s.velocidadePPM} PPM`,
      s.modo === 'modelar' ? 'Áudio/Modelar' : 'Silencioso',
      s.concluida ? 'Concluída ✓' : 'Parcial'
    ];
  });

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['#', 'Data / Hora', 'Título do Texto', 'Nível', 'Palavras', 'Tempo', 'PPM', 'Modo', 'Status']],
    body: tableBody,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 7.2,
      cellPadding: 1.8,
      overflow: 'linebreak',
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.1
    },
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'left',
      fontSize: 7.5
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 23 },
      2: { cellWidth: 46, fontStyle: 'bold' },
      3: { cellWidth: 23 },
      4: { cellWidth: 14, halign: 'center' },
      5: { cellWidth: 15, halign: 'center' },
      6: { cellWidth: 17, halign: 'center', fontStyle: 'bold' },
      7: { cellWidth: 20 },
      8: { cellWidth: 16, halign: 'center' }
    }
  });

  // Pega a posição vertical após a tabela
  const finalY = (doc as any).lastAutoTable?.finalY || currentY + 30;
  let postTableY = finalY + 6;

  // Se ultrapassar o limite da página, adiciona nova página
  if (postTableY > pageHeight - 55) {
    doc.addPage();
    postTableY = margin + 5;
  }

  // ----------------------------------------------------
  // SEÇÃO 5: ANÁLISE QUALITATIVA & PARECER PEDAGÓGICO
  // ----------------------------------------------------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text('ANÁLISE QUALITATIVA E PARECER PEDAGÓGICO / CLÍNICO', margin, postTableY);
  postTableY += 3;

  // Gera síntese diagnóstica automatizada
  let diagnosticoAuto = '';
  if (sessoes.length >= 2) {
    const primeira = sessoes[sessoes.length - 1];
    const ultima = sessoes[0];
    const deltaPPM = ultima.velocidadePPM - primeira.velocidadePPM;
    const sinal = deltaPPM >= 0 ? `+${deltaPPM}` : `${deltaPPM}`;
    diagnosticoAuto = `O histórico registra evolução de ${primeira.velocidadePPM} PPM para ${ultima.velocidadePPM} PPM (${sinal} PPM de variação). O treino com pausas nos pontos e segmentação sintática em blocos reforçou a prosódia natural e o ritmo leitor expressivo.`;
  } else {
    diagnosticoAuto = `Registro inicial de sessão estabelecendo linha de base com ${stats.mediaPPM} PPM em textos de complexidade média Flesch ${stats.mediaFlesch}/100.`;
  }

  const parecerCompleto = perfil.observacoesGerais?.trim()
    ? `${diagnosticoAuto}\n\nObservações Adicionais do Avaliador:\n${perfil.observacoesGerais.trim()}`
    : `${diagnosticoAuto}\n\nRecomenda-se prosseguir com a leitura em fatiamento sintático e elevar gradualmente a complexidade textual para consolidação da automação leitora.`;

  const boxHeight = 24;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, postTableY, contentWidth, boxHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  const splitParecer = doc.splitTextToSize(parecerCompleto, contentWidth - 8);
  doc.text(splitParecer, margin + 4, postTableY + 5);

  postTableY += boxHeight + 8;

  // ----------------------------------------------------
  // SEÇÃO 6: CAMPO DE ASSINATURA E REGISTRO PROFISSIONAL
  // ----------------------------------------------------
  if (incluirAssinatura) {
    if (postTableY > pageHeight - 35) {
      doc.addPage();
      postTableY = margin + 10;
    }

    const sigW = 80;
    const sigX = pageWidth / 2 - sigW / 2;

    doc.setDrawColor(100, 116, 139);
    doc.setLineWidth(0.3);
    doc.line(sigX, postTableY + 12, sigX + sigW, postTableY + 12);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text(perfil.avaliador || 'Assinatura do Profissional Responsável', pageWidth / 2, postTableY + 16, {
      align: 'center'
    });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(
      'Fonoaudiologia / Psicopedagogia / Coordenação Pedagógica',
      pageWidth / 2,
      postTableY + 19.5,
      { align: 'center' }
    );
  }

  // ----------------------------------------------------
  // RODAPÉ EM TODAS AS PÁGINAS COM NUMERAÇÃO
  // ----------------------------------------------------
  const totalPaginas = doc.getNumberOfPages();
  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184); // Slate-400

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(margin, pageHeight - 9, pageWidth - margin, pageHeight - 9);

    doc.text(
      'Treino de Fluência Verbal & Prosódia Sintática  •  Relatório Técnico de Progresso',
      margin,
      pageHeight - 5
    );
    doc.text(`Página ${i} de ${totalPaginas}`, pageWidth - margin, pageHeight - 5, { align: 'right' });
  }

  return doc;
}
