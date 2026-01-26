// Declaraciones mínimas para evitar errores de TypeScript al usar pdfjs-dist
declare module 'pdfjs-dist/legacy/build/pdf' {
  const pdfjs: any;
  export = pdfjs;
}

declare module 'pdfjs-dist' {
  const pdfjs: any;
  export = pdfjs;
}
