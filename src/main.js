import katex from "katex";
import "katex/dist/katex.min.css";
import { FORMULAS, FORMULA_CHAPTERS } from "./modulesData.js";
import { FORMULA_CALCULATORS } from "./formulaCalcs.js";

// 全局状态
let activeChapterId = "all";
let currentSearchQuery = "";
let currentFocusedCardId = null;

// DOM 元素引用
const chapterNav = document.getElementById("chapter-nav");
const cardsGrid = document.getElementById("formula-cards-grid");
const globalSearchInput = document.getElementById("global-search-input");
const visibleCountBadge = document.getElementById("visible-count-badge");
const btnResetAll = document.getElementById("btn-reset-all");
const btnThemeToggle = document.getElementById("btn-theme-toggle");
const btnViewGrid = document.getElementById("btn-view-grid");
const btnViewFocus = document.getElementById("btn-view-focus");
const toastContainer = document.getElementById("toast-container");

// 卡片输入数据存储 (formulaId -> { [fieldId]: value })
const cardInputsState = {};
// 卡片单位选择存储 (formulaId -> { [fieldId]: selectedUnit })
const cardUnitsState = {};

/**
 * 初始化应用
 */
function init() {
  // 初始化每个公式的默认数值与默认单位
  FORMULAS.forEach(f => {
    cardInputsState[f.id] = {};
    cardUnitsState[f.id] = {};
    const defaultPreset = f.presets && f.presets.length > 0 ? f.presets[0].values : {};
    (f.fields || []).forEach(field => {
      cardInputsState[f.id][field.id] = defaultPreset[field.id] !== undefined ? defaultPreset[field.id] : "";
      cardUnitsState[f.id][field.id] = field.defaultUnit || (field.units ? field.units[0] : "");
    });
  });

  renderChapterNav();
  renderAllCards();
  bindGlobalEvents();
  initPWA();
}

/**
 * 渲染章节过滤胶囊
 */
function renderChapterNav() {
  const allCount = FORMULAS.length;
  let html = `
    <button class="chapter-capsule ${activeChapterId === 'all' ? 'active' : ''}" data-chap="all">
      ⚡ 全部公式 <span class="chapter-badge">${allCount}</span>
    </button>
  `;

  FORMULA_CHAPTERS.forEach(ch => {
    const count = FORMULAS.filter(f => f.chapter === ch.id).length;
    html += `
      <button class="chapter-capsule ${activeChapterId === ch.id ? 'active' : ''}" data-chap="${ch.id}">
        ${ch.icon || '📄'} ${ch.name} <span class="chapter-badge">${count}</span>
      </button>
    `;
  });

  chapterNav.innerHTML = html;

  // 绑定章节切换点击
  chapterNav.querySelectorAll(".chapter-capsule").forEach(btn => {
    btn.addEventListener("click", () => {
      activeChapterId = btn.getAttribute("data-chap");
      chapterNav.querySelectorAll(".chapter-capsule").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      applyFilters();
    });
  });
}

/**
 * 渲染全部 47 个独立公式卡片
 */
function renderAllCards() {
  cardsGrid.innerHTML = FORMULAS.map(f => createCardHTML(f)).join("");

  // 为每个卡片渲染 KaTeX 公式并绑定输入监听
  FORMULAS.forEach(f => {
    renderCardKaTeX(f.id);
    bindCardInputs(f.id);
    updateDynamicFieldVisibility(f.id);
    executeCardCalculation(f.id);
  });

  updateVisibleCount();
}

/**
 * 生成单个卡片的 HTML 骨架
 */
