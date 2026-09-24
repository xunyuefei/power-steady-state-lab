import katex from "katex";
import "katex/dist/katex.min.css";
import { MODULES } from "./modulesData.js";
import {
  calcModule1,
  calcModule2,
  calcModule3,
  calcModule4,
  calcModule5,
  calcModule6,
  calcModule7,
  calcModule8,
  calcModule9
} from "./calculations.js";
import {
  drawPhasorCanvas,
  renderRingNetworkSVG,
  renderPiCircuitSVG,
  renderThreeWindingStarSVG,
  renderTwoWindingGammaSVG
} from "./diagrams.js";
import { round } from "./mathUtils.js";

// Global State
let currentModuleId = 1;
let currentModule9Submode = "1";
let currentPresetIndex = 0;
let dynamicNodes = [];
let lastCalculationResult = null;
let fieldUnits = {}; // Dynamic unit mapping e.g. { P_k: "kW", Q_k: "kVar" }

// DOM Elements
const modulesNavList = document.getElementById("modules-nav-list");
const currentModuleTitle = document.getElementById("current-module-title");
const currentModuleIcon = document.getElementById("current-module-icon");
const currentModuleName = document.getElementById("current-module-name");
const currentModuleBadge = document.getElementById("current-module-badge");
const currentModuleFormula = document.getElementById("current-module-formula");
const currentModuleDesc = document.getElementById("current-module-desc");
const presetCaseName = document.getElementById("preset-case-name");
const btnLoadPreset = document.getElementById("btn-load-preset");
const presetMenu = document.getElementById("preset-menu");
const btnReloadPreset = document.getElementById("btn-reload-preset");
const btnCalculate = document.getElementById("btn-calculate");
const btnResetForm = document.getElementById("btn-reset-form");
const btnCopyReport = document.getElementById("btn-copy-report");
const btnThemeToggle = document.getElementById("btn-theme-toggle");
const dynamicFormFields = document.getElementById("dynamic-form-fields");

const summaryCardsContainer = document.getElementById("summary-cards-container");
const stepsContainer = document.getElementById("steps-container");
const diagramContainer = document.getElementById("diagram-container");
const phasorCanvas = document.getElementById("phasor-canvas");
const svgCircuitWrapper = document.getElementById("svg-circuit-wrapper");
const trapAlertText = document.getElementById("trap-alert-text");

// Initialize Application
function init() {
  renderSidebarNav();
  setupEventListeners();

  // Restore saved module from localStorage if available
  const savedModId = parseInt(localStorage.getItem("power_lab_active_module") || "1", 10);
  loadModule(savedModId || 1);
}

// Render Sidebar Navigation
function renderSidebarNav() {
  modulesNavList.innerHTML = MODULES.map(m => `
    <li class="module-item ${m.id === currentModuleId ? 'active' : ''}" data-id="${m.id}">
      <span class="module-icon">${m.icon}</span>
      <div class="module-info">
        <div class="module-title">${m.shortName}</div>
        <span class="module-badge">${m.badge}</span>
      </div>
    </li>
  `).join("");

  modulesNavList.querySelectorAll(".module-item").forEach(item => {
    item.addEventListener("click", () => {
      const id = parseInt(item.getAttribute("data-id"), 10);
      loadModule(id);
    });
  });
}

// Load Module
function loadModule(id) {
  currentModuleId = id;
  localStorage.setItem("power_lab_active_module", id);

  const mod = MODULES.find(m => m.id === id);
  if (!mod) return;

  currentPresetIndex = 0;
  fieldUnits = {}; // reset unit switches

  // Update Nav
  modulesNavList.querySelectorAll(".module-item").forEach(item => {
    item.classList.toggle("active", parseInt(item.getAttribute("data-id"), 10) === id);
  });

  // Update Header Banner
  currentModuleIcon.textContent = mod.icon;
  currentModuleName.textContent = mod.name;
  currentModuleBadge.textContent = mod.badge;
  currentModuleDesc.textContent = mod.description;

  // Render LaTeX Formula in Hero
  renderLatex(currentModuleFormula, mod.latexFormula || mod.formula);

  // Update Preset Dropdown & Banner
  updatePresetMenu(mod);
  updatePresetBanner(mod);

  // Build Form Fields
  renderFormFields(mod);

  // Load Preset
  applyPreset(mod, 0);
}

