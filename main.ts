import { app, BrowserWindow } from "electron";
import * as path from "path";
import { exec } from "child_process";

let mainWindow: BrowserWindow;
let nextProcess: any;

app.whenReady().then(() => {
  // Start Next.js server
  nextProcess = exec("npm run start");

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false
    }
  });

  // Wait for Next.js server to start
  setTimeout(() => {
    mainWindow.loadURL("http://localhost:3000");
  }, 5000);

  mainWindow.on("closed", () => {
    if (nextProcess) nextProcess.kill();
    mainWindow = null;
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