function createCardHTML(formula) {
  const chapObj = FORMULA_CHAPTERS.find(c => c.id === formula.chapter) || { name: "" };
  const hasPresets = formula.presets && formula.presets.length > 0;
  const hasFields = formula.fields && formula.fields.length > 0;

  return `
    <article class="formula-card" id="card-${formula.id}" data-id="${formula.id}" data-chapter="${formula.chapter}">
      <!-- 头部：序号、名称、工具 -->
      <div class="card-header">
        <div class="card-title-group">
          <div class="card-title-row">
            <span class="card-id-badge">#${String(formula.id).padStart(2, '0')}</span>
            <h2 class="card-name">${formula.name}</h2>
          </div>
          <span class="card-category-tag">${chapObj.name} · ${formula.badge || '核心公式'}</span>
        </div>
        <div class="card-header-actions">
          <button class="card-tool-btn btn-focus-card" data-id="${formula.id}" title="聚焦放大该公式">🔍</button>
          <button class="card-tool-btn btn-copy-card" data-id="${formula.id}" title="复制草稿手算代入">📋</button>
        </div>
      </div>

      <!-- 核心公式展示盒 -->
      <div class="formula-hero-box" id="hero-formula-${formula.id}">
        <!-- KaTeX 注入 -->
      </div>

      <!-- 预设算例行 (如有) -->
      ${hasPresets ? `
        <div class="card-presets-row">
          <span class="presets-label">华电真题算例:</span>
          ${formula.presets.map((p, idx) => `
            <button class="preset-chip" data-id="${formula.id}" data-preset-idx="${idx}">${p.name}</button>
          `).join("")}
        </div>
      ` : ''}

      <!-- 纯数字输入字段区 (带可切换单位体系) -->
      ${hasFields ? `
        <div class="card-inputs-grid" id="inputs-grid-${formula.id}">
          ${formula.fields.map(field => {
            const val = cardInputsState[formula.id][field.id] !== undefined ? cardInputsState[formula.id][field.id] : "";
            const currentUnit = cardUnitsState[formula.id][field.id] || field.defaultUnit || '';
            const hasMultipleUnits = field.units && field.units.length > 1;

            if (field.type === 'select') {
              return `
                <div class="input-field-group" id="group-${formula.id}-${field.id}">
                  <label for="input-${formula.id}-${field.id}">${field.label}</label>
                  <div class="num-input-wrap">
                    <select id="input-${formula.id}-${field.id}" data-formula="${formula.id}" data-field="${field.id}">
                      ${(field.options || []).map(opt => `
                        <option value="${opt.value}" ${val === opt.value ? 'selected' : ''}>${opt.text}</option>
                      `).join("")}
                    </select>
                  </div>
                </div>
              `;
            }

            return `
              <div class="input-field-group" id="group-${formula.id}-${field.id}">
                <label for="input-${formula.id}-${field.id}" title="${field.hint || ''}">
                  ${field.label}
                </label>
                <div class="num-input-wrap ${hasMultipleUnits ? 'has-unit-select' : ''}">
                  <input 
                    type="number" 
                    step="any"
                    id="input-${formula.id}-${field.id}" 
                    data-formula="${formula.id}" 
                    data-field="${field.id}"
                    value="${val}" 
                    placeholder="${field.hint ? field.hint.slice(0, 8) : '输入数值'}"
                  >
                  ${hasMultipleUnits ? `
                    <select class="unit-selector" data-formula="${formula.id}" data-field="${field.id}" title="点击切换单位">
                      ${field.units.map(u => `
                        <option value="${u}" ${u === currentUnit ? 'selected' : ''}>${u}</option>
                      `).join("")}
                    </select>
                  ` : `
                    <span class="input-unit-badge">${field.defaultUnit || ''}</span>
                  `}
                </div>
              </div>
            `;
          }).join("")}
        </div>
      ` : `
        <div style="font-size:12px; color:var(--text-muted); padding: 4px 0;">
          💡 该公式为系统拓扑/微分方程判据，可查看标准公式结构与考点提示。
        </div>
      `}

      <!-- 计算结果与草稿纸代入输出区 -->
      <div class="card-output-section">
        <!-- 计算结果数值徽章 -->
        <div class="results-badges-row" id="results-row-${formula.id}">
          <!-- 动态结果注入 -->
        </div>

        <!-- 单纯的草稿纸代入式 -->
        <div class="substitution-row" id="subst-row-${formula.id}">
          <!-- 代入算式注入 -->
        </div>

        <!-- 考研避坑指南 -->
        <div class="exam-tip-box" id="tip-box-${formula.id}">
          <!-- 提示注入 -->
        </div>
      </div>
    </article>
  `;
}

