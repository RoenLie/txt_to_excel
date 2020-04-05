<template>
  <div class="base">
    <div class="main-container">
      <div style="color:white;">
        Upload your desired amount of .txt files, wait a second or two then
        click the Convert Data to Excel button
      </div>
      <div
        style="color:white; border-top: 1px solid black; border-bottom: 1px solid black; padding: 1em;"
      >
        Files Parsed: {{ filesParsed }}
      </div>
      <div
        style="color:white; border-top: 1px solid black; border-bottom: 1px solid black; padding: 1em;"
      >
        Status: {{ status }}
      </div>
      <div>
        <label for="speedFilter" style="color:white"
          >low-pass filter: speed(knops)</label
        >
        <input
          name="userInteractable"
          type="text"
          v-model="speedFilter"
          style="width:100%; text-align: center; height: 1.5em;"
        />
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
import createExcelDataStructure from "./CreateExcelDataStructure";
import Worker from "worker-loader!../workers/createExcelDocument.worker";

export default defineComponent({
  name: "Main",
  props: {},
  setup() {
    let speedFilter = ref(4);
    let filesParsed = ref(0);
    let parsedFileData: any = [];
    let status = ref("");

    const openFile = (e: any) => {
      filesParsed.value = 0;
      parsedFileData = [];

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
                    speedFilter
                  )
                )
              );
              filesParsed.value++;
            };
          })(f);
          reader.readAsText(f);
        }
      }
    };

    const createExcelDocument = () => {
      const userInteractable: any = document.getElementsByName(
        "userInteractable"
      );

      userInteractable.forEach((node: any) => {
        node.disabled = true;
      });

      const worker = new Worker();

      status.value = "excel document creation in progress";

      worker.postMessage({
        inputData: parsedFileData
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
      };
    };

    return {
      openFile,
      createExcelDocument,
      speedFilter,
      filesParsed,
      status
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
</style>
