document.addEventListener("DOMContentLoaded", () => {
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  let scenario = "Account Takeover";
  let live = true;

  const titles = {
    overview: "Risk Command Center",
    transactions: "Transactions",
    investigator: "AI Transaction Investigator",
    simulator: "Fraud Attack Simulator",
    performance: "AI Model Performance",
    network: "Fraud Network",
    audit: "Decision Audit Trail"
  };

  function money(value) {
    return "₹" + Number(value).toLocaleString("en-IN");
  }

  function toast(message) {
    const t = $("#toast");
    if (!t) return;
    t.textContent = message;
    t.style.display = "block";
    t.style.position = "fixed";
    t.style.right = "20px";
    t.style.bottom = "20px";
    t.style.zIndex = "9999";
    t.style.background = "#17181d";
    t.style.color = "#fff";
    t.style.padding = "14px 18px";
    t.style.borderRadius = "10px";
    t.style.boxShadow = "0 10px 30px rgba(0,0,0,.25)";
    setTimeout(() => { t.style.display = "none"; }, 2200);
  }

  window.toast = toast;

  function go(id) {
    const section = document.getElementById(id);
    if (!section) {
      toast("Page not found: " + id);
      return;
    }

    $$("section").forEach(s => s.classList.remove("active"));
    section.classList.add("active");

    const title = $("#title");
    if (title) title.textContent = titles[id] || "Risk Command Center";

    window.scrollTo({ top: 0, behavior: "smooth" });

    if (id === "transactions") loadTransactions();
  }

  window.go = go;

  $$("[data-go]").forEach(button => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      go(button.dataset.go);
    });
  });

  async function loadTransactions() {
    const tbody = $("#tbody");
    if (!tbody) return;

    const search = $("#search");
    const filter = $("#filter");
    const q = search ? search.value.trim() : "";
    const status = filter ? filter.value : "";

    tbody.innerHTML =
      '<tr><td colspan="7" style="text-align:center;padding:30px">Loading transactions...</td></tr>';

    try {
      const response = await fetch("/api/transactions?q=" + encodeURIComponent(q), {
        cache: "no-store"
      });

      if (!response.ok) throw new Error("Transaction API returned " + response.status);

      let data = await response.json();

      if (status) {
        data = data.filter(t => t.status === status);
      }

      if (!data.length) {
        tbody.innerHTML =
          '<tr><td colspan="7" style="text-align:center;padding:30px">No transactions found.</td></tr>';
        return;
      }

      tbody.innerHTML = data.map(t => {
        const statusClass = String(t.status).toLowerCase();
        return `
          <tr>
            <td><b>${t.id}</b></td>
            <td>${t.name}</td>
            <td>${money(t.amount)}</td>
            <td>${t.location}</td>
            <td class="risk">${t.risk}/100</td>
            <td><span class="status ${statusClass}">${t.status}</span></td>
            <td>
              <button class="action-btn" data-investigate="${t.id}">Investigate</button>
            </td>
          </tr>`;
      }).join("");

      $$("[data-investigate]").forEach(button => {
        button.addEventListener("click", () => investigate(button.dataset.investigate));
      });

    } catch (error) {
      console.error(error);
      tbody.innerHTML =
        '<tr><td colspan="7" style="text-align:center;padding:30px;color:#c33">Could not load transactions. Is Flask running?</td></tr>';
      toast("Transaction API unavailable");
    }
  }

  window.loadTransactions = loadTransactions;

  async function investigate(id) {
    go("investigator");

    const box = $("#invest");
    if (!box) return;

    box.innerHTML = "<h3>🔎 Analyzing transaction...</h3><p>AI is evaluating behavioral signals.</p>";

    try {
      const response = await fetch("/api/investigate/" + encodeURIComponent(id), {
        cache: "no-store"
      });

      if (!response.ok) throw new Error("Investigator API returned " + response.status);

      const data = await response.json();
      const t = data.transaction;

      box.innerHTML = `
        <div>
          <small>AI INVESTIGATION · ${t.id}</small>
          <h2>${t.name} · ${money(t.amount)}</h2>
          <h1>${t.risk}/100</h1>

          ${data.factors.map(f => `
            <div class="factor">
              <b>+${f.score}</b>
              <strong>${f.name}</strong><br>
              <small>${f.reason}</small>
            </div>
          `).join("")}

          <div class="recommend">
            <b>RECOMMENDATION: ${data.recommendation}</b>
            <p>AI confidence: ${data.confidence}%</p>
            <button class="primary decision-btn" data-action="hold">HOLD</button>
            <button class="primary decision-btn" data-action="escalate">ESCALATE</button>
            <button class="secondary decision-btn" data-action="approve">APPROVE</button>
          </div>
        </div>`;

      $$(".decision-btn").forEach(button => {
        button.addEventListener("click", () => {
          toast(button.dataset.action.toUpperCase() + " decision recorded in audit trail");
        });
      });

    } catch (error) {
      console.error(error);
      box.innerHTML = "<h3>Unable to investigate</h3><p>Check that Flask is running.</p>";
      toast("Investigator API unavailable");
    }
  }

  window.investigate = investigate;

  if ($("#search")) {
    $("#search").addEventListener("input", loadTransactions);
  }

  if ($("#filter")) {
    $("#filter").addEventListener("change", loadTransactions);
  }

  const scenarios = [
    "Account Takeover",
    "Card Testing",
    "Transaction Velocity Spike",
    "Refund Abuse",
    "Suspicious Device Cluster",
    "Coordinated Merchant Attack"
  ];

  const scenarioBox = $("#scenarios");
  if (scenarioBox) {
    scenarioBox.innerHTML = scenarios.map((s, index) => `
      <button type="button" class="scenario ${index === 0 ? "selected" : ""}" data-scenario="${s}">
        ${s}
      </button>
    `).join("");

    $$(".scenario").forEach(button => {
      button.addEventListener("click", () => {
        $$(".scenario").forEach(b => b.classList.remove("selected"));
        button.classList.add("selected");
        scenario = button.dataset.scenario;
        toast("Selected: " + scenario);
      });
    });
  }

  const simulateButton = $("#simulate");
  if (simulateButton) {
    simulateButton.addEventListener("click", async () => {
      simulateButton.disabled = true;
      simulateButton.textContent = "Running...";

      try {
        const response = await fetch("/api/simulate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scenario })
        });

        if (!response.ok) throw new Error("Simulation API returned " + response.status);

        const data = await response.json();
        const result = $("#result");

        if (result) {
          result.innerHTML = `
            <div>
              <h3>⚠ ANOMALY DETECTED</h3>
              <p><b>${data.scenario}</b></p>
              <div class="kpis">
                <div class="kpi">Flagged<b>${data.flagged}</b></div>
                <div class="kpi">Accounts<b>${data.accounts}</b></div>
                <div class="kpi">At risk<b>${money(data.amount)}</b></div>
                <div class="kpi">Blocked<b>${data.blocked}</b></div>
                <div class="kpi">Held<b>${data.held}</b></div>
                <div class="kpi">Detection<b>${data.detection} ms</b></div>
              </div>
              <div class="recommend">
                <b>Automated response</b>
                <p>${data.blocked} blocked · ${data.held} held · ${data.review} sent for review.</p>
                <p>Detection confidence: <b>${data.detection}%</b></p>
              </div>
            </div>`;
        }

        toast("Attack simulation completed");
      } catch (error) {
        console.error(error);
        toast("Simulation API unavailable");
      } finally {
        simulateButton.disabled = false;
        simulateButton.textContent = "⚡ Run simulation";
      }
    });
  }

  const liveButton = $("#live");
  if (liveButton) {
    liveButton.addEventListener("click", () => {
      live = !live;
      liveButton.textContent = live ? "● LIVE" : "● PAUSED";
      liveButton.classList.toggle("paused", !live);
      toast(live ? "Live monitoring resumed" : "Live monitoring paused");
    });
  }

  const names = [
    "Rahul Sharma",
    "Priya Nair",
    "Arjun Mehta",
    "Neha Kapoor",
    "Aisha Khan",
    "Vikram Rao",
    "Sneha Iyer",
    "Karan Singh"
  ];

  function stream() {
    const streamBox = $("#stream");
    if (!streamBox || !live) return;

    const name = names[Math.floor(Math.random() * names.length)];
    const amount = Math.floor(Math.random() * 90000) + 500;
    const isHighRisk = amount > 60000;

    const row = document.createElement("div");
    row.style.cssText =
      "padding:12px 0;border-bottom:1px solid #eee;font-size:12px";

    row.innerHTML = `
      ${new Date().toLocaleTimeString()} · ${name} · <b>${money(amount)}</b>
      · <span class="status ${isHighRisk ? "held" : "approved"}">
      ${isHighRisk ? "Held" : "Approved"}</span>`;

    streamBox.prepend(row);

    while (streamBox.children.length > 6) {
      streamBox.lastElementChild.remove();
    }
  }

  for (let i = 0; i < 5; i++) stream();
  setInterval(stream, 3000);

  loadTransactions();
});
