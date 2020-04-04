<template>
  <div class="base">
    <div class="main-container">
      <div style="color:white; font-size: 2vh">
        Upload your desired amount of .txt files, wait a second or two then
        click the Convert Data to Excel button
      </div>
      <input type="file" name="file" id="file" @change="openFile" multiple />
      <button @click="convertToExcel">Convert Data To Excel</button>
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
    let parsedFileData: any = [];

    const transpose = (m: any) =>
      m[0].map((x: any, i: any) => m.map((x: any) => x[i]));

    const createExcelDataStructure = (fileData: any) => {
      const splitByNewLine = fileData.split("\n");

      //#region lineParsing
      const id = [splitByNewLine[0]];
      const speed_prefix = splitByNewLine[1].split(";");
      const speed_fix_prefix = splitByNewLine[2].split(";");
      const speed_post_prefix = splitByNewLine[3].split(";");
      const dist_prefix = splitByNewLine[4].split(";");
      const dist_fix_prefix = splitByNewLine[5].split(";");
      const dist_post_prefix = splitByNewLine[6].split(";");
      const time_prefix = splitByNewLine[7].split(";");
      const time_fix_prefix = splitByNewLine[8].split(";");
      const time_post_prefix = splitByNewLine[9].split(";");
      const draught_bound_prefix = splitByNewLine[10].split(";");
      const draught_bound_fix_loading = splitByNewLine[11].split(";");
      const draught_bound_post_loading = splitByNewLine[12].split(";");
      const time_stamp_prefix = splitByNewLine[13].split(";");
      const time_stamp_fix_loading = splitByNewLine[14].split(";");
      const time_stamp_post_loading = splitByNewLine[15].split(";");
      const dist_dest_prefix = splitByNewLine[16].split(";");
      const dist_dest_fix_loading = splitByNewLine[17].split(";");
      const date = [splitByNewLine[18]];
      const name = [splitByNewLine[19]];
      const imo = [splitByNewLine[20]];
      const dwt = [splitByNewLine[21]];
      const loa = [splitByNewLine[22]];
      const beam = [splitByNewLine[23]];
      const draught_design = [splitByNewLine[24]];
      const built = [splitByNewLine[25]];
      const quantity = [splitByNewLine[26]];
      const type = [splitByNewLine[27]];
      const charterer = [splitByNewLine[28]];
      const load = [splitByNewLine[29]];
      const discharge = [splitByNewLine[30]];
      const laycan_from = [splitByNewLine[31]];
      const laycan_to = [splitByNewLine[32]];
      const route = [splitByNewLine[33]];
      const w_from = [splitByNewLine[34]];
      const w_to = [splitByNewLine[35]];
      const dist_to_dest_fix = [splitByNewLine[36]];
      const r_TA_fix = [splitByNewLine[37]];
      const r_FH_fix = [splitByNewLine[38]];
      const r_BH_fix = [splitByNewLine[39]];
      const r_TP_fix = [splitByNewLine[40]];
      const r_aver_fix = [splitByNewLine[41]];
      const error_occured = [splitByNewLine[42]];
      //#endregion

      const matrix = [
        id,
        speed_prefix,
        speed_fix_prefix,
        speed_post_prefix,
        dist_prefix,
        dist_fix_prefix,
        dist_post_prefix,
        time_prefix,
        time_fix_prefix,
        time_post_prefix,
        draught_bound_prefix,
        draught_bound_fix_loading,
        draught_bound_post_loading,
        time_stamp_prefix,
        time_stamp_fix_loading,
        time_stamp_post_loading,
        dist_dest_prefix,
        dist_dest_fix_loading,
        date,
        name,
        imo,
        dwt,
        loa,
        beam,
        draught_design,
        built,
        quantity,
        type,
        charterer,
        load,
        discharge,
        laycan_from,
        laycan_to,
        route,
        w_from,
        w_to,
        dist_to_dest_fix,
        r_TA_fix,
        r_FH_fix,
        r_BH_fix,
        r_TP_fix,
        r_aver_fix,
        error_occured
      ];

      const columnNames = [
        "id",
        "speed_prefix",
        "speed_fix_prefix",
        "speed_post_prefix",
        "dist_prefix",
        "dist_fix_prefix",
        "dist_post_prefix",
        "time_prefix",
        "time_fix_prefix",
        "time_post_prefix",
        "draught_bound_prefix",
        "draught_bound_fix_loading",
        "draught_bound_post_loading",
        "time_stamp_prefix",
        "time_stamp_fix_loading",
        "time_stamp_post_loading",
        "dist_dest_prefix",
        "dist_dest_fix_loading",
        "date",
        "name",
        "imo",
        "dwt",
        "loa",
        "beam",
        "draught_design",
        "built",
        "quantity",
        "type",
        "charterer",
        "load",
        "discharge",
        "laycan_from",
        "laycan_to",
        "route",
        "w_from",
        "w_to",
        "dist_to_dest_fix",
        "r_TA_fix",
        "r_FH_fix",
        "r_BH_fix",
        "r_TP_fix",
        "r_aver_fix",
        "error_occured"
      ];

      matrix.forEach((value, index, array) => {
        array[index].unshift(columnNames[index]);
      });

      let matrixHelperSize = 0;
      matrix.forEach((value, index, array) => {
        matrixHelperSize =
          value.length > matrixHelperSize ? value.length : matrixHelperSize;
      });

      let matrixSizer = [];
      for (let i = 0; i < matrixHelperSize; i++) {
        matrixSizer.push([]);
      }

      matrix.unshift(matrixSizer);

      const transposed = transpose(matrix);

      return transposed;
    };

    const openFile = (e: any) => {
      let files: any = e.target.files;
      if (files) {
        for (let i = 0, f; (f = files[i]); i++) {
          let reader = new FileReader();
          reader.onload = (f => {
            return (e: any) => {
              parsedFileData.push(createExcelDataStructure(e.target.result));
            };
          })(f);
          reader.readAsText(f);
        }
      }
    };

    const convertToExcel = () => {
      const wb = XLSX.utils.book_new();
      wb.Props = {
        Title: "ShipData",
        Subject: "convertedData",
        Author: "txt_to_excel",
        CreatedDate: new Date()
      };
      wb.SheetNames.push("Sheet1");

      const ws_data = parsedFileData.flat();

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

    return { openFile, convertToExcel };
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
    border: 1px solid $defaultBorderColor;
    height: 5em;
    border-radius: 0.25em;
    &:hover {
      box-shadow: 0 0 6px $defaultHighlight;
      box-shadow: 0 0 6px $defaultHighlight;
    }
    &:focus {
      outline: none;
    }
  }

  button {
    background-color: $defaultBg;
    border: 1px solid $defaultBorderColor;
    outline: none;
    height: 5em;
    font-size: 14px;
    font-weight: bold;
    border-radius: 0.5em;
    &:hover {
      box-shadow: 0 0 6px $defaultHighlight;
      box-shadow: 0 0 6px $defaultHighlight;
    }
  }
}
</style>
