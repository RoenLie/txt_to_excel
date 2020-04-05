<template>
  <div class="base">
    <div class="main-container">
      <div style="color:white; font-size: 1.75vh">
        Upload your desired amount of .txt files, wait a second or two then
        click the Convert Data to Excel button
      </div>
      <div
        style="color:white; border-top: 1px solid black; border-bottom: 1px solid black; padding: 1em;"
      >
        Files Parsed: {{ filesParsed }}, Sheets Processed: {{ sheetsProcessed }}
      </div>
      <div>
        <label for="speedFilter" style="color:white"
          >low-pass filter: speed(knops)</label
        >
        <input
          name="speedFilter"
          type="text"
          v-model="speedFilter"
          style="width:100%; text-align: center; height: 1.5em;"
        />
      </div>
      <input type="file" name="file" id="file" @change="openFile" multiple />
      <button @click="createExcelDocument">Convert Data To Excel</button>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  watch,
  ref,
  reactive,
  watchEffect
} from "@vue/composition-api";
import XLSX from "xlsx";
import { saveAs } from "file-saver";

export default defineComponent({
  name: "Main",
  props: {},
  setup() {
    let speedFilter = ref(4);
    let filesParsed = ref(0);
    let sheetsProcessed = ref(0);
    let parsedFileData: any = reactive([]);

    const transpose = (m: any) =>
      m[0].map((x: any, i: any) => m.map((x: any) => x[i]));

    const createExcelDataStructure = (fileData: any) => {
      const splitByNewLine: any[] = fileData.split("\n");

      const rawData = {
        id: [splitByNewLine[0]],
        speed_prefix: splitByNewLine[1].split(";"),
        speed_fix_prefix: splitByNewLine[2].split(";"),
        speed_post_prefix: splitByNewLine[3].split(";"),
        dist_prefix: splitByNewLine[4].split(";"),
        dist_fix_prefix: splitByNewLine[5].split(";"),
        dist_post_prefix: splitByNewLine[6].split(";"),
        time_prefix: splitByNewLine[7].split(";"),
        time_fix_prefix: splitByNewLine[8].split(";"),
        time_post_prefix: splitByNewLine[9].split(";"),
        draught_prefix: splitByNewLine[10].split(";"),
        draught_fix: splitByNewLine[11].split(";"),
        draught_post: splitByNewLine[12].split(";"),
        time_stamp_prefix: splitByNewLine[13].split(";"),
        time_stamp_fix: splitByNewLine[14].split(";"),
        time_stamp_post: splitByNewLine[15].split(";"),
        dist_dest_prefix: splitByNewLine[16].split(";"),
        dist_dest_fix: splitByNewLine[17].split(";"),
        date: [splitByNewLine[18]],
        name: [splitByNewLine[19]],
        imo: [splitByNewLine[20]],
        dwt: [splitByNewLine[21]],
        loa: [splitByNewLine[22]],
        beam: [splitByNewLine[23]],
        draught_design: [splitByNewLine[24]],
        built: [splitByNewLine[25]],
        quantity: [splitByNewLine[26]],
        type: [splitByNewLine[27]],
        charterer: [splitByNewLine[28]],
        load: [splitByNewLine[29]],
        discharge: [splitByNewLine[30]],
        laycan_from: [splitByNewLine[31]],
        laycan_to: [splitByNewLine[32]],
        route: [splitByNewLine[33]],
        w_from: [splitByNewLine[34]],
        w_to: [splitByNewLine[35]],
        dist_to_dest_fix: [splitByNewLine[36]],
        r_TA_fix: [splitByNewLine[37]],
        r_FH_fix: [splitByNewLine[38]],
        r_BH_fix: [splitByNewLine[39]],
        r_TP_fix: [splitByNewLine[40]],
        r_aver_fix: [splitByNewLine[41]],
        error_occured: [splitByNewLine[42]]
      };

      const hullSlenderness = [
        rawData.dwt[0] /
          (rawData.loa[0] * rawData.beam[0] * rawData.draught_design[0])
      ];

      rawData.time_stamp_prefix.pop();
      rawData.time_stamp_fix.pop();
      rawData.time_stamp_post.pop();

      rawData.draught_prefix.pop();
      rawData.draught_fix.pop();
      rawData.draught_post.pop();

      const status = [];
      for (let count in rawData.time_stamp_prefix) status.push("prefix");
      for (let count in rawData.time_stamp_fix) status.push("fix");
      for (let count in rawData.time_stamp_post) status.push("post");

      const speedColumn = [
        ...rawData.speed_prefix,
        ...rawData.speed_fix_prefix,
        ...rawData.speed_post_prefix
      ];

      const distColumn = [
        ...rawData.dist_prefix,
        ...rawData.dist_fix_prefix,
        ...rawData.dist_post_prefix
      ];

      const timeColumn = [
        ...rawData.time_prefix,
        ...rawData.time_fix_prefix,
        ...rawData.time_post_prefix
      ];

      const draughtColumn = [
        ...rawData.draught_prefix,
        ...rawData.draught_fix,
        ...rawData.draught_post
      ];

      const timeStampColumn = [
        ...rawData.time_stamp_prefix,
        ...rawData.time_stamp_fix,
        ...rawData.time_stamp_post
      ];

      const distanceColumn = [
        ...rawData.dist_dest_prefix,
        ...rawData.dist_dest_fix
      ];

      while (distanceColumn.length < speedColumn.length) {
        distanceColumn.push("0");
      }

      const averages = [];
      const temp = {
        speed: [] as any,
        dist: [] as any,
        time: [] as any,
        draught: [] as any,
        remainingDistance: "",
        status: "",
        date: ""
      };

      // calculate averages per day for speed, distance, time and draught
      for (let i = 0; i < timeStampColumn.length; i++) {
        const date = timeStampColumn[i].split(" ")[0];
        if (temp.date == "") temp.date = date;

        if (date !== temp.date) {
          const reducer = (accumulator: number, currentValue: number) =>
            accumulator + currentValue;

          if (temp.speed.length > 0) {
            let speed = temp.speed.reduce(reducer) / temp.speed.length;
            let dist = temp.dist.reduce(reducer) / temp.dist.length;
            let time = temp.time.reduce(reducer) / temp.time.length;
            let draught = temp.draught;
            let remainingDistance = temp.remainingDistance;
            let status = temp.status;

            averages.push([
              speed,
              dist,
              time,
              draught,
              temp.date,
              remainingDistance,
              status
            ]);
          }

          (temp.speed = []),
            (temp.dist = []),
            (temp.time = []),
            (temp.draught = []),
            (temp.date = ""),
            (temp.remainingDistance = ""),
            (temp.status = "");
        }

        if (Number(speedColumn[i]) >= speedFilter.value) {
          temp.speed.push(Number(speedColumn[i]));
          temp.dist.push(Number(distColumn[i]));
          temp.time.push(Number(timeColumn[i]));
          temp.draught = draughtColumn[i];
          temp.remainingDistance = distanceColumn[i];
          temp.status = status[i];
        }
      }

      // create new arrays containing averages
      const newSpeedColumn = averages.map(item => item[0]);
      const newDistColumn = averages.map(item => item[1]);
      const newTimeColumn = averages.map(item => item[2]);
      const newDraughtColumn = averages.map(item => item[3]);
      const newDateColumn = averages.map(item => item[4]);
      const newRemainingDistanceColumn = averages.map(item => item[5]);
      const newStatusColumn = averages.map(item => item[6]);

      // list of column names to be added after data parsing
      const columnNames = [
        "placeholder1",
        "placeholder2",
        "placeholder3",
        "placeholder4",
        "time_stamp",
        "id",
        "speed",
        "dist",
        "time",
        "draught bound",
        "remaining distance",
        "status",
        "date",
        "name",
        "imo",
        "Hull Slenderness",
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

      // Create matrix sizer
      let matrixSizer = [];
      for (let i = 0; i < newSpeedColumn.length; i++) {
        matrixSizer.push([]);
      }

      // data matrix
      const matrix: any[] = [
        [...matrixSizer],
        [...matrixSizer],
        [...matrixSizer],
        [...matrixSizer],
        newDateColumn,
        rawData.id,
        newSpeedColumn,
        newDistColumn,
        newTimeColumn,
        newDraughtColumn,
        newRemainingDistanceColumn,
        newStatusColumn,
        rawData.date,
        rawData.name,
        rawData.imo,
        hullSlenderness,
        rawData.dwt,
        rawData.loa,
        rawData.beam,
        rawData.draught_design,
        rawData.built,
        rawData.quantity,
        rawData.type,
        rawData.charterer,
        rawData.load,
        rawData.discharge,
        rawData.laycan_from,
        rawData.laycan_to,
        rawData.route,
        rawData.w_from,
        rawData.w_to,
        rawData.dist_to_dest_fix,
        rawData.r_TA_fix,
        rawData.r_FH_fix,
        rawData.r_BH_fix,
        rawData.r_TP_fix,
        rawData.r_aver_fix,
        rawData.error_occured
      ];

      // fill out rows on columns with less than matrix
      matrix.forEach(item => {
        while (item.length < matrixSizer.length) {
          item.push(item[0]);
        }
      });

      // Insert column names if this is the first document
      if (parsedFileData.length === 0) {
        matrix.forEach((value, index, array) => {
          array[index].unshift(columnNames[index]);
        });
      }
      filesParsed.value++;
      return matrix;
    };

    const openFile = (e: any) => {
      filesParsed.value = 0;
      sheetsProcessed.value = 0;
      parsedFileData = [];

      let filesProcessed = 0;

      let files: any = e.target.files;
      if (files) {
        for (let i = 0, f; (f = files[i]); i++) {
          let reader = new FileReader();
          reader.onload = (f => {
            return (e: any) => {
              if (parsedFileData.length === 6000) return;
              parsedFileData.push(
                transpose(createExcelDataStructure(e.target.result))
              );
            };
          })(f);
          reader.readAsText(f);
        }
      }
    };

    const createExcelDocument = () => {
      const wb = XLSX.utils.book_new();
      wb.Props = {
        Title: "ShipData",
        Subject: "convertedData",
        Author: "txt_to_excel",
        CreatedDate: new Date()
      };
      const filesPerSheet = 500;
      const sheetAmount = Math.ceil(parsedFileData.length / filesPerSheet);
      const arrayLength = parsedFileData.length;

      for (let i = 0; i < sheetAmount; i++) {
        sheetsProcessed.value++;
        wb.SheetNames.push(`Sheet${i}`);

        const initial = i * filesPerSheet;
        const upperLimit =
          initial < arrayLength ? initial + filesPerSheet : arrayLength;

        const ws_data = parsedFileData.slice(initial, upperLimit).flat();
        const ws = XLSX.utils.aoa_to_sheet(ws_data);

        wb.Sheets[`Sheet${i}`] = ws;
      }

      const wbOut = XLSX.write(wb, { bookType: "xlsx", type: "binary" });

      const s2ab = (s: any[any]) => {
        const buffer = new ArrayBuffer(s.length); //convert s to arrayBuffer
        const view = new Uint8Array(buffer);

        for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff; //convert to octet
        return buffer;
      };
      saveAs(
        new Blob([s2ab(wbOut)], { type: "application/octet-stream" }),
        "ShipData.xlsx"
      );
    };

    return {
      openFile,
      createExcelDocument,
      speedFilter,
      filesParsed,
      sheetsProcessed
    };
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
