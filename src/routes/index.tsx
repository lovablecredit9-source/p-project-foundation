import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  component: Calculator,
});

const buttons = [
  ["AC", "⌫", "%", "÷"],
  ["7", "8", "9", "×"],
  ["4", "5", "6", "−"],
  ["1", "2", "3", "+"],
  ["0", ".", "="],
];

function operate(a: number, op: string, b: number) {
  if (op === "+") return a + b;
  if (op === "−") return a - b;
  if (op === "×") return a * b;
  if (op === "÷") return b === 0 ? null : a / b;
  return b;
}

function Calculator() {
  const [display, setDisplay] = useState("0");
  const [first, setFirst] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [resetDisplay, setResetDisplay] = useState(false);

  const press = (key: string) => {
    if (/^\d$/.test(key)) {
      setDisplay((current) =>
        resetDisplay || current === "Error" || current === "0" ? key : current + key,
      );
      setResetDisplay(false);
      return;
    }

    if (key === ".") {
      if (resetDisplay || display === "Error") {
        setDisplay("0.");
        setResetDisplay(false);
      } else if (!display.includes(".")) {
        setDisplay((current) => current + ".");
      }
      return;
    }

    if (key === "AC") {
      setDisplay("0");
      setFirst(null);
      setOp(null);
      setResetDisplay(false);
      return;
    }

    if (key === "⌫") {
      if (!resetDisplay && display !== "Error") {
        setDisplay((current) => current.length > 1 ? current.slice(0, -1) : "0");
      }
      return;
    }

    if (key === "%") {
      if (display !== "Error") setDisplay(String(Number(display) / 100));
      return;
    }

    if (["+", "−", "×", "÷"].includes(key)) {
      const value = Number(display);
      if (display === "Error") return;

      if (first !== null && op && !resetDisplay) {
        const result = operate(first, op, value);
        if (result === null) {
          setDisplay("Error");
          setFirst(null);
          setOp(null);
          setResetDisplay(true);
          return;
        }
        setFirst(result);
        setDisplay(String(result));
      } else {
        setFirst(value);
      }
      setOp(key);
      setResetDisplay(true);
      return;
    }

    if (key === "=" && first !== null && op && display !== "Error") {
      const result = operate(first, op, Number(display));
      if (result === null) {
        setDisplay("Error");
      } else {
        setDisplay(String(Number(result.toFixed(10))));
      }
      setFirst(null);
      setOp(null);
      setResetDisplay(true);
    }
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const mapped: Record<string, string> = {
        Enter: "=",
        "=": "=",
        Escape: "AC",
        Backspace: "⌫",
        "/": "÷",
        "*": "×",
        "-": "−",
        "+": "+",
        "%": "%",
        ".": ".",
      };
      const key = /^\d$/.test(event.key) ? event.key : mapped[event.key];
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
        <header className="mb-5 px-2">
          <p className="text-sm font-medium text-slate-400">Simple Calculator</p>
          <h1 className="text-2xl font-bold">Kalkulator</h1>
        </header>

        <section className="rounded-3xl border border-white/10 bg-slate-900 p-4 shadow-2xl">
          <div className="mb-4 flex min-h-28 items-end justify-end rounded-2xl bg-slate-950 px-5 py-4">
            <output aria-label="Hasil kalkulator" aria-live="polite" className="w-full overflow-hidden text-right text-4xl font-semibold">
              {display}
            </output>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {buttons.flatMap((row, rowIndex) =>
              row.map((key, colIndex) => {
                const equals = key === "=";
                const zero = rowIndex === 4 && colIndex === 0;
                const utility = ["AC", "⌫", "%"].includes(key);
                const operator = ["÷", "×", "−", "+"].includes(key);

                return (
                  <button
                    key={`${rowIndex}-${colIndex}`}
                    type="button"
                    onClick={() => press(key)}
                    aria-label={key === "⌫" ? "Hapus satu angka" : key}
                    className={[
                      "h-16 rounded-2xl text-lg font-semibold transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-cyan-400",
                      zero ? "col-span-2" : "",
                      equals ? "bg-cyan-400 text-slate-950 hover:bg-cyan-300"
                        : operator ? "bg-cyan-950 text-cyan-300 hover:bg-cyan-900"
                        : utility ? "bg-slate-700 text-slate-100 hover:bg-slate-600"
                        : "bg-slate-800 hover:bg-slate-700",
                    ].join(" ")}
                  >
                    {key}
                  </button>
                );
              }),
            )}
          </div>
        </section>

        <p className="mt-4 text-center text-xs text-slate-500">
          Keyboard: Enter = hasil · Esc = reset
        </p>
      </div>
    </main>
  );
}
