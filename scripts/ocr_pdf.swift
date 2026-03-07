import AppKit
import Foundation
import PDFKit
import Vision

enum OCRError: Error {
  case missingPath
  case openFailed
  case pageRenderFailed(Int)
}

func extractText(from pdfURL: URL) throws -> String {
  guard let document = PDFDocument(url: pdfURL) else {
    throw OCRError.openFailed
  }

  var allLines: [String] = []

  for pageIndex in 0..<document.pageCount {
    guard let page = document.page(at: pageIndex) else {
      continue
    }

    let image = page.thumbnail(of: NSSize(width: 1800, height: 2400), for: .mediaBox)
    var rect = CGRect(origin: .zero, size: image.size)

    guard let cgImage = image.cgImage(forProposedRect: &rect, context: nil, hints: nil) else {
      throw OCRError.pageRenderFailed(pageIndex)
    }

    let request = VNRecognizeTextRequest()
    request.recognitionLevel = .accurate
    request.usesLanguageCorrection = true

    let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
    try handler.perform([request])

    let pageLines = (request.results ?? [])
      .compactMap { $0.topCandidates(1).first?.string.trimmingCharacters(in: .whitespacesAndNewlines) }
      .filter { !$0.isEmpty }

    allLines.append(contentsOf: pageLines)
    allLines.append("\n--- PAGE BREAK ---\n")
  }

  return allLines.joined(separator: "\n")
}

guard CommandLine.arguments.count > 1 else {
  fputs("Missing PDF path\n", stderr)
  exit(1)
}

let pdfPath = CommandLine.arguments[1]
let pdfURL = URL(fileURLWithPath: pdfPath)

do {
  let text = try extractText(from: pdfURL)
  print(text)
} catch {
  fputs("OCR failed: \(error)\n", stderr)
  exit(1)
}
