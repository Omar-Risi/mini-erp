import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("db", {
  get: (sql, params) => ipcRenderer.invoke("db:get", sql, params),
  all: (sql, params) => ipcRenderer.invoke("db:all", sql, params),
  run: (sql, params) => ipcRenderer.invoke("db:run", sql, params),
});
