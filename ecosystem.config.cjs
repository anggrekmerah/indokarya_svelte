// This file is a standard PM2 configuration written in JavaScript (CommonJS).
// It is the correct format for PM2 to read and run.

module.exports = {
  apps: [{
    // The name of the application.
    name: "svelte-dev",

    // This is the key fix. We use "npm" as the executable.
    script: "npm",

    // These are the arguments passed to the `npm` executable.
    args: "run dev",

    // Set the working directory to the project root.
    cwd: "./",

    // Enable watch mode to automatically restart on file changes.
    watch: true,

    // List of files and directories to ignore during watch mode.
    ignore_watch: [
      "node_modules",
      "package.json",
      "package-lock.json",
      "yarn.lock",
      ".git",
      ".svelte-kit",
      "build",
    ],

    // Environment variables for the application.
    env: {
      NODE_ENV: "development",
    }
  }]
};
