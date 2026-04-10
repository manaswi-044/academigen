// Simple wrapper to load pyodide dynamically via CDN

let pyodideInstance: any = null;

export async function runPythonCode(code: string): Promise<string> {
  try {
    if (!pyodideInstance) {
      if (typeof window === "undefined") {
        throw new Error("Pyodide can only run in the browser");
      }
      
      // Load script dynamically
      const pyodideScript = document.createElement("script");
      pyodideScript.src = "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js";
      document.head.appendChild(pyodideScript);
      
      await new Promise((resolve, reject) => {
        pyodideScript.onload = resolve;
        pyodideScript.onerror = reject;
      });

      try {
        // @ts-ignore
        pyodideInstance = await window.loadPyodide();
      } catch (loadError) {
        throw new Error("Unable to load Python execution environment. If you are offline, it may not be cached yet.");
      }
    }

    // Redirect stdout to capture print() statements
    await pyodideInstance.runPythonAsync(`
import sys
import io
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()
    `);

    // Execute the user code
    await pyodideInstance.runPythonAsync(code);

    // Fetch the captured stdout
    const stdout = await pyodideInstance.runPythonAsync("sys.stdout.getvalue()");
    const stderr = await pyodideInstance.runPythonAsync("sys.stderr.getvalue()");

    return stdout + (stderr ? "\nErrors:\n" + stderr : "");
  } catch (error: any) {
    return "Error executing Python:\n" + error.message;
  }
}