/**
 * 使用 KaTeX 渲染公式卡片内的数学公式
 */
function renderCardKaTeX(formulaId) {
  const formula = FORMULAS.find(f => f.id === formulaId);
  if (!formula) return;

  const heroEl = document.getElementById(`hero-formula-${formulaId}`);
  if (heroEl && formula.latexFormula) {
    try {
      katex.render(formula.latexFormula, heroEl, {
        throwOnError: false,
        displayMode: true
      });
    } catch (e) {
      heroEl.textContent = formula.latexFormula;
    }
  }
}

/**
 * 动态根据配置（例如环网潮流运算负荷节点数）控制字段显示与隐藏
 */
function updateDynamicFieldVisibility(formulaId) {
  if (formulaId === 7) {
    // 环网潮流功率分布
    const count = parseInt(cardInputsState[7]?.node_count, 10) || 2;
    const g_p2 = document.getElementById("group-7-P2");
    const g_q2 = document.getElementById("group-7-Q2");
    const g_r2 = document.getElementById("group-7-R2");
    const g_x2 = document.getElementById("group-7-X2");
    const g_r3 = document.getElementById("group-7-R3");
    const g_x3 = document.getElementById("group-7-X3");

    const g_p3 = document.getElementById("group-7-P3");
    const g_q3 = document.getElementById("group-7-Q3");
    const g_r4 = document.getElementById("group-7-R4");
    const g_x4 = document.getElementById("group-7-X4");

    if (count === 1) {
      if (g_p2) g_p2.style.display = "none";
      if (g_q2) g_q2.style.display = "none";
      if (g_r3) g_r3.style.display = "none";
      if (g_x3) g_x3.style.display = "none";
      if (g_p3) g_p3.style.display = "none";
      if (g_q3) g_q3.style.display = "none";
      if (g_r4) g_r4.style.display = "none";
      if (g_x4) g_x4.style.display = "none";
    } else if (count === 2) {
      if (g_p2) g_p2.style.display = "";
      if (g_q2) g_q2.style.display = "";
      if (g_r3) g_r3.style.display = "";
      if (g_x3) g_x3.style.display = "";
      if (g_p3) g_p3.style.display = "none";
      if (g_q3) g_q3.style.display = "none";
      if (g_r4) g_r4.style.display = "none";
      if (g_x4) g_x4.style.display = "none";
    } else {
      if (g_p2) g_p2.style.display = "";
      if (g_q2) g_q2.style.display = "";
      if (g_r3) g_r3.style.display = "";
      if (g_x3) g_x3.style.display = "";
      if (g_p3) g_p3.style.display = "";
      if (g_q3) g_q3.style.display = "";
      if (g_r4) g_r4.style.display = "";
      if (g_x4) g_x4.style.display = "";
    }
  }
}

/**
 * 为单个卡片的输入框绑定毫秒级实时计算与单位切换监听
 */
