import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export async function exportDivToPDF(element: HTMLElement, fileName: string) {
    if (!element) throw new Error(`Element does not exist`);
    
    // Store original styles
    const originalStyles = new Map();
    const allElements = element.querySelectorAll('*');
    
    // Force white background on everything temporarily
    allElements.forEach((el, index) => {
        const htmlEl = el as HTMLElement;
        originalStyles.set(index, {
            backgroundColor: htmlEl.style.backgroundColor,
            color: htmlEl.style.color,
        });
        htmlEl.style.backgroundColor = 'white';
        htmlEl.style.color = 'black';
    });
    
    await document.fonts.ready;
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: true,
        backgroundColor: '#ffffff',
    });
    
    // Restore original styles
    allElements.forEach((el, index) => {
        const htmlEl = el as HTMLElement;
        const original = originalStyles.get(index);
        htmlEl.style.backgroundColor = original.backgroundColor;
        htmlEl.style.color = original.color;
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

// export async function exportDivToPDF(element: HTMLElement, fileName: string) {
//     if (!element)
//         throw new Error(`Element does not exist`);
//
//     await document.fonts.ready;
//
//     await new Promise(resolve => setTimeout(resolve, 100));
//
//     // Clone element to isolate styles
//     // Capture div as image
//     const canvas = await html2canvas(element, {
//         scale: 2, // Higher quality
//         useCORS: true, // For external resources
//         logging: false, // Disable console logs
//         backgroundColor: "#ffffff",
//         allowTaint: true,
//         foreignObjectRendering: false, // Try toggling this
//         imageTimeout: 15000, // Increase timeout
//         removeContainer: true,
//     });
//
//     // Calculate PDF dimensions
//     const imgData = canvas.toDataURL('image/png');
//     const imgWidth = canvas.width / 2; // Half scale for PDF
//     const imgHeight = canvas.height / 2;
//     const pdfWidth = imgWidth > 210 ? 210 : imgWidth; // A4 max width (210mm)
//     const pdfHeight = (imgHeight * pdfWidth) / imgWidth;
//
//     // Create PDF
//     const pdf = new jsPDF({
//         orientation: pdfHeight > pdfWidth ? 'portrait' : 'landscape',
//         unit: 'mm',
//         format: [pdfWidth, pdfHeight],
//     });
//
//     pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
//     pdf.save(`${fileName}.pdf`);
// }
