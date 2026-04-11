/**
 * Piston API execution service.
 * Handles server-side execution of C, C++, Java, and SQL code.
 * Python is handled client-side via Pyodide (browser WASM).
 *
 * Piston is a free, open-source remote code execution engine.
 * Public instance: https://emkc.org/api/v2/piston
 */

const PISTON_URL = "https://emkc.org/api/v2/piston";

const LANGUAGE_MAP: Record<string, { language: string; version: string; filename: string }> = {
  "C":    { language: "c",    version: "10.2.0", filename: "main.c" },
  "C++":  { language: "cpp",  version: "10.2.0", filename: "main.cpp" },
  "C / C++": { language: "c", version: "10.2.0", filename: "main.c" },
  "Java": { language: "java", version: "15.0.2", filename: "Main.java" },
  "SQL":  { language: "sqlite3", version: "3.36.0", filename: "main.sql" },
};

export interface ExecuteResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  language: string;
}

export async function executeWithPiston(
  code: string,
  language: string
): Promise<ExecuteResult> {
  const langConfig = LANGUAGE_MAP[language];

  if (!langConfig) {
    throw new Error(`Language "${language}" not supported by Piston. Use Python (runs in-browser), C, C++, Java, or SQL.`);
  }

  const response = await fetch(`${PISTON_URL}/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      language: langConfig.language,
      version: langConfig.version,
      files: [{ name: langConfig.filename, content: code }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Piston API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const run = data.run ?? {};

  return {
    stdout: run.stdout ?? "",
    stderr: run.stderr ?? "",
    exitCode: run.code ?? 0,
    language,
  };
}