function bindCardInputs(formulaId) {
  const card = document.getElementById(`card-${formulaId}`);
  if (!card) return;

  // 输入框数值实时监听
  card.querySelectorAll("input, select:not(.unit-selector)").forEach(input => {
    const handler = () => {
      const fieldId = input.getAttribute("data-field");
      cardInputsState[formulaId][fieldId] = input.value;
      if (fieldId === 'node_count') {
        updateDynamicFieldVisibility(formulaId);
      }
      executeCardCalculation(formulaId);
    };

    input.addEventListener("input", handler);
    input.addEventListener("change", handler);
  });

  // 单位下拉切换实时监听
  card.querySelectorAll(".unit-selector").forEach(sel => {
    sel.addEventListener("change", () => {
      const fieldId = sel.getAttribute("data-field");
      cardUnitsState[formulaId][fieldId] = sel.value;
      executeCardCalculation(formulaId);
      showToast(`单位已切换为 ${sel.value}`);
    });
  });

  // 预设算例按钮
  card.querySelectorAll(".preset-chip").forEach(btn => {
    btn.addEventListener("click", () => {
      const pIdx = parseInt(btn.getAttribute("data-preset-idx"), 10);
      const formula = FORMULAS.find(f => f.id === formulaId);
      if (formula && formula.presets && formula.presets[pIdx]) {
        const vals = formula.presets[pIdx].values;
        Object.keys(vals).forEach(fid => {
          cardInputsState[formulaId][fid] = vals[fid];
          const inp = document.getElementById(`input-${formulaId}-${fid}`);
          if (inp) inp.value = vals[fid];
        });
        updateDynamicFieldVisibility(formulaId);
        executeCardCalculation(formulaId);
        showToast(`已载入: ${formula.presets[pIdx].name}`);
      }
    });
  });

  // 工具按钮：聚焦放大
  const focusBtn = card.querySelector(".btn-focus-card");
  if (focusBtn) {
    focusBtn.addEventListener("click", () => toggleFocusCard(formulaId));
  }

  // 工具按钮：复制手算过程
  const copyBtn = card.querySelector(".btn-copy-card");
  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      copyCardHandcalc(formulaId);
    });
  }
}

/**
 * 执行单个卡片的独立纯数字计算 (带所选单位参数)
 */
function executeCardCalculation(formulaId) {
  const formula = FORMULAS.find(f => f.id === formulaId);
  if (!formula) return;

  const calcFnName = formula.calcFn || "calcFormulaRef";
  const calcFn = FORMULA_CALCULATORS[calcFnName] || FORMULA_CALCULATORS.calcFormulaRef;
  const inputs = cardInputsState[formulaId] || {};
  const units = cardUnitsState[formulaId] || {};

  try {
    const output = calcFn(inputs, units);
    updateCardOutputs(formulaId, output);
  } catch (err) {
    console.error(`Error calculating formula #${formulaId}:`, err);
  }
}

/**
 * 更新卡片的结果、代入式与提示区域
 */
function updateCardOutputs(formulaId, output) {
  const resultsRow = document.getElementById(`results-row-${formulaId}`);
  const substRow = document.getElementById(`subst-row-${formulaId}`);
  const tipBox = document.getElementById(`tip-box-${formulaId}`);

  if (resultsRow && output.results) {
    resultsRow.innerHTML = output.results.map(r => `
      <div class="result-badge ${r.highlight ? 'highlight' : ''}">
        <span class="result-key">${r.label}:</span>
        <span class="result-val">${r.value}</span>
        ${r.unit ? `<span class="result-unit">${r.unit}</span>` : ''}
      </div>
    `).join("");
  }

  if (substRow && output.substitution) {
    try {
      katex.render(output.substitution, substRow, {
        throwOnError: false,
        displayMode: false
      });
    } catch {
      substRow.textContent = output.substitution;
    }
  }

  if (tipBox) {
    const formula = FORMULAS.find(f => f.id === formulaId);
    const tipText = output.tips || formula?.description || "暂无考点补充";
    tipBox.innerHTML = `<strong>💡 考研手算要点:</strong> ${tipText}`;
  }
}

/**
 * 切换单卡聚焦全屏专注模式
 */
