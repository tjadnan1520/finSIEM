const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const userDataDir = path.join(__dirname, "..", ".chrome-smoke");
const debugPort = 9223;
const appUrl = "http://127.0.0.1:5181/login";

fs.rmSync(userDataDir, { recursive: true, force: true });

const chrome = spawn(chromePath, [
  "--headless=new",
  "--disable-gpu",
  "--no-first-run",
  "--disable-extensions",
  `--user-data-dir=${userDataDir}`,
  `--remote-debugging-port=${debugPort}`,
  "about:blank"
], { stdio: ["ignore", "pipe", "pipe"] });

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getJson = async (url, retries = 25) => {
  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      const response = await fetch(url);
      return await response.json();
    } catch {
      await delay(200);
    }
  }
  throw new Error(`Unable to reach ${url}`);
};

const connect = (url) => new Promise((resolve, reject) => {
  const socket = new WebSocket(url);
  socket.addEventListener("open", () => resolve(socket), { once: true });
  socket.addEventListener("error", reject, { once: true });
});

const run = async () => {
  const tabs = await getJson(`http://127.0.0.1:${debugPort}/json`);
  const pageTarget = tabs.find((target) => target.type === "page");
  if (!pageTarget) {
    throw new Error("No Chrome page target was available for UI smoke test");
  }
  const socket = await connect(pageTarget.webSocketDebuggerUrl);
  let id = 0;
  const pending = new Map();
  const exceptions = [];

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      pending.get(message.id)(message);
      pending.delete(message.id);
    }
    if (message.method === "Runtime.exceptionThrown") {
      exceptions.push(message.params.exceptionDetails.text);
    }
  });

  const send = (method, params = {}) => new Promise((resolve) => {
    const commandId = ++id;
    pending.set(commandId, resolve);
    socket.send(JSON.stringify({ id: commandId, method, params }));
  });

  await send("Runtime.enable");
  await send("Page.enable");
  await send("Page.navigate", { url: appUrl });

  let loginBody = "";
  for (let attempt = 0; attempt < 20; attempt += 1) {
    await delay(500);
    const loginText = await send("Runtime.evaluate", {
      expression: "document.body.innerText",
      returnByValue: true
    });
    loginBody = loginText.result.result.value || "";
    if (loginBody.includes("Operational workspace login")) {
      break;
    }
  }

  if (!loginBody.includes("Operational workspace login")) {
    throw new Error(`Login page did not render expected text. Saw: ${loginBody.slice(0, 160)}`);
  }

  await send("Runtime.evaluate", {
    expression: "document.querySelector('form').requestSubmit()"
  });
  await delay(9000);

  const dashboard = await send("Runtime.evaluate", {
    expression: "({ path: location.pathname, text: document.body.innerText })",
    returnByValue: true
  });

  const dashboardValue = dashboard.result.result.value;
  if (dashboardValue.path !== "/dashboard" || !dashboardValue.text.includes("Welcome back")) {
    throw new Error(`Dashboard did not render after login. Path: ${dashboardValue.path}. Saw: ${dashboardValue.text.slice(0, 500)}`);
  }

  if (exceptions.length > 0) {
    throw new Error(`Browser runtime exceptions: ${exceptions.join("; ")}`);
  }

  console.log("UI smoke test passed: login and dashboard rendered.");
  socket.close();
};

run()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await delay(500);
    chrome.kill();
  });
