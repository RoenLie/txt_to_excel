<template>
  <div class="base">
    <div class="main-container">
      <div style="color:white;">
        Upload your desired amount of .txt files, wait for files parsed to match
        amount of files then click the Convert Data to Excel button
      </div>
      <div
        style="color:white; border-top: 1px solid black; border-bottom: 1px solid black; padding: 1em;"
      >
        Files Parsed: {{ filesParsed }}
      </div>
      <div v-if="loading" class="loader" />
      <div
        style="color:white; border-top: 1px solid black; border-bottom: 1px solid black; padding: 1em;"
      >
        Status: {{ status }}
      </div>
      <div style="display:flex; flex-direction:row;">
        <div>
          <label for="inputSpeedFilter" style="color:white">
            low-pass filter: speed(knops)
          </label>
          <input
            id="inputSpeedFilter"
            name="userInteractable"
            type="text"
            v-model="speedFilter"
            style="width:100%; text-align: center; height: 1.5em;"
          />
        </div>
        <div style="display:flex; flex-direction: column; align-items: center;">
          <label for="chkCalculateAverages" style="color:white">
            Calculate Averages
          </label>
          <input
            id="chkCalculateAverages"
            name="userInteractable"
            type="checkbox"
            v-model="calculcateAverages"
          />
        </div>
      </div>
      <input
        type="file"
        name="userInteractable"
        id="file"
        @change="openFile"
        multiple
      />
      <button @click="createExcelDocument" name="userInteractable">
        Convert Data To Excel
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from "@vue/composition-api";
import { saveAs } from "file-saver";
import Worker from "worker-loader!../workers/createExcelDocument.worker";
import createExcelDataStructure from "./CreateExcelDataStructure";

export default defineComponent({
  name: "Main",
  props: {},
  setup() {
    let speedFilter = ref(4);
    let filesParsed = ref(0);
    let parsedFileData: any = [];
    let status = ref("");
    let loading = ref(false);
    let calculcateAverages = ref(true);

    const openFile = (e: any) => {
      filesParsed.value = 0;
      status.value = "";
      parsedFileData = [];

      const inputSpeedFilter: any = document.getElementById("inputSpeedFilter");
      inputSpeedFilter.disabled = true;

      const transpose = (m: any) =>
        m[0].map((x: any, i: any) => m.map((x: any) => x[i]));

      let files: any = e.target.files;
      if (files) {
        for (let i = 0, f; (f = files[i]); i++) {
          let reader = new FileReader();
          reader.onload = (f => {
            return (e: any) => {
              if (parsedFileData.length === 6000) return;
              parsedFileData.push(
                transpose(
                  createExcelDataStructure(
                    e.target.result,
                    parsedFileData,
                    speedFilter,
                    calculcateAverages.value
                  )
                )
              );
              filesParsed.value++;
            };
          })(f);
          reader.readAsText(f);
        }
      }
      if (files.length === 0) inputSpeedFilter.disabled = false;
    };

    const createExcelDocument = () => {
      loading.value = true;
      const userInteractable: any = document.getElementsByName(
        "userInteractable"
      );

      userInteractable.forEach((node: any) => {
        node.disabled = true;
      });

      const worker = new Worker();

      status.value = "excel document creation in progress";

      const filesPerSheet = calculcateAverages.value ? 500 : 50;

      worker.postMessage({
        inputData: parsedFileData,
        filesPerSheet: filesPerSheet
      });

      worker.onmessage = (event: any) => {
        if (event.data.statusUpdate) {
          status.value = event.data.statusUpdate;
          return;
        }

        if (event.data.abort) {
          status.value = event.data.abort;
        } else {
          saveAs(
            new Blob(event.data.blobOut, {
              type: "application/octet-stream"
            }),
            "ShipData.xlsx"
          );
          status.value = "excel document created";
        }

        userInteractable.forEach((node: any) => {
          node.disabled = false;
        });

        worker.terminate;
        loading.value = false;
      };
    };

    return {
      openFile,
      createExcelDocument,
      speedFilter,
      filesParsed,
      status,
      loading,
      calculcateAverages
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
  height: 70vh;
  width: 50vw;
  padding: 3em;

  display: flex;
  flex-direction: column;
  justify-content: center;

  div {
    font-size: 1.5vh;
    margin-top: 1em;
  }

  input {
    background-color: $defaultBg;
    border: 1px solid $defaultBorderColor;
    height: 5em;
    border-radius: 0.25em;
    margin-top: 1em;
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
    margin-top: 1em;
    &:hover {
      box-shadow: 0 0 6px $defaultHighlight;
      box-shadow: 0 0 6px $defaultHighlight;
    }
  }
}

.loader {
  margin-left: auto;
  margin-right: auto;
  border: 5px solid $defaultDark;
  border-top: 5px solid $defaultBg;
  border-radius: 50%;
  width: 1em;
  height: 1em;
  animation: spin 2s linear infinite;
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
}
</style>