// Helper to render KaTeX safely
function renderLatex(element, texString, displayMode = false) {
  if (!element) return;
  try {
    katex.render(texString, element, {
      displayMode: displayMode,
      throwOnError: false
    });
  } catch (err) {
    element.textContent = texString;
  }
}

// Preset Menu Generator
function updatePresetMenu(mod) {
  const presets = mod.presets || [];
  presetMenu.innerHTML = presets.map((p, idx) => `
    <button class="preset-menu-item ${idx === currentPresetIndex ? 'active' : ''}" data-idx="${idx}">
      <span style="font-weight: bold;">${idx + 1}. ${p.name}</span>
      <span style="font-size: 0.72rem; color: var(--text-dim);">${p.submode ? `(模式 ${p.submode})` : ''}</span>
    </button>
  `).join("");

  presetMenu.querySelectorAll(".preset-menu-item").forEach(item => {
    item.addEventListener("click", () => {
      const idx = parseInt(item.getAttribute("data-idx"), 10);
      currentPresetIndex = idx;
      presetMenu.classList.remove("show");
      applyPreset(mod, idx);
      updatePresetBanner(mod);
    });
  });
}

function updatePresetBanner(mod) {
  const p = mod.presets && mod.presets[currentPresetIndex];
  presetCaseName.textContent = p ? p.name : "标准算例";
}

// Apply Preset Data
function applyPreset(mod, idx) {
  const p = mod.presets && mod.presets[idx];
  if (!p) return;

  if (mod.id === 3) {
    document.getElementById("inp-R_sum").value = p.values.R_sum;
    document.getElementById("inp-X_sum").value = p.values.X_sum;
    dynamicNodes = JSON.parse(JSON.stringify(p.values.nodes));
    renderNodeRows();
  } else if (mod.id === 9) {
    if (p.submode) {
      currentModule9Submode = p.submode;
      renderModule9Fields(mod);
    }
    const vals = currentModule9Submode === "1" ? (p.valuesMode1 || p.values) : (p.valuesMode2 || p.values);
    if (vals) {
      Object.keys(vals).forEach(key => {
        const el = document.getElementById(`inp-${key}`);
        if (el) el.value = vals[key];
      });
    }
  } else {
    Object.keys(p.values).forEach(key => {
      const el = document.getElementById(`inp-${key}`);
      if (el) el.value = p.values[key];
    });
  }

  triggerCalculation();
}

// Render Form Fields
function renderFormFields(mod) {
  if (mod.id === 3) {
    renderModule3Fields(mod);
  } else if (mod.id === 9) {
    renderModule9Fields(mod);
  } else {
    let html = `<div class="form-grid">`;
    mod.fields.forEach(f => {
      if (f.type === "select") {
        html += `
          <div class="form-group col-span-2">
            <label class="form-label" for="inp-${f.id}">
              <span>${f.label}</span>
              ${f.unit ? `<span class="unit-badge">${f.unit}</span>` : ""}
            </label>
            <select class="form-select" id="inp-${f.id}">
              ${f.options.map(opt => `<option value="${opt.value}">${opt.text}</option>`).join("")}
            </select>
            ${f.hint ? `<span class="form-hint">${f.hint}</span>` : ""}
          </div>
        `;
      } else {
        const canToggle = f.canToggleUnit;
        const currentUnit = fieldUnits[f.id] || f.unit;
        fieldUnits[f.id] = currentUnit;

        html += `
          <div class="form-group">
            <label class="form-label" for="inp-${f.id}">
              <span>${f.label}</span>
              <span class="unit-badge ${canToggle ? 'unit-badge-clickable' : ''}" 
                    id="badge-${f.id}" 
                    data-field="${f.id}"
                    title="${canToggle ? '点击快速切换单位 (如 kW / MW)' : ''}">
                ${currentUnit} ${canToggle ? '⇄' : ''}
              </span>
            </label>
            <div class="input-wrapper">
              <input type="number" step="any" class="form-input" id="inp-${f.id}" placeholder="输入纯数字">
            </div>
            ${f.hint ? `<span class="form-hint">${f.hint}</span>` : ""}
          </div>
        `;
      }
    });
    html += `</div>`;
    dynamicFormFields.innerHTML = html;

    // Attach unit toggle listeners
    dynamicFormFields.querySelectorAll(".unit-badge-clickable").forEach(badge => {
      badge.addEventListener("click", () => {
        const fieldId = badge.getAttribute("data-field");
        toggleUnit(fieldId);
      });
    });
  }

  // Live calculation binding
  dynamicFormFields.querySelectorAll("input, select").forEach(el => {
    el.addEventListener("input", debounceCalculate);
    el.addEventListener("change", debounceCalculate);
  });
}

