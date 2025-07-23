import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const generatePdf = async (element: HTMLElement, filename: string): Promise<void> => {
  const canvas = await html2canvas(element, {
    scale: 2, 
    useCORS: true,
    logging: true,
  });
  
  const imgData = canvas.toDataURL('image/png');
  
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'px',
    format: [canvas.width, canvas.height],
  });

  pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
  pdf.save(filename);
};
