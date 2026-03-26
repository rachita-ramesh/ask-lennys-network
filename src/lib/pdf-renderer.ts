import { PDFPageImage } from "./prd-types";
import path from "path";

interface PageResult {
  pageIndex: number;
  imageDataUrl: string;
  width: number;
  height: number;
  text: string;
}

/**
 * Render each page of a PDF as a JPEG image and extract text.
 * Uses pdfjs-dist (legacy) for rendering + node-canvas for the canvas.
 */
export async function renderPDFPages(
  buffer: Buffer,
  options: { scale?: number; maxPages?: number; quality?: number } = {}
): Promise<PageResult[]> {
  const { scale = 1.5, maxPages = 30, quality = 0.8 } = options;

  // Dynamic require to avoid bundling
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const canvasModule = require("canvas");
  const { createCanvas, Image } = canvasModule;

  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

  // Point to the worker file
  const workerPath = path.join(
    process.cwd(),
    "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs"
  );
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerPath;

  // Canvas factory with proper Image class support
  class NodeCanvasFactory {
    create(width: number, height: number) {
      const canvas = createCanvas(width, height);
      const context = canvas.getContext("2d");
      return { canvas, context };
    }
    reset(
      canvasAndContext: { canvas: any; context: any },
      width: number,
      height: number
    ) {
      canvasAndContext.canvas.width = width;
      canvasAndContext.canvas.height = height;
    }
    destroy(canvasAndContext: { canvas: any }) {
      canvasAndContext.canvas.width = 0;
      canvasAndContext.canvas.height = 0;
    }
  }

  const canvasFactory = new NodeCanvasFactory();

  // Load the PDF
  const uint8Array = new Uint8Array(buffer);
  const loadingTask = pdfjsLib.getDocument({
    data: uint8Array,
    useSystemFonts: true,
    isEvalSupported: false,
    // Provide the node-canvas Image class for image rendering
    CanvasFactory: NodeCanvasFactory,
  } as any);
  const pdfDocument = await loadingTask.promise;

  const numPages = Math.min(pdfDocument.numPages, maxPages);
  const results: PageResult[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdfDocument.getPage(i);
    const viewport = page.getViewport({ scale });

    const canvas = createCanvas(viewport.width, viewport.height);
    const context = canvas.getContext("2d");

    // Render — wrap in try/catch so we still get text even if rendering fails
    try {
      await page.render({
        canvasContext: context,
        viewport,
        canvasFactory,
      } as any).promise;
    } catch (renderErr: any) {
      // If image rendering fails, fill with white and add text note
      context.fillStyle = "#fff";
      context.fillRect(0, 0, viewport.width, viewport.height);
      context.fillStyle = "#999";
      context.font = "16px sans-serif";
      context.fillText(`Page ${i} — some elements could not be rendered`, 20, 30);
    }

    // Convert to JPEG
    const jpegBuffer = canvas.toBuffer("image/jpeg", { quality });
    const imageDataUrl = `data:image/jpeg;base64,${jpegBuffer.toString("base64")}`;

    // Extract text
    const textContent = await page.getTextContent();
    const text = textContent.items
      .map((item: any) => (item.str || "") + (item.hasEOL ? "\n" : ""))
      .join("");

    results.push({
      pageIndex: i - 1,
      imageDataUrl,
      width: viewport.width,
      height: viewport.height,
      text: text.trim(),
    });

    page.cleanup();
  }

  return results;
}