// Unit Toggle Handler (kW <-> MW, kVar <-> MVar)
function toggleUnit(fieldId) {
  const badge = document.getElementById(`badge-${fieldId}`);
  const input = document.getElementById(`inp-${fieldId}`);
  if (!badge || !input) return;

  const currentUnit = fieldUnits[fieldId];
  let newUnit = currentUnit;
  let val = parseFloat(input.value);

  if (currentUnit === "kW") {
    newUnit = "MW";
    if (!isNaN(val)) input.value = round(val / 1000, 4);
  } else if (currentUnit === "MW") {
    newUnit = "kW";
    if (!isNaN(val)) input.value = round(val * 1000, 2);
  } else if (currentUnit === "kVar") {
    newUnit = "MVar";
    if (!isNaN(val)) input.value = round(val / 1000, 4);
  } else if (currentUnit === "MVar") {
    newUnit = "kVar";
    if (!isNaN(val)) input.value = round(val * 1000, 2);
  }

  fieldUnits[fieldId] = newUnit;
  badge.innerHTML = `${newUnit} ⇄`;
  triggerCalculation();
}

// Module 3 Form Fields
function renderModule3Fields(mod) {
  let html = `
    <div class="form-grid" style="margin-bottom: 14px;">
      <div class="form-group">
        <label class="form-label" for="inp-R_sum">
          <span>环路全网总电阻 R_Σ</span>
          <span class="unit-badge">Ω</span>
        </label>
        <input type="number" step="any" class="form-input" id="inp-R_sum" value="20">
      </div>
      <div class="form-group">
        <label class="form-label" for="inp-X_sum">
          <span>环路全网总电抗 X_Σ</span>
          <span class="unit-badge">Ω</span>
        </label>
        <input type="number" step="any" class="form-input" id="inp-X_sum" value="48">
      </div>
    </div>

    <div class="nodes-manager">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <span style="font-size: 0.85rem; font-weight: 700; color: var(--accent-cyan);">
          📌 运算负荷节点列表 (<span id="nodes-count">0</span> 个)
        </span>
        <button type="button" id="btn-add-node" class="btn btn-secondary" style="padding: 4px 10px; font-size: 0.75rem;">
          + 添加负荷节点
        </button>
      </div>
      <div id="nodes-container" style="display: flex; flex-direction: column; gap: 8px;"></div>
    </div>
  `;
  dynamicFormFields.innerHTML = html;

  document.getElementById("btn-add-node").addEventListener("click", () => {
    addNodeRow({ P: 10000, Q: 8000, R_iB: 5.0, X_iB: 12.0 });
    triggerCalculation();
  });
}

