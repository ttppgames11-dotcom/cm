import fs from 'fs';
import path from 'path';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  PageBreak,
  Header,
  Footer,
  PageNumber,
  ShadingType
} from 'docx';

console.log('Starting Connect Maratha 50-Page Master Document Generator...');

// Color Constants
const COLOR_MAROON = '3D0D0D';
const COLOR_SAFFRON = 'EA580C';
const COLOR_DEEP_ORANGE = 'C2410C';
const COLOR_GOLD = 'B45309';
const COLOR_DARK = '1F2937';
const COLOR_MUTED = '4B5563';
const COLOR_LIGHT_BG = 'FFF7ED';
const COLOR_ALT_ROW = 'FFFDF9';
const COLOR_BORDER = 'FED7AA';

// Helper: Paragraph Creator
function p(text, opts = {}) {
  return new Paragraph({
    alignment: opts.align || AlignmentType.LEFT,
    spacing: {
      before: opts.before ?? 60,
      after: opts.after ?? 120,
      line: opts.line ?? 276 // 1.15 line spacing
    },
    children: [
      new TextRun({
        text,
        font: 'Segoe UI',
        size: opts.size || 22, // 11pt default (size is half-points)
        bold: opts.bold || false,
        italics: opts.italics || false,
        color: opts.color || COLOR_DARK
      })
    ]
  });
}

// Helper: Rich Paragraph with multiple text runs
function pRuns(runs, opts = {}) {
  return new Paragraph({
    alignment: opts.align || AlignmentType.LEFT,
    spacing: {
      before: opts.before ?? 60,
      after: opts.after ?? 120,
      line: opts.line ?? 276
    },
    children: runs.map(r => new TextRun({
      text: r.text,
      font: 'Segoe UI',
      size: r.size || 22,
      bold: r.bold || false,
      italics: r.italics || false,
      color: r.color || COLOR_DARK
    }))
  });
}

// Helper: Bullet Point
function bullet(text, boldPrefix = '') {
  const children = [];
  if (boldPrefix) {
    children.push(new TextRun({
      text: boldPrefix + ' ',
      font: 'Segoe UI',
      size: 22,
      bold: true,
      color: COLOR_DEEP_ORANGE
    }));
  }
  children.push(new TextRun({
    text,
    font: 'Segoe UI',
    size: 22,
    color: COLOR_DARK
  }));

  return new Paragraph({
    bullet: { level: 0 },
    spacing: { before: 40, after: 60, line: 260 },
    children
  });
}

// Helper: Headings
function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 160 },
    children: [
      new TextRun({
        text,
        font: 'Segoe UI',
        size: 34, // 17pt
        bold: true,
        color: COLOR_MAROON
      })
    ]
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 260, after: 120 },
    children: [
      new TextRun({
        text,
        font: 'Segoe UI',
        size: 28, // 14pt
        bold: true,
        color: COLOR_SAFFRON
      })
    ]
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 180, after: 80 },
    children: [
      new TextRun({
        text,
        font: 'Segoe UI',
        size: 24, // 12pt
        bold: true,
        color: COLOR_GOLD
      })
    ]
  });
}

// Helper: Callout Highlight Box
function callout(title, text) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.SINGLE, size: 36, color: COLOR_SAFFRON }
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { fill: COLOR_LIGHT_BG, type: ShadingType.CLEAR },
            margins: { top: 140, bottom: 140, left: 200, right: 140 },
            children: [
              new Paragraph({
                spacing: { before: 0, after: 60 },
                children: [
                  new TextRun({
                    text: '🚩 ' + title,
                    font: 'Segoe UI',
                    size: 22,
                    bold: true,
                    color: COLOR_MAROON
                  })
                ]
              }),
              new Paragraph({
                spacing: { before: 0, after: 0 },
                children: [
                  new TextRun({
                    text,
                    font: 'Segoe UI',
                    size: 21,
                    italics: true,
                    color: COLOR_DARK
                  })
                ]
              })
            ]
          })
        ]
      })
    ]
  });
}

// Helper: Table Generator
function createTable(headers, rows, colWidths = []) {
  const tableRows = [];

  // Header Row
  tableRows.push(new TableRow({
    tableHeader: true,
    children: headers.map((h, i) => new TableCell({
      width: colWidths[i] ? { size: colWidths[i], type: WidthType.PERCENTAGE } : undefined,
      shading: { fill: COLOR_MAROON, type: ShadingType.CLEAR },
      margins: { top: 120, bottom: 120, left: 120, right: 120 },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: h,
              font: 'Segoe UI',
              size: 20,
              bold: true,
              color: 'FFFFFF'
            })
          ]
        })
      ]
    }))
  }));

  // Data Rows
  rows.forEach((r, rowIdx) => {
    const isAlt = rowIdx % 2 === 1;
    tableRows.push(new TableRow({
      children: r.map((cellText, cellIdx) => new TableCell({
        width: colWidths[cellIdx] ? { size: colWidths[cellIdx], type: WidthType.PERCENTAGE } : undefined,
        shading: { fill: isAlt ? COLOR_ALT_ROW : 'FFFFFF', type: ShadingType.CLEAR },
        margins: { top: 90, bottom: 90, left: 100, right: 100 },
        children: [
          new Paragraph({
            alignment: cellIdx === 0 ? AlignmentType.LEFT : AlignmentType.LEFT,
            children: [
              new TextRun({
                text: String(cellText),
                font: 'Segoe UI',
                size: 19,
                color: COLOR_DARK
              })
            ]
          })
        ]
      }))
    }));
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
      left: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
      right: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: 'F3F4F6' },
      insideVertical: { style: BorderStyle.SINGLE, size: 4, color: 'F3F4F6' }
    },
    rows: tableRows
  });
}

function pageBreak() {
  return new Paragraph({
    children: [new PageBreak()]
  });
}

export {
  p,
  pRuns,
  bullet,
  h1,
  h2,
  h3,
  callout,
  createTable,
  pageBreak,
  COLOR_MAROON,
  COLOR_SAFFRON,
  COLOR_DEEP_ORANGE,
  COLOR_GOLD,
  COLOR_DARK,
  COLOR_MUTED
};