function toggleFocusCard(formulaId) {
  const card = document.getElementById(`card-${formulaId}`);
  if (!card) return;

  if (currentFocusedCardId === formulaId) {
    // 退出聚焦
    document.body.classList.remove("focus-mode-active");
    card.classList.remove("card-focused");
    currentFocusedCardId = null;
    btnViewGrid.classList.add("active");
    btnViewFocus.classList.remove("active");
    showToast("已退出聚焦，返回网格全览");
  } else {
    // 进入聚焦
    document.querySelectorAll(".formula-card").forEach(c => c.classList.remove("card-focused"));
    card.classList.add("card-focused");
    document.body.classList.add("focus-mode-active");
    currentFocusedCardId = formulaId;
    btnViewGrid.classList.remove("active");
    btnViewFocus.classList.add("active");
    card.scrollIntoView({ behavior: "smooth", block: "center" });
    showToast(`聚焦公式 #${String(formulaId).padStart(2, '0')}`);
  }
}

/**
 * 复制卡片的手算草稿代入过程到剪贴板
 */
function copyCardHandcalc(formulaId) {
  const formula = FORMULAS.find(f => f.id === formulaId);
  const inputs = cardInputsState[formulaId] || {};
  const units = cardUnitsState[formulaId] || {};
  const calcFn = FORMULA_CALCULATORS[formula.calcFn] || FORMULA_CALCULATORS.calcFormulaRef;
  const output = calcFn(inputs, units);

  let text = `【公式 #${formula.id} ${formula.name}】\n`;
  text += `已知条件: ${JSON.stringify(inputs)}\n`;
  text += `单位配置: ${JSON.stringify(units)}\n`;
  if (output.results) {
    text += `计算结果:\n` + output.results.map(r => `  - ${r.label}: ${r.value} ${r.unit}`).join("\n") + "\n";
  }
  if (output.substitution) {
    text += `手算代入过程: ${output.substitution}\n`;
  }
  if (output.tips) {
    text += `考研要点: ${output.tips}\n`;
  }

  navigator.clipboard.writeText(text).then(() => {
    showToast("✅ 已复制完整草稿手算推导至剪贴板！");
  }).catch(() => {
    showToast("复制失败，请手动选取复制");
  });
}

/**
 * 绑定全局事件（搜索、快捷键、重置、主题）
 */
function bindGlobalEvents() {
  // 全局搜索过滤
  globalSearchInput.addEventListener("input", (e) => {
    currentSearchQuery = e.target.value.trim().toLowerCase();
    applyFilters();
  });

  // 快捷键: ⌘K 或 Ctrl+K 聚焦搜索框；Esc 清空搜索或退出聚焦
  window.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      globalSearchInput.focus();
      globalSearchInput.select();
    } else if (e.key === "Escape") {
      if (currentFocusedCardId) {
        toggleFocusCard(currentFocusedCardId);
      } else if (globalSearchInput.value) {
        globalSearchInput.value = "";
        currentSearchQuery = "";
        applyFilters();
      }
    }
  });

  // 一键重置为全套典型真题算例
  btnResetAll.addEventListener("click", () => {
    FORMULAS.forEach(f => {
      const defaultPreset = f.presets && f.presets.length > 0 ? f.presets[0].values : {};
      (f.fields || []).forEach(field => {
        const val = defaultPreset[field.id] !== undefined ? defaultPreset[field.id] : "";
        cardInputsState[f.id][field.id] = val;
        cardUnitsState[f.id][field.id] = field.defaultUnit || (field.units ? field.units[0] : "");
        const inp = document.getElementById(`input-${f.id}-${field.id}`);
        if (inp) inp.value = val;
        const uSel = document.querySelector(`.unit-selector[data-formula="${f.id}"][data-field="${field.id}"]`);
        if (uSel) uSel.value = cardUnitsState[f.id][field.id];
      });
      updateDynamicFieldVisibility(f.id);
      executeCardCalculation(f.id);
    });
    showToast("⚡ 已载入全套华电典型真题算例！");
  });

  // 主题切换
  btnThemeToggle.addEventListener("click", () => {
    const html = document.documentElement;
    const currentTheme = html.getAttribute("data-theme") || "dark";
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", nextTheme);
    showToast(`已切换为${nextTheme === "dark" ? "暗黑极客" : "明亮工作"}主题`);
  });

  // 视图模式切换
  btnViewGrid.addEventListener("click", () => {
    if (currentFocusedCardId) {
      toggleFocusCard(currentFocusedCardId);
    }
  });

  btnViewFocus.addEventListener("click", () => {
    // 聚焦到当前第一个可见卡片
    const firstVisible = Array.from(document.querySelectorAll(".formula-card")).find(c => c.style.display !== "none");
    if (firstVisible) {
      const fId = parseInt(firstVisible.getAttribute("data-id"), 10);
      toggleFocusCard(fId);
    }
  });
}

