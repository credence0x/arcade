import { createRoot } from "react-dom/client";
import { SonnerToaster } from "@cartridge/ui-next";
import { App } from "@/components/app";
import { Provider } from "@/context";
import { registerSW } from "virtual:pwa-register";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";

registerSW();

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="player/:player" element={<ProvidedApp />}>
        <Route path="tab/:tab" element={<ProvidedApp />} />
      </Route>
      <Route path="game/:game" element={<ProvidedApp />}>
        <Route path="tab/:tab" element={<ProvidedApp />} />
        <Route path="player/:player" element={<ProvidedApp />}>
          <Route path="tab/:tab" element={<ProvidedApp />} />
        </Route>
        <Route path="edition/:edition" element={<ProvidedApp />}>
          <Route path="tab/:tab" element={<ProvidedApp />} />
          <Route path="player/:player" element={<ProvidedApp />}>
            <Route path="tab/:tab" element={<ProvidedApp />} />
          </Route>
        </Route>
      </Route>
      <Route path="tab/:tab" element={<ProvidedApp />} />
      <Route path="*" element={<ProvidedApp />} />
    </Routes>
    <SonnerToaster position="top-center" />
  </BrowserRouter>,
);

function ProvidedApp() {
  return (
    <Provider>
      <App />
    </Provider>
  );
}
