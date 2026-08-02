import fs from 'fs';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';

const pdfPath = '../Transaction_Statement.pdf';
const data = new Uint8Array(fs.readFileSync(pdfPath));

async function parse() {
  const loadingTask = pdfjsLib.getDocument({ data });
  const pdf = await loadingTask.promise;
  const transactionRegex = /^(\d{2}\/\d{2}\/\d{4})\s+(\d{2}:\d{2}:\d{2})\s+(.+?)\s+(XXXXXX\d{4})\s+(.+?)\s+(.+?)\s+(\S+)\s+(PAY|COLLECT|TRANSFER|NA|UPI|NEFT|RTGS|IMPS|[A-Z]+)\s+([\d.,]+)\s+(CR|DR)\s+(SUCCESS|FAILURE)$/i;
  let allTransactions = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    
    const rows = {};
    textContent.items.forEach((item) => {
      const y = Math.round(item.transform[5]); 
      if (!rows[y]) rows[y] = [];
      rows[y].push(item);
    });

    const sortedY = Object.keys(rows).sort((a, b) => Number(b) - Number(a));

    for (let y of sortedY) {
      const rowItems = rows[y];
      rowItems.sort((a, b) => a.transform[4] - b.transform[4]);
      const rowText = rowItems.map(item => item.str.trim()).filter(str => str !== '').join(' ');
      
      const match = rowText.match(transactionRegex);
      if (match) {
        const deterministicId = `tx_${match[1]}_${match[2]}_${match[7]}_${match[9]}`.replace(/[\/\s:,]/g, '');
        allTransactions.push({
          id: deterministicId,
          date: match[1],
          time: match[2],
          bankName: match[3].trim(),
          account: match[4],
          sender: match[5].trim(),
          receiver: match[6].trim(),
          reference: match[7],
          type: match[8],
          amount: parseFloat(match[9].replace(/,/g, '')),
          cr_dr: match[10],
          status: match[11],
          timestamp: new Date(`${match[1].split('/').reverse().join('-')}T${match[2]}`).getTime()
        });
      }
    }
  }
  
  fs.writeFileSync('public/mockData.json', JSON.stringify(allTransactions, null, 2));
  console.log('Wrote mock data to public/mockData.json');
}

parse().catch(console.error);
