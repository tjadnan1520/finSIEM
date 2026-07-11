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

  const waitForText = async (text, label, attempts = 30) => {
    let body = "";
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      await delay(500);
      const result = await send("Runtime.evaluate", {
        expression: "document.body.innerText",
        returnByValue: true
      });
      body = result.result.result.value || "";
      if (body.includes(text)) {
        return body;
      }
    }
    throw new Error(`${label} did not render expected text: ${text}. Saw: ${body.slice(0, 300)}`);
  };

  const setAmount = async (amount) => {
    await send("Runtime.evaluate", {
      expression: `
        (() => {
          const input = document.querySelector('input[type="number"]');
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          setter.call(input, '${amount}');
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        })()
      `
    });
  };

  await send("Runtime.enable");
  await send("Page.enable");
  await send("Page.navigate", { url: appUrl });

  await waitForText("Operational workspace login", "Login page");

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

  for (const expectedText of ["Physical Cash", "bKash", "Nagad", "Rocket", "Transactions"]) {
    if (!dashboardValue.text.includes(expectedText)) {
      throw new Error(`Dashboard is missing expected text: ${expectedText}`);
    }
  }

  for (const removedText of ["Liquidity Score", "Active Reviews", "Provider Balances"]) {
    if (dashboardValue.text.includes(removedText)) {
      throw new Error(`Dashboard still shows removed text: ${removedText}`);
    }
  }

  if (dashboardValue.text.includes("Cash In\n") || dashboardValue.text.includes("Cash Out\n")) {
    throw new Error("Sidebar still shows separate Cash In/Cash Out menu entries");
  }

  await send("Page.navigate", { url: "http://127.0.0.1:5181/transactions" });
  await waitForText("Cash Movement", "Transactions page");
  await waitForText("Nadia Rahman", "Transaction form options");
  await setAmount(100);
  await delay(300);
  await send("Runtime.evaluate", { expression: "document.querySelector('button[type=\"submit\"]').click()" });
  const cashInBody = await waitForText("Transaction processed successfully.", "Cash in submission", 40);
  if (cashInBody.includes("Liquidity score")) {
    throw new Error("Transaction form still exposes liquidity score after cash in");
  }

  await send("Runtime.evaluate", {
    expression: "[...document.querySelectorAll('button')].find((button) => button.textContent.trim() === 'Cash Out').click()"
  });
  await setAmount(100);
  await delay(300);
  await send("Runtime.evaluate", { expression: "document.querySelector('button[type=\"submit\"]').click()" });
  const cashOutBody = await waitForText("Transaction processed successfully.", "Cash out submission", 40);
  if (cashOutBody.includes("Liquidity score")) {
    throw new Error("Transaction form still exposes liquidity score after cash out");
  }

  if (exceptions.length > 0) {
    throw new Error(`Browser runtime exceptions: ${exceptions.join("; ")}`);
  }

  console.log("UI smoke test passed: login, dashboard, cash in, and cash out rendered/worked.");
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
