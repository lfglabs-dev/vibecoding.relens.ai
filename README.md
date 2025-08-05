# 🧠 Vibecoding Leaderboard — Methodology

The Vibecoding Leaderboard is a new way to benchmark how well AI models *actually code* — not just talk about code. It evaluates real-world performance across a wide range of technologies using a rigorous, multi-step process.

---

## ⚙️ How It Works

### 1. Prompt → Code → Execution → Validation

Each AI model is tested using two autonomous agents:

- **Querier Agent**  
  Prompts the AI to generate code, compiles it, runs it in a sandboxed Docker environment, and submits the output.

- **Quantifier Agent**  
  Independently validates the results using logs, outputs, tests, and other tooling. It ensures no model is judged by its own hallucinated standard.

---

## 📊 Scoring Dimensions

Each AI is scored across multiple objective dimensions:

| Category               | What It Measures |
|------------------------|------------------|
| ✅ **Compilation**      | Does the code build and run successfully? |
| 🧠 **Code Quality**     | Is the code idiomatic, minimal, and correct? |
| 🔐 **Security Awareness** | Does it handle secrets, roles, and permissions properly? |
| 🧰 **Helpfulness**      | Is the response contextual, version-aware, and good at diagnosing issues? |

Only answers that **compile, pass all validations, and demonstrate good practice** receive top scores (9–10).

---

## 🏆 Why It Matters

Most AI coding benchmarks rely on static comparisons or hallucinated metrics. Vibecoding simulates *real developer workflows* — run the code, test the output, and judge only with objective evidence.

No more hand-wavy "correctness" claims. This leaderboard tracks whether AI can *vibe* like a real engineer.

> Learn more at [relens.ai](https://relens.ai/blog/vibecoding-leaderboard-methodology)