function renderNodeRows() {
  const container = document.getElementById("nodes-container");
  const countSpan = document.getElementById("nodes-count");
  if (!container) return;

  countSpan.textContent = dynamicNodes.length;
  container.innerHTML = dynamicNodes.map((n, idx) => `
    <div class="node-row-card" data-idx="${idx}">
      <div class="node-row-header">
        <span>负荷节点 ${idx + 1}</span>
        ${dynamicNodes.length > 1 ? `<button type="button" class="btn-remove-node" data-idx="${idx}" style="background: none; border: none; color: var(--accent-rose); cursor: pointer; font-size: 0.75rem;">删除节点</button>` : ""}
      </div>
      <div class="node-inputs-grid">
        <div>
          <label style="font-size: 0.7rem; color: var(--text-dim);">P (kW)</label>
          <input type="number" step="any" class="form-input node-inp-p" value="${n.P}">
        </div>
        <div>
          <label style="font-size: 0.7rem; color: var(--text-dim);">Q (kVar)</label>
          <input type="number" step="any" class="form-input node-inp-q" value="${n.Q}">
        </div>
        <div>
          <label style="font-size: 0.7rem; color: var(--text-dim);">R_iB (Ω)</label>
          <input type="number" step="any" class="form-input node-inp-r" value="${n.R_iB}">
        </div>
        <div>
          <label style="font-size: 0.7rem; color: var(--text-dim);">X_iB (Ω)</label>
          <input type="number" step="any" class="form-input node-inp-x" value="${n.X_iB}">
        </div>
      </div>
    </div>
  `).join("");

  container.querySelectorAll(".btn-remove-node").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const idx = parseInt(e.target.getAttribute("data-idx"), 10);
      dynamicNodes.splice(idx, 1);
      renderNodeRows();
      triggerCalculation();
    });
  });

  container.querySelectorAll("input").forEach(inp => {
    inp.addEventListener("input", () => {
      syncDynamicNodesFromDOM();
      debounceCalculate();
    });
  });
}

function syncDynamicNodesFromDOM() {
  const container = document.getElementById("nodes-container");
  if (!container) return;
  const cards = container.querySelectorAll(".node-row-card");
  dynamicNodes = Array.from(cards).map(card => ({
    P: parseFloat(card.querySelector(".node-inp-p").value) || 0,
    Q: parseFloat(card.querySelector(".node-inp-q").value) || 0,
    R_iB: parseFloat(card.querySelector(".node-inp-r").value) || 0,
    X_iB: parseFloat(card.querySelector(".node-inp-x").value) || 0
  }));
}

function addNodeRow(nodeData) {
  dynamicNodes.push(nodeData);
  renderNodeRows();
}

// Module 9 Form Fields
function renderModule9Fields(mod) {
  let html = `
    <div class="submode-tabs" style="margin-bottom: 14px;">
      <button type="button" class="submode-btn ${currentModule9Submode === '1' ? 'active' : ''}" data-submode="1">
        模式 1：已知单位参数求集中 π 型
      </button>
      <button type="button" class="submode-btn ${currentModule9Submode === '2' ? 'active' : ''}" data-submode="2">
        模式 2：几何尺寸推导 x1, b1
      </button>
    </div>
    <div id="m9-fields-container"></div>
  `;
  dynamicFormFields.innerHTML = html;

  const m9Tabs = dynamicFormFields.querySelectorAll(".submode-btn");
  m9Tabs.forEach(btn => {
    btn.addEventListener("click", () => {
      currentModule9Submode = btn.getAttribute("data-submode");
      m9Tabs.forEach(b => b.classList.toggle("active", b === btn));
      renderModule9SubFields(mod);
      applyPreset(mod, currentPresetIndex);
    });
  });

  renderModule9SubFields(mod);
}

function renderModule9SubFields(mod) {
  const container = document.getElementById("m9-fields-container");
  if (!container) return;

  const fields = currentModule9Submode === "1" ? mod.fieldsMode1 : mod.fieldsMode2;
  let html = `<div class="form-grid">`;
  fields.forEach(f => {
    html += `
      <div class="form-group">
        <label class="form-label" for="inp-${f.id}">
          <span>${f.label}</span>
          <span class="unit-badge">${f.unit}</span>
        </label>
        <div class="input-wrapper">
          <input type="number" step="any" class="form-input" id="inp-${f.id}" placeholder="输入纯数字">
        </div>
        ${f.hint ? `<span class="form-hint">${f.hint}</span>` : ""}
      </div>
    `;
  });
  html += `</div>`;
  container.innerHTML = html;

  container.querySelectorAll("input").forEach(el => {
    el.addEventListener("input", debounceCalculate);
  });
}

