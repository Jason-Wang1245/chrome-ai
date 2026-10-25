const AI_MODE_URL = "https://www.google.com/aimode";
const DEFAULT_TITLE = "Open Google AI Mode";
const WINDOW_ID_KEY = "chatWindowId";
const POPUP_WIDTH = 520;
const POPUP_HEIGHT = 720;

// Serialize commands, toolbar clicks, and cleanup so they cannot create or
// forget a window while another operation is still changing it.
let operationQueue = Promise.resolve();

function enqueue(operation) {
  operationQueue = operationQueue.then(operation).catch(reportFailure);
  return operationQueue;
}

async function reportFailure(error) {
  console.error("AI Mode Popup:", error);
  const message = error instanceof Error ? error.message : String(error);

  // Reporting a failure must not leave the queue rejected or prevent a retry.
  await Promise.allSettled([
    chrome.action.setBadgeBackgroundColor({ color: "#B3261E" }),
    chrome.action.setBadgeText({ text: "!" }),
    chrome.action.setTitle({
      title: `AI Mode Popup: ${message} Click the toolbar icon to retry.`,
    }),
  ]);
}

async function clearFailure() {
  await Promise.all([
    chrome.action.setBadgeText({ text: "" }),
    chrome.action.setTitle({ title: DEFAULT_TITLE }),
  ]);
}

async function getChatWindow() {
  const stored = await chrome.storage.session.get(WINDOW_ID_KEY);
  const windowId = stored[WINDOW_ID_KEY];

  if (!Number.isInteger(windowId)) {
    return null;
  }

  try {
    const window = await chrome.windows.get(windowId);
    if (window.type === "popup") {
      return window;
    }
  } catch {
    // The user may have closed the window before its removal event ran.
  }

  await chrome.storage.session.remove(WINDOW_ID_KEY);
  return null;
}

async function getPopupBounds() {
  const bounds = { width: POPUP_WIDTH, height: POPUP_HEIGHT };

  try {
    const parent = await chrome.windows.getLastFocused({
      windowTypes: ["normal"],
    });

    if (
      [parent.left, parent.top, parent.width, parent.height].every(Number.isInteger)
    ) {
      bounds.width = Math.min(POPUP_WIDTH, parent.width);
      bounds.height = Math.min(POPUP_HEIGHT, parent.height);
      bounds.left = Math.round(parent.left + (parent.width - bounds.width) / 2);
      bounds.top = Math.round(parent.top + (parent.height - bounds.height) / 2);
    }
  } catch {
    // Chrome may be running without a normal window. Let it position the popup.
  }

  return bounds;
}

async function createChatWindow() {
  const window = await chrome.windows.create({
    url: AI_MODE_URL,
    type: "popup",
    focused: true,
    incognito: false,
    ...(await getPopupBounds()),
  });

  if (!Number.isInteger(window?.id)) {
    throw new Error("Chrome did not return a chat window.");
  }

  try {
    await chrome.storage.session.set({ [WINDOW_ID_KEY]: window.id });
  } catch (error) {
    // Roll back an untracked new window so a retry cannot create a duplicate.
    await chrome.windows.remove(window.id).catch(console.error);
    throw error;
  }
}

async function openChatWindow(toggle) {
  const window = await getChatWindow();

  if (!window) {
    await createChatWindow();
  } else if (toggle && window.focused && window.state !== "minimized") {
    await chrome.windows.update(window.id, { state: "minimized" });
  } else {
    // Avoid navigating the tab: both the conversation and draft stay in place.
    const update = { focused: true };
    if (window.state === "minimized") {
      update.state = "normal";
    }
    await chrome.windows.update(window.id, update);
  }

  await clearFailure();
}

// Register listeners synchronously so Chrome can wake a suspended worker.
chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-ai-mode") {
    void enqueue(() => openChatWindow(true));
  }
});

chrome.action.onClicked.addListener(() => {
  void enqueue(() => openChatWindow(false));
});

chrome.windows.onRemoved.addListener((windowId) => {
  void enqueue(async () => {
    const stored = await chrome.storage.session.get(WINDOW_ID_KEY);
    if (stored[WINDOW_ID_KEY] === windowId) {
      await chrome.storage.session.remove(WINDOW_ID_KEY);
    }
  });
});
