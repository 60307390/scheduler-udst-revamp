import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";


// export async function exportDivToPDF(element: HTMLElement, fileName: string) {
//     if (!element) throw new Error(`Element does not exist`);
//
//     await document.fonts.ready;
//     await new Promise(resolve => setTimeout(resolve, 100));
//
//     // Specifically target header elements and force white background
//     const headerElements = element.querySelectorAll('.header');
//     const originalStyles: {el: HTMLElement, original: string}[] = [];
//
//     // Store and override header styles
//     headerElements.forEach(el => {
//         const htmlEl = el as HTMLElement;
//         originalStyles.push({
//             el: htmlEl,
//             original: htmlEl.style.cssText
//         });
//
//         // Force white background and black text on headers
//         htmlEl.style.cssText += '; background-color: white !important; color: black !important;';
//     });
//
//     try {
//         const canvas = await html2canvas(element, {
//             scale: 2,
//             useCORS: false, // This prevents the CSS access errors
//             logging: false,
//             backgroundColor: '#ffffff',
//             allowTaint: true,
//         });
//
//         // Calculate PDF dimensions
//         const imgData = canvas.toDataURL('image/png');
//         const imgWidth = canvas.width / 2;
//         const imgHeight = canvas.height / 2;
//         const pdfWidth = imgWidth > 210 ? 210 : imgWidth;
//         const pdfHeight = (imgHeight * pdfWidth) / imgWidth;
//
//         // Create PDF
//         const pdf = new jsPDF({
//             orientation: pdfHeight > pdfWidth ? 'portrait' : 'landscape',
//             unit: 'mm',
//             format: [pdfWidth, pdfHeight],
//         });
//
//         pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
//         pdf.save(`${fileName}.pdf`);
//
//     } finally {
//         // Restore original styles
//         originalStyles.forEach(({el, original}) => {
//             el.style.cssText = original;
//         });
//     }
// }

export async function exportDivToPDF(element: HTMLElement, fileName: string) {
    if (!element)
        throw new Error(`Element does not exist`);

    await document.fonts.ready;
    await new Promise(resolve => setTimeout(resolve, 100));

    const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: false,
        logging: false,
        backgroundColor: '#ffffff',
        allowTaint: true,
        // Skip CSS rule processing entirely
        ignoreElements: () => false,
        // Use a simpler rendering approach
        foreignObjectRendering: false,
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