/**
 * 根据章节和搜索词综合过滤卡片显示
 */
function applyFilters() {
  let visibleCount = 0;

  FORMULAS.forEach(f => {
    const card = document.getElementById(`card-${f.id}`);
    if (!card) return;

    // 检查章节匹配
    const matchChapter = activeChapterId === "all" || f.chapter === activeChapterId;

    // 检查搜索匹配
    let matchSearch = true;
    if (currentSearchQuery) {
      const idMatch = `#${f.id}`.includes(currentSearchQuery) || String(f.id) === currentSearchQuery;
      const nameMatch = f.name.toLowerCase().includes(currentSearchQuery);
      const descMatch = (f.description || "").toLowerCase().includes(currentSearchQuery);
      const latexMatch = (f.latexFormula || "").toLowerCase().includes(currentSearchQuery);
      const badgeMatch = (f.badge || "").toLowerCase().includes(currentSearchQuery);
      const fieldMatch = (f.fields || []).some(field => 
        field.label.toLowerCase().includes(currentSearchQuery) || 
        field.id.toLowerCase().includes(currentSearchQuery)
      );

      matchSearch = idMatch || nameMatch || descMatch || latexMatch || badgeMatch || fieldMatch;
    }

    if (matchChapter && matchSearch) {
      card.style.display = "";
      visibleCount++;
    } else {
      card.style.display = "none";
    }
  });

  updateVisibleCount(visibleCount);
}

/**
 * 更新可见卡片数量统计
 */
function updateVisibleCount(count = null) {
  const total = FORMULAS.length;
  const current = count !== null ? count : FORMULAS.length;
  visibleCountBadge.textContent = `显示 ${current} / ${total} 个独立公式卡片`;
}

/**
 * Toast 消息提示
 */
function showToast(message) {
  const el = document.createElement("div");
  el.className = "toast-msg";
  el.textContent = message;
  toastContainer.appendChild(el);
  setTimeout(() => {
    el.style.opacity = "0";
    el.style.transform = "translateY(8px)";
    setTimeout(() => el.remove(), 250);
  }, 2200);
}

/**
 * PWA Service Worker 注册与安装提示
 */
function initPWA() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").then((reg) => {
        console.log("⚡ PWA Service Worker registered:", reg.scope);
      }).catch((err) => {
        console.warn("PWA SW registration failed:", err);
      });
    });
  }

  let deferredPrompt = null;
  const btnPwaInstall = document.getElementById("btn-pwa-install");

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (btnPwaInstall) {
      btnPwaInstall.style.display = "inline-flex";
      btnPwaInstall.addEventListener("click", async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
          showToast("✅ 已成功添加电分校验台 App！");
        }
        deferredPrompt = null;
        btnPwaInstall.style.display = "none";
      });
    }
  });

  window.addEventListener("appinstalled", () => {
    if (btnPwaInstall) btnPwaInstall.style.display = "none";
    showToast("🎉 电力系统稳态分析校验台已成功安装！自习室离线可用！");
  });
}

// 启动
document.addEventListener("DOMContentLoaded", init);
