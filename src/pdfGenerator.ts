import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export async function exportDivToPDF(element: HTMLElement, fileName: string) {
    if (!element)
        throw new Error(`Element does not exist`);

    // Clone element to isolate styles
    // Step 1: Create canvas for styling
    // Capture div as image
    const canvas = await html2canvas(element, {
        scale: 2, // Higher quality
        useCORS: true, // For external resources
        logging: false, // Disable console logs
    });

    // Calculate PDF dimensions
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = canvas.width / 2; // Half scale for PDF
    const imgHeight = canvas.height / 2;
    const pdfWidth = imgWidth > 210 ? 210 : imgWidth; // A4 max width (210mm)
    const pdfHeight = (imgHeight * pdfWidth) / imgWidth;

    // Create PDF
    const pdf = new jsPDF({
        orientation: pdfHeight > pdfWidth ? 'portrait' : 'landscape',
        unit: 'mm',
        format: [pdfWidth, pdfHeight],
    });

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${fileName}.pdf`);
}