// Collect Inputs with Unit Normalization
function collectCurrentInputs() {
  const inputs = {};

  if (currentModuleId === 3) {
    inputs.R_sum = parseFloat(document.getElementById("inp-R_sum")?.value) || 0;
    inputs.X_sum = parseFloat(document.getElementById("inp-X_sum")?.value) || 0;
    syncDynamicNodesFromDOM();
    inputs.nodes = dynamicNodes;
  } else if (currentModuleId === 9) {
    inputs.subChoice = currentModule9Submode;
    const mod = MODULES.find(m => m.id === 9);
    const fields = currentModule9Submode === "1" ? mod.fieldsMode1 : mod.fieldsMode2;
    fields.forEach(f => {
      const el = document.getElementById(`inp-${f.id}`);
      inputs[f.id] = el ? el.value : "";
    });
  } else {
    const mod = MODULES.find(m => m.id === currentModuleId);
    if (mod && mod.fields) {
      mod.fields.forEach(f => {
        const el = document.getElementById(`inp-${f.id}`);
        let rawVal = el ? el.value : "";
        let numVal = parseFloat(rawVal);

        // Unit normalization: If user toggled to MW or MVar, convert to kW/kVar internally
        if (!isNaN(numVal)) {
          const unit = fieldUnits[f.id];
          if (unit === "MW" || unit === "MVar") {
            numVal = numVal * 1000;
          }
        }
        inputs[f.id] = isNaN(numVal) ? rawVal : numVal;
      });
    }
  }

  return inputs;
}

// Trigger Core Calculation
function triggerCalculation() {
  const inputs = collectCurrentInputs();
  let result = null;

  try {
    switch (currentModuleId) {
      case 1: result = calcModule1(inputs); break;
      case 2: result = calcModule2(inputs); break;
      case 3: result = calcModule3(inputs); break;
      case 4: result = calcModule4(inputs); break;
      case 5: result = calcModule5(inputs); break;
      case 6: result = calcModule6(inputs); break;
      case 7: result = calcModule7(inputs); break;
      case 8: result = calcModule8(inputs); break;
      case 9: result = calcModule9(inputs); break;
    }
  } catch (err) {
    console.error("计算异常:", err);
    summaryCardsContainer.innerHTML = `<div style="color: var(--accent-rose); font-weight: bold;">计算出错: ${err.message}</div>`;
    return;
  }

  lastCalculationResult = { moduleId: currentModuleId, inputs, result };
  renderCalculationResults(lastCalculationResult);
}

// Render Results
function renderCalculationResults({ moduleId, inputs, result }) {
  if (!result) return;

  renderSummaryCards(moduleId, result);
  renderStepCards(result.steps || []);
  renderDiagrams(moduleId, inputs, result);
  trapAlertText.textContent = result.trapTip || "暂无专属避坑提示";
}

