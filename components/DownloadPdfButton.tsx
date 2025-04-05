import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import jsPDF from 'jspdf';

interface DownloadPdfButtonProps {
  content: string;
  filename?: string;
  disabled?: boolean;
}

const DownloadPdfButton = ({
  content,
  filename = 'lesson-plan.pdf',
  disabled = false
}: DownloadPdfButtonProps) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const processMarkdown = (text: string) => {
    // Remove markdown bold syntax for PDF (just keep the text)
    return text.replace(/\*\*(.*?)\*\*/g, '$1');
  };

  const handleDownload = () => {
    if (!content || disabled) return;
    
    setIsDownloading(true);
    
    try {
      // Create PDF document
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Set font size and style
      doc.setFontSize(12);
      
      // Split content by lines
      const lines = content.split('\n');
      
      let yPosition = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Process each line
      lines.forEach(line => {
        // Process any markdown in the line
        const processedLine = processMarkdown(line);
        
        // Handle headings with bigger font and bold
        if (processedLine.startsWith('# ')) {
          doc.setFontSize(18);
          doc.setFont('helvetica', 'bold');
          doc.text(processedLine.substring(2), pageWidth / 2, yPosition, { align: 'center' });
          yPosition += 10;
          doc.setFontSize(12);
          doc.setFont('helvetica', 'normal');
        } 
        else if (processedLine.startsWith('## ')) {
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text(processedLine.substring(3), 20, yPosition);
          yPosition += 8;
          doc.setFontSize(12);
          doc.setFont('helvetica', 'normal');
        }
        else if (processedLine.startsWith('### ')) {
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.text(processedLine.substring(4), 20, yPosition);
          yPosition += 7;
          doc.setFontSize(12);
          doc.setFont('helvetica', 'normal');
        }
        else if (processedLine.startsWith('- ')) {
          // Handle bullet points
          doc.text('•', 20, yPosition);
          doc.text(processedLine.substring(2), 25, yPosition);
          yPosition += 6;
        }
        else if (processedLine.trim() === '') {
          // Handle empty lines (spacing)
          yPosition += 3;
        }
        else {
          // Handle regular text
          const textWidth = pageWidth - 40; // 20mm margins on each side
          const splitText = doc.splitTextToSize(processedLine, textWidth);
          
          splitText.forEach((textLine: string) => {
            // Add new page if we're at the bottom
            if (yPosition > 270) {
              doc.addPage();
              yPosition = 20;
            }
            
            doc.text(textLine, 20, yPosition);
            yPosition += 6;
          });
        }
        
        // Add new page if we're near the bottom
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
      });
      
      // Save the PDF
      doc.save(filename);
      
      toast({
        title: "Download successful",
        description: "Your lesson plan has been downloaded as a PDF",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        variant: "destructive",
        title: "Download failed",
        description: "There was an error generating the PDF",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button 
      onClick={handleDownload} 
      disabled={disabled || isDownloading || !content}
      variant="outline"
      className="gap-2"
    >
      {isDownloading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating PDF...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          Download PDF
        </>
      )}
    </Button>
  );
};

export default DownloadPdfButton;
