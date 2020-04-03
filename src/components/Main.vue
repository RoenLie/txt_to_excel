<template>
  <div class="base">
    <div class="main-container">
      <input type="file" name="file" id="file" @change="openFile" multiple />
      <button @click="logFileData">Convert Data To Excel</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, watch, ref, reactive } from "@vue/composition-api";
import XLSX from "xlsx";
import { saveAs } from "file-saver";

export default defineComponent({
  name: "Main",
  props: {},
  setup() {
    var _RawFileData: any = "";
    var _ParsedFileData: any = "";

    const openFile = (e: any) => {
      const reader: any = new FileReader();
      reader.onload = () => convertToExcel(reader.result);
      reader.readAsText(e.target.files[0]);
    };

    const logFileData = () => {};

    const convertToExcel = (fileData: any) => {
      const wb = XLSX.utils.book_new();
      wb.Props = {
        Title: "ShipData",
        Subject: "convertedData",
        Author: "txt_to_excel",
        CreatedDate: new Date()
      };
      wb.SheetNames.push("Sheet1");

      const ws_data = [["hello", "world"]];

      const ws = XLSX.utils.aoa_to_sheet(ws_data);
      wb.Sheets["Sheet1"] = ws;

      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "binary" });
      const s2ab = (s: any) => {
        const buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
        const view = new Uint8Array(buf); //create uint8array as viewer
        for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff; //convert to octet
        return buf;
      };

      saveAs(
        new Blob([s2ab(wbout)], { type: "application/octet-stream" }),
        "test.xlsx"
      );
    };

    const createExcelDataStructure = (fileData: any) => {};

    return { openFile, logFileData };
  }
});
</script>

<style scoped lang="scss">
.base {
  @include scrollbar;
  height: 100vh;
  width: 100vw;
  background-color: $defaultDark;

  display: grid;
  justify-content: center;
  align-items: center;
}
.main-container {
  background-color: $deepMaroon;
  border: 1px solid $defaultBorderColor;
  height: 30vh;
  width: 50vw;
  padding: 3em;

  display: flex;
  flex-direction: column;
  justify-content: space-around;

  input {
    background-color: $defaultBg;
  }

  button {
    background-color: $defaultBg;
    border: 1px solid $defaultBorderColor;
    outline: none;
    height: 5em;
    font-size: 14px;
    font-weight: bold;
    border-radius: 1em;
    &:hover {
      box-shadow: 0 0 6px $defaultHighlight;
      box-shadow: 0 0 6px $defaultHighlight;
    }
  }
}
</style>
