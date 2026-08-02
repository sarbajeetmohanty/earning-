import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.js?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export const parseTransactionPDF = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let allTransactions = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Group items by Y coordinate (rows)
      const rows = {};
      textContent.items.forEach((item) => {
        // y-coordinate is roughly item.transform[5]. 
        // We round it to avoid floating point inconsistencies
        const y = Math.round(item.transform[5]); 
        if (!rows[y]) {
          rows[y] = [];
        }
        rows[y].push(item);
      });

      // Sort rows by Y coordinate descending (top to bottom on page)
      const sortedY = Object.keys(rows).sort((a, b) => Number(b) - Number(a));

      for (let y of sortedY) {
        const rowItems = rows[y];
        // Sort items in a row by X coordinate (left to right)
        rowItems.sort((a, b) => a.transform[4] - b.transform[4]);
        
        const rowText = rowItems.map(item => item.str.trim()).filter(str => str !== '').join(' ');
        
        // Regex to match a transaction row with broader tolerance for reference numbers and types
        const transactionRegex = /^(\d{2}\/\d{2}\/\d{4})\s+(\d{2}:\d{2}:\d{2})\s+(.+?)\s+(XXXXXX\d{4})\s+(.+?)\s+(.+?)\s+(\S+)\s+(PAY|COLLECT|TRANSFER|NA|UPI|NEFT|RTGS|IMPS|[A-Z]+)\s+([\d.,]+)\s+(CR|DR)\s+(SUCCESS|FAILURE)$/i;
        
        const match = rowText.match(transactionRegex);
        if (match) {
          const deterministicId = `tx_${match[1]}_${match[2]}_${match[7]}_${match[9]}`.replace(/[\/\s:,]/g, '');
          allTransactions.push({
            id: deterministicId,
            date: match[1],
            time: match[2],
            bankname: match[3].trim(),
            account: match[4],
            sender: match[5].trim(),
            receiver: match[6].trim(),
            reference: match[7],
            type: match[8],
            amount: parseFloat(match[9].replace(/,/g, '')),
            cr_dr: match[10],
            status: match[11],
            // Create a javascript Date object for easier sorting/filtering
            // The date in the PDF is DD/MM/YYYY.
            timestamp: new Date(`${match[1].split('/').reverse().join('-')}T${match[2]}`).getTime()
          });
        }
      }
    }
    
    // Sort transactions chronologically
    return allTransactions.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error("Error parsing PDF:", error);
    throw new Error("Failed to parse the PDF document.");
  }
};
