# AI Mode Popup

A small Chrome extension that opens [Google AI Mode](https://www.google.com/aimode)
in a floating window. It uses Google's normal interface and the Google session
in your current Chrome profile. No API key, backend, dependencies, or build step.

## Install

1. Open `chrome://extensions` in desktop Chrome 102 or newer.
2. Turn on **Developer mode** in the top right.
3. Click **Load unpacked** and select this folder (`chrome-ai`).
4. Pin **AI Mode Popup** using Chrome's Extensions menu if you want a toolbar button.
5. Open `chrome://extensions/shortcuts` and confirm **Show or hide Google AI Mode**
   has a shortcut and its scope is **Global**.

## Use

| Action | Result |
| --- | --- |
| **Cmd+Shift+9** (Mac) or **Ctrl+Shift+9** (Windows/Linux) | Open or restore the chat from any app while Chrome is running. |
| Press the shortcut while the chat is focused | Minimize the chat, keeping the conversation and draft. |
| Click the toolbar button | Open or focus the existing chat. |
| Close the chat window | End window reuse; the next invocation opens AI Mode again. |

The first window is approximately 520 × 720 pixels, centered over your last
active normal Chrome window. You can move and resize it normally. Showing it
again preserves its position and size during that window's lifetime. It is a
regular floating window, so other apps can cover it.

To change the hotkey, open `chrome://extensions/shortcuts`, edit the shortcut,
and keep its scope set to **Global**. Chrome or your operating system may reserve
some combinations. ChromeOS does not support global extension shortcuts.

## Privacy and behavior

- The only requested permission is `storage`. The extension keeps a window ID
  in session memory so Chrome can suspend and restart the background worker
  without losing the chat window.
- It does not read webpages, capture selections, inspect chats, or inject scripts
  into Google. Prompts and responses are handled by Google's website.
- AI Mode requires an internet connection. Google controls its availability,
  account requirements, interface, and saved conversation history.
- The popup opens in a regular browsing window, using that profile's Google
  cookies. Incognito access is not needed.
- Restarting Chrome, reloading, updating, or disabling the extension clears its
  window tracking. Close any old popup before invoking it after an extension
  reload or browser restart to avoid leaving a second restored popup open.

## Troubleshooting

- **The hotkey does nothing:** Confirm Chrome is running and the command is
  assigned with **Global** scope at `chrome://extensions/shortcuts`. If another
  app or extension owns the shortcut, choose a different combination. The
  toolbar button also opens the chat.
- **A red `!` badge appears:** Hover over the toolbar icon for the launch error,
  then click it to retry. A successful operation clears the badge. For details,
  open this extension's **service worker** link in `chrome://extensions`.
- **Google asks you to sign in or AI Mode is unavailable:** Sign in through
  Google's page, or check whether [AI Mode is available for your account and
  region](https://support.google.com/websearch/answer/16011537). The extension
  cannot bypass Google's eligibility checks.
- **The popup is too small:** Resize it using the window edges. Google controls
  the page layout; the extension leaves it unchanged.

## Manual validation

After making changes, reload the extension in `chrome://extensions` and close
any previously opened AI Mode popup.

- [ ] Load unpacked without manifest or service worker errors.
- [ ] Invoke the shortcut from Chrome and from another application.
- [ ] Enter a prompt and an unfinished follow-up, minimize using the shortcut,
      and restore. Confirm the conversation and unfinished input remain.
- [ ] Focus another app while the chat is visible, then invoke the shortcut.
      Confirm it brings the chat forward instead of minimizing it.
- [ ] Press the shortcut rapidly and click the toolbar button repeatedly.
      Confirm there is only one chat window.
- [ ] Close the chat manually, then invoke again to open a new window.
- [ ] Let the service worker become inactive with its DevTools closed, then
      invoke the shortcut. Confirm the same chat window is reused.
- [ ] Resize and move the chat, then minimize and restore it. Confirm the bounds
      remain unchanged, and check Google sign-in and page usability.

Useful references: [Chrome commands](https://developer.chrome.com/docs/extensions/reference/api/commands),
[windows](https://developer.chrome.com/docs/extensions/reference/api/windows),
and [session storage](https://developer.chrome.com/docs/extensions/reference/api/storage).