// Render Summary Cards
function renderSummaryCards(moduleId, res) {
  let cards = [];

  if (moduleId === 1) {
    cards = [
      { label: "纵分量 (电压损耗 ΔU)", val: round(res.dU, 4), unit: "kV", accent: "accent-amber" },
      { label: "横分量 (δU)", val: round(res.du, 4), unit: "kV", accent: "accent-purple" },
      { label: "对端实际电压模长", val: round(res.U_end, 4), unit: "kV", accent: "accent-emerald" },
      { label: "相角偏移量 ∠δ", val: round(res.angDeg, 4), unit: "°", accent: "accent-rose" }
    ];
  } else if (moduleId === 2) {
    cards = [
      { label: "串联有功损耗 (ΔP)", val: round(res.dP_k, 2), unit: "kW (" + round(res.dP_M, 4) + " MW)", accent: "accent-amber" },
      { label: "串联无功损耗 (ΔQ)", val: round(res.dQ_k, 2), unit: "kVar (" + round(res.dQ_M, 4) + " MVar)", accent: "accent-purple" },
      { label: "单侧充电无功 (Qc)", val: round(res.Qc_k, 2), unit: "kVar (向系统注入)", accent: "accent-emerald" }
    ];
  } else if (moduleId === 3) {
    cards = [
      { label: "A端送出功率 (S_A)", val: res.S_A.toString(1), unit: "kVA", accent: "accent-cyan" },
      { label: "B端送出功率 (S_B)", val: res.S_B.toString(1), unit: "kVA", accent: "accent-emerald" },
      { label: "★ 有功功率分界点", val: `节点 ${res.activeSplitNode}`, unit: "两端有功在此汇聚", accent: "accent-amber" },
      { label: "★ 无功分界点 (最低压)", val: `节点 ${res.reactiveSplitNode}`, unit: "通常为全网最低电压点", accent: "accent-rose" }
    ];
  } else if (moduleId === 4) {
    cards = [
      { label: "循环功率 Sc (MVA级别)", val: res.Sc_MVA.toString(4), unit: "MVA (A流向B为正)", accent: "accent-cyan" },
      { label: "循环功率 Sc (kVA级别)", val: res.Sc_kVA.toString(2), unit: "kVA", accent: "accent-amber" },
      { label: "相量压差模长 |ΔU|", val: round(res.deltaU.mag(), 3), unit: "kV (∠ " + round(res.deltaU.deg(), 2) + "°)", accent: "accent-purple" }
    ];
  } else if (moduleId === 5) {
    cards = [
      { label: "自然功率模长 |Sn|", val: round(res.Sn.mag(), 4), unit: "MVA", accent: "accent-emerald" },
      { label: "复数自然功率", val: res.Sn.toString(4), unit: "MVA", accent: "accent-cyan" }
    ];
  } else if (moduleId === 6) {
    cards = [
      { label: "串联等效电阻 (Rt)", val: round(res.Rt, 4), unit: "Ω", accent: "accent-amber" },
      { label: "串联等效电抗 (Xt)", val: round(res.Xt, 4), unit: "Ω", accent: "accent-cyan" },
      { label: "励磁并联电导 (Gt)", val: round(res.Gt_uS, 4), unit: "μS", accent: "accent-purple" },
      { label: "励磁并联电纳 (Bt)", val: round(res.Bt_uS, 4), unit: "μS", accent: "accent-emerald" }
    ];
  } else if (moduleId === 7) {
    cards = [
      { label: "运行负载率 β", val: round(res.beta * 100, 2) + "%", unit: "模长比 (S/Sn = " + round(res.beta, 4) + ")", accent: "accent-cyan" },
      { label: "变压器铁损 (ΔP0+jΔQ0)", val: `${round(res.dP0_kw, 2)} + j${round(res.dQ0_kvar, 2)}`, unit: "kVA", accent: "accent-purple" },
      { label: "运行铜损 (当前负载率)", val: `${round(res.dPk_kw_actual, 2)} + j${round(res.dQk_kvar_actual, 2)}`, unit: "kVA", accent: "accent-amber" },
      { label: "最终等效运算负荷 S'", val: `${round(res.P_op, 2)} + j${round(res.Q_op, 2)}`, unit: "kVA (已扣除对地Qc)", accent: "accent-emerald" }
    ];
  } else if (moduleId === 8) {
    cards = [
      { label: "绕组 1 阻抗 (Z1)", val: `${round(res.z1.R, 4)} + j${round(res.z1.X, 4)}`, unit: "Ω (高压侧)", accent: "accent-cyan" },
      { label: "绕组 2 阻抗 (Z2)", val: `${round(res.z2.R, 4)} + j${round(res.z2.X, 4)}`, unit: "Ω (中压侧)", accent: res.z2.X < 0 ? "accent-rose" : "accent-emerald" },
      { label: "绕组 3 阻抗 (Z3)", val: `${round(res.z3.R, 4)} + j${round(res.z3.X, 4)}`, unit: "Ω (低压侧)", accent: res.z3.X < 0 ? "accent-rose" : "accent-purple" },
      { label: "短路压降 Uk1/Uk2/Uk3", val: `${round(res.Uk1, 2)}% / ${round(res.Uk2, 2)}% / ${round(res.Uk3, 2)}%`, unit: "解耦后百分比", accent: "accent-amber" }
    ];
  } else if (moduleId === 9) {
    if (res.subChoice === "1") {
      cards = [
        { label: "串联总电阻 (R)", val: round(res.R, 4), unit: "Ω", accent: "accent-amber" },
        { label: "串联总电抗 (X)", val: round(res.X, 4), unit: "Ω", accent: "accent-cyan" },
        { label: "并联总导纳 (Y)", val: `${round(res.G, 4)} + j${round(res.B, 4)}`, unit: "μS", accent: "accent-purple" },
        { label: "单侧并联支路 (Y/2)", val: `${round(res.G/2, 4)} + j${round(res.B/2, 4)}`, unit: "μS", accent: "accent-emerald" }
      ];
    } else {
      cards = [
        { label: "分裂导线等效半径 req", val: round(res.req, 4), unit: "mm", accent: "accent-cyan" },
        { label: "几何均距与等效半径比", val: round(res.ratio, 2), unit: "(Deq·1000) / req", accent: "accent-amber" },
        { label: "单位长度电抗 x1", val: round(res.x1, 4), unit: "Ω/km (正序电抗)", accent: "accent-emerald" },
        { label: "单位长度电纳 b1", val: round(res.b1, 4), unit: "μS/km (正序电纳)", accent: "accent-purple" }
      ];
    }
  }

  summaryCardsContainer.innerHTML = cards.map(c => `
    <div class="result-metric-card ${c.accent}">
      <span class="metric-label">${c.label}</span>
      <span class="metric-val">${c.val}</span>
      <span class="metric-unit">${c.unit}</span>
    </div>
  `).join("");
}

