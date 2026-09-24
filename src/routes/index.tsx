import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  component: Calculator,
});

const keys = [
  ["AC", "backspace", "%", "÷"],
  ["7", "8", "9", "×"],
  ["4", "5", "6", "−"],
  ["1", "2", "3", "+"],
  ["0", ".", "=", "="],
] as const;

function calculate(a: number, op: string, b: number) {
  if (op === "+") return a + b;
  if (op === "−") return a - b;
  if (op === "×") return a * b;
  if (op === "÷") return b === 0 ? null : a / b;
  return b;
}

function Calculator() {
  const [display, setDisplay] = useState("0");
  const [stored, setStored] = useState<number | null>(null);
  const [operator, setOperator] = useState("");
  const [waiting, setWaiting] = useState(false);

  const inputDigit = (digit: string) => {
    if (waiting || display === "Error") {
      setDisplay(digit);
      setWaiting(false);
      return;
    }
    setDisplay(display === "0" ? digit : display + digit);
  };

  const inputDecimal = () => {
    if (waiting || display === "Error") {
      setDisplay("0.");
      setWaiting(false);
    } else if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  };

  const chooseOperator = (next: string) => {
    const value = Number(display);
    if (display === "Error") return;
    if (stored !== null && operator && !waiting) {
      const result = calculate(stored, operator, value);
      if (result === null) {
        setDisplay("Error");
        setStored(null);
        setOperator("");
        return;
      }
      setStored(result);
      setDisplay(String(result));
    } else {
      setStored(value);
    }
    setOperator(next);
    setWaiting(true);
  };

  const equals = () => {
    if (stored === null || !operator || display === "Error") return;
    const result = calculate(stored, operator, Number(display));
    if (result === null) {
      setDisplay("Error");
    } else {
      setDisplay(String(Number(result.toFixed(10))));
    }
    setStored(null);
    setOperator("");
    setWaiting(true);
  };

  const percent = () => {
    if (display === "Error") return;
    setDisplay(String(Number(display) / 100));
  };

  const clear = () => {
    setDisplay("0");
    setStored(null);
    setOperator("");
    setWaiting(false);
  };

  const backspace = () => {
    if (waiting || display === "Error") return;
    setDisplay(display.length > 1 ? display.slice(0, -1) : "0");
  };

  const press = (key: string) => {
    if (/^\d$/.test(key)) inputDigit(key);
    else if (key === ".") inputDecimal();
    else if (key === "AC") clear();
    else if (key === "backspace") backspace();
    else if (key === "%") percent();
    else if (key === "=") equals();
    else chooseOperator(key);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const map: Record<string, string> = {
        Enter: "=",
        "=": "=",
        Escape: "AC",
        Backspace: "backspace",
        "/": "÷",
        "*": "×",
        "-": "−",
        "+": "+",
        "%": "%",
        ".": ".",
      };
      const key = /^\d$/.test(event.key) ? event.key : map[event.key];
      if (key) {
        event.preventDefault();
        press(key);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-5 px-2">
          <p className="text-sm font-medium text-slate-400">Simple Calculator</p>
          <h1 className="text-2xl font-bold tracking-tight">Kalkulator</h1>
        </div>

        <section className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900 p-4 shadow-2xl">
          <div className="mb-4 flex min-h-28 flex-col items-end justify-end rounded-2xl bg-slate-950 px-5 py-4">
            <div className="mb-1 h-5 text-xs text-slate-500" aria-hidden="true">
              {stored !== null && operator ? `${stored} ${operator}` : ""}
            </div>
            <output
              aria-label="Hasil kalkulator"
              aria-live="polite"
              className="w-full overflow-hidden text-right text-4xl font-semibold tracking-tight"
            >
              {display}
            </output>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {keys.flatMap((row, rowIndex) =>
              row.map((key, colIndex) => {
                const isEquals = key === "=" && rowIndex === keys.length - 1 && colIndex === 2;
                const isZero = rowIndex === keys.length - 1 && colIndex === 0;
                const label = key === "backspace" ? "⌫" : key;
                return (
                  <button
                    key={`${rowIndex}-${colIndex}`}
                    type="button"
                    onClick={() => press(key)}
                    aria-label={key === "backspace" ? "Hapus satu angka" : key}
                    className={[
                      "h-16 rounded-2xl text-lg font-semibold transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-cyan-400",
                      isZero ? "col-span-2" : "",
                      isEquals
                        ? "bg-cyan-400 text-slate-950 hover:bg-cyan-300"
                        : ["÷", "×", "−", "+"].includes(key)
                          ? "bg-cyan-950 text-cyan-300 hover:bg-cyan-900"
                          : ["AC", "backspace", "%"].includes(key)
                            ? "bg-slate-700 text-slate-200 hover:bg-slate-600"
                            : "bg-slate-800 text-white hover:bg-slate-700",
                    ].join(" ")}
                  >
                    {label}
                  </button>
                );
              }),
            )}
          </div>
        </section>

        <p className="mt-4 text-center text-xs text-slate-500">
          Bisa dipakai dengan keyboard juga · Enter = hasil · Esc = reset
        </p>
      </div>
    </main>
  );
}
