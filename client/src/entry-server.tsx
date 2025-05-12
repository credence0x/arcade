import { renderToString } from "react-dom/server";
import { HelmetProvider, HelmetData } from "react-helmet-async";
import { StaticRouter } from "react-router-dom/server";
import { App } from "./components/app"; // Assuming App component is here
import { Provider } from "./context"; // Assuming context Provider is here

// Define the type for the helmet context object
interface HelmetContext {
  helmet?: HelmetData; // Use HelmetData type
}

interface RenderResult {
  html: string;
  helmet: HelmetData; // Use HelmetData type
}

// Function to create a default, empty HelmetData instance
const createDefaultHelmetData = (): HelmetData => {
  // This is a workaround; ideally, HelmetData constructor handles this.
  // We create an object that conforms to the structure Helmet expects for its .toString() methods.
  const emptyHelmetData = {
    toString: () => "",
    base: { toString: () => "" },
    bodyAttributes: { toString: () => "" },
    htmlAttributes: { toString: () => "" },
    link: { toString: () => "" },
    meta: { toString: () => "" },
    noscript: { toString: () => "" },
    script: { toString: () => "" },
    style: { toString: () => "" },
    title: { toString: () => "" },
  };
  // Cast to unknown first, then to HelmetData to satisfy the type checker.
  return emptyHelmetData as unknown as HelmetData;
};

// The context parameter is kept for potential future use, but marked optional.
// If definitely unused, it could be removed entirely.
export function render(url: string, _context?: unknown): RenderResult {
  // Prefix with _ to denote unused
  const helmetContext: HelmetContext = {}; // Use the defined interface

  const appHtml = renderToString(
    <HelmetProvider context={helmetContext}>
      <Provider>
        <StaticRouter location={url}>
          <App />
        </StaticRouter>
      </Provider>
    </HelmetProvider>
  );

  // Use the function to get a default HelmetData if needed
  const helmet = helmetContext.helmet || createDefaultHelmetData();

  return {
    html: appHtml,
    helmet, // Contains title, meta, link etc. tags
  };
}