// Render Step Cards with KaTeX Math Rendering
function renderStepCards(steps) {
  if (!steps || steps.length === 0) {
    stepsContainer.innerHTML = `<div style="color: var(--text-dim);">无分步推导</div>`;
    return;
  }

  stepsContainer.innerHTML = steps.map((s, idx) => `
    <div class="step-card">
      <div class="step-title">
        <span>⚡</span>
        <span>${s.title}</span>
      </div>
      ${s.latex ? `<div class="step-latex-box" id="step-latex-${idx}"></div>` : ''}
      <div class="step-code">${s.content}</div>
    </div>
  `).join("");

  // Render KaTeX in step cards
  steps.forEach((s, idx) => {
    if (s.latex) {
      const container = document.getElementById(`step-latex-${idx}`);
      if (container) renderLatex(container, s.latex, true);
    }
  });
}

// Render Diagrams
function renderDiagrams(moduleId, inputs, res) {
  phasorCanvas.style.display = "none";
  svgCircuitWrapper.style.display = "none";
  svgCircuitWrapper.innerHTML = "";

  if (moduleId === 1) {
    phasorCanvas.style.display = "block";
    drawPhasorCanvas(phasorCanvas, res.dU, res.du, res.U, res.U_end, res.angDeg);
  } else if (moduleId === 3) {
    svgCircuitWrapper.style.display = "block";
    svgCircuitWrapper.innerHTML = renderRingNetworkSVG(
      inputs.nodes || [],
      res.S_A,
      res.S_B,
      res.branches || [],
      res.activeSplitNode,
      res.reactiveSplitNode
    );
  } else if (moduleId === 6) {
    svgCircuitWrapper.style.display = "block";
    svgCircuitWrapper.innerHTML = renderTwoWindingGammaSVG(res.Rt, res.Xt, res.Gt_uS, res.Bt_uS);
  } else if (moduleId === 8) {
    svgCircuitWrapper.style.display = "block";
    svgCircuitWrapper.innerHTML = renderThreeWindingStarSVG(res.z1, res.z2, res.z3);
  } else if (moduleId === 9 && res.subChoice === "1") {
    svgCircuitWrapper.style.display = "block";
    svgCircuitWrapper.innerHTML = renderPiCircuitSVG(res.R, res.X, res.G, res.B);
  } else if (moduleId === 9 && res.subChoice === "2") {
    svgCircuitWrapper.style.display = "block";
    svgCircuitWrapper.innerHTML = `
      <div style="padding: 20px; text-align: center; color: var(--text-muted);">
        <p style="font-weight: bold; color: var(--accent-cyan); margin-bottom: 8px;">📏 分裂导线几何参数配置</p>
        <p>等效半径 req = ${round(res.req, 4)} mm · 比值 Deq/req = ${round(res.ratio, 2)}</p>
        <p style="margin-top: 10px; font-family: var(--font-mono); color: var(--accent-emerald);">
          x1 = ${round(res.x1, 4)} Ω/km,  b1 = ${round(res.b1, 4)} μS/km
        </p>
      </div>
    `;
  }
}

