# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    ## This folder now includes a minimal frontend and backend dev setup

    I've added a tiny Express session server under `server/` and wired the repository scripts so you can run both the Vite frontend and the session server concurrently.

    What I changed

    - Added `server/index.js` — an Express app that exposes `/session` using the Chainrails SDK (example server code provided in your request).
    - Added `server/package.json` and `server/.env.example` for local configuration.
    - Updated this package's `package.json` to add a `dev` script that runs both the frontend and server concurrently (uses `concurrently`).

    Quick start (in `modal/react`)

    1. Install dependencies for both frontend and server:

    ```bash
    npm run install:all
    ```

    2. Copy `server/.env.example` to `server/.env` and set `CHAINRAILS_API_KEY` and `CHAINRAILS_DOMAIN_WHITELIST` (e.g. `http://localhost:5173`).

    3. Run both frontend and server at once:

    ```bash
    npm run dev
    ```

    The frontend runs with Vite (default port 5173). The session server runs on port 4000 by default. The demo frontend already points its session URL to `http://localhost:4000/session` and uses the `usePaymentSession` hook.

    Notes

    - The server uses the Chainrails SDK's `crapi.auth.getSessionToken` call. Make sure your `CHAINRAILS_API_KEY` is set in `server/.env` before starting the server.
    - The server returns whatever the SDK returns from the `getSessionToken` call. In production you should validate inputs and authenticate the requestor.

    If you'd like, I can convert this into a more formal npm workspace layout (moving the frontend into `packages/frontend`) — I kept the existing frontend files in place to minimize churn. 
