import XLSX from "xlsx";

const worker: Worker = self as any;
worker.onmessage = (event: any) => {
  const parsedFileData = event.data.inputData;

  const wb = XLSX.utils.book_new();
  wb.Props = {
    Title: "ShipData",
    Subject: "convertedData",
    Author: "txt_to_excel",
    CreatedDate: new Date()
  };

  const filesPerSheet = event.data.filesPerSheet;
  const sheetAmount = Math.ceil(parsedFileData.length / filesPerSheet);
  const arrayLength = parsedFileData.length;

  worker.postMessage({
    statusUpdate: `creating ${sheetAmount} excel sheets from ${arrayLength} files`
  });

  for (let i = 0; i < sheetAmount; i++) {
    wb.SheetNames.push(`Sheet${i}`);

    const initial = i * filesPerSheet;
    const upperLimit =
      initial < arrayLength ? initial + filesPerSheet : arrayLength;

    const ws_data = parsedFileData.slice(initial, upperLimit).flat();
    const ws = XLSX.utils.aoa_to_sheet(ws_data);

    wb.Sheets[`Sheet${i}`] = ws;
  }

  worker.postMessage({
    statusUpdate: "buffer creation (this takes a long time)"
  });

  try {
    const excelData = XLSX.write(wb, { bookType: "xlsx", type: "binary" });
    const buffer = new ArrayBuffer(excelData.length);
    const view = new Uint8Array(buffer);
    //convert to octet
    for (let i = 0; i < excelData.length; i++) {
      view[i] = excelData.charCodeAt(i) & 0xff;
    }
    const blobData = [buffer];
    worker.postMessage({
      blobOut: blobData
    });
  } catch (error) {
    worker.postMessage({ abort: "no files selected" });
  }
};