// Event Listeners
function setupEventListeners() {
  // Preset dropdown toggle
  btnLoadPreset.addEventListener("click", (e) => {
    e.stopPropagation();
    presetMenu.classList.toggle("show");
  });

  document.addEventListener("click", () => {
    presetMenu.classList.remove("show");
  });

  btnReloadPreset.addEventListener("click", () => {
    const mod = MODULES.find(m => m.id === currentModuleId);
    if (mod) applyPreset(mod, currentPresetIndex);
  });

  btnCalculate.addEventListener("click", triggerCalculation);

  btnResetForm.addEventListener("click", () => {
    const mod = MODULES.find(m => m.id === currentModuleId);
    if (mod) {
      renderFormFields(mod);
      summaryCardsContainer.innerHTML = `<div style="color: var(--text-dim);">表单已清空，请输入数据后核验。</div>`;
      stepsContainer.innerHTML = "";
    }
  });

  // Tab switcher
  const tabs = document.querySelectorAll(".tab-btn");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const target = tab.getAttribute("data-tab");

      document.querySelectorAll(".tab-content").forEach(c => c.style.display = "none");
      const activeContent = document.getElementById(`tab-${target}`);
      if (activeContent) activeContent.style.display = "block";

      if (target === "diagram" && currentModuleId === 1 && lastCalculationResult) {
        setTimeout(() => {
          drawPhasorCanvas(
            phasorCanvas,
            lastCalculationResult.result.dU,
            lastCalculationResult.result.du,
            lastCalculationResult.result.U,
            lastCalculationResult.result.U_end,
            lastCalculationResult.result.angDeg
          );
        }, 50);
      }
    });
  });

  // Copy report
  btnCopyReport.addEventListener("click", () => {
    if (!lastCalculationResult) {
      alert("请先进行一次计算核验！");
      return;
    }
    const { moduleId, result } = lastCalculationResult;
    const mod = MODULES.find(m => m.id === moduleId);

    let report = `【${mod.name}】 手算校验推导报告\n`;
    report += `公式：${mod.latexFormula || mod.formula}\n`;
    report += `==================================================\n`;
    (result.steps || []).forEach(s => {
      report += `\n${s.title}:\n`;
      if (s.latex) report += `LaTeX: ${s.latex}\n`;
      report += `${s.content}\n`;
    });
    report += `\n==================================================\n`;
    report += `考研避坑提示: ${result.trapTip}\n`;

    navigator.clipboard.writeText(report).then(() => {
      const origText = btnCopyReport.innerHTML;
      btnCopyReport.innerHTML = `<span>✅ 报告已复制</span>`;
      setTimeout(() => {
        btnCopyReport.innerHTML = origText;
      }, 2000);
    }).catch(() => {
      alert("复制失败，请手动选取复制。");
    });
  });

  // Theme switch
  btnThemeToggle.addEventListener("click", () => {
    const html = document.documentElement;
    const isDark = html.getAttribute("data-theme") === "dark";
    html.setAttribute("data-theme", isDark ? "light" : "dark");
    btnThemeToggle.textContent = isDark ? "☀️" : "🌙";

    if (currentModuleId === 1 && lastCalculationResult) {
      drawPhasorCanvas(
        phasorCanvas,
        lastCalculationResult.result.dU,
        lastCalculationResult.result.du,
        lastCalculationResult.result.U,
        lastCalculationResult.result.U_end,
        lastCalculationResult.result.angDeg
      );
    }
  });
}

// Debounced Calculation
let debounceTimer = null;
function debounceCalculate() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    triggerCalculation();
  }, 100);
}

// Run App
init();
