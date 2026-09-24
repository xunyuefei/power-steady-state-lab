/**
 * 电力系统稳态分析 - 电路图解、相量图与环网潮流分界点拓扑可视化引擎
 */

import { round } from "./mathUtils.js";

/**
 * 绘制电压降落与损耗相量图 (Canvas)
 */
export function drawPhasorCanvas(canvas, dU, du, U, U_end, angDeg) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth || 400;
  const height = canvas.clientHeight || 260;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  ctx.clearRect(0, 0, width, height);

  // Background subtle grid
  ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += 30) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += 30) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  const originX = 50;
  const originY = height - 50;

  // Scale calculations
  const maxSpanX = (U + Math.abs(dU)) * 1.15 || 100;
  const maxSpanY = Math.max(Math.abs(du) * 1.5, maxSpanX * 0.4) || 30;

  const scaleX = (width - 100) / maxSpanX;
  const scaleY = (height - 90) / maxSpanY;

  // Draw Axis
  ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(originX - 20, originY);
  ctx.lineTo(width - 20, originY);
  ctx.stroke();
  drawArrowHead(ctx, width - 20, originY, 0, 8, "rgba(255, 255, 255, 0.4)");

  ctx.font = "11px 'JetBrains Mono', monospace";
  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
  ctx.fillText("实轴 (Re / 参考相量)", width - 130, originY + 22);

  // U vector (Base Reference along real axis)
  const uEndX = originX + U * scaleX;
  ctx.strokeStyle = "#38bdf8";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(originX, originY);
  ctx.lineTo(uEndX, originY);
  ctx.stroke();
  drawArrowHead(ctx, uEndX, originY, 0, 10, "#38bdf8");

  ctx.fillStyle = "#38bdf8";
  ctx.fillText(`U = ${round(U, 1)} kV`, originX + (U * scaleX) / 2 - 25, originY + 20);

  // dU vector (Longitudinal drop ΔU along real axis)
  const duEndX = uEndX + dU * scaleX;
  ctx.strokeStyle = "#fbbf24";
  ctx.lineWidth = 2.5;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.moveTo(uEndX, originY);
  ctx.lineTo(duEndX, originY);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = "#fbbf24";
  ctx.fillText(`ΔU=${round(dU, 2)}kV`, uEndX + 4, originY + 16);

  // du vector (Transverse drop δU perpendicular)
  const endY = originY - du * scaleY;
  ctx.strokeStyle = "#a855f7";
  ctx.lineWidth = 2.5;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.moveTo(duEndX, originY);
  ctx.lineTo(duEndX, endY);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = "#c084fc";
  ctx.fillText(`δU=${round(du, 2)}kV`, duEndX + 6, originY - (du * scaleY) / 2);

  // Resultant U_end vector
  ctx.strokeStyle = "#10b981";
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(originX, originY);
  ctx.lineTo(duEndX, endY);
  ctx.stroke();
  const resAngle = Math.atan2(endY - originY, duEndX - originX);
  drawArrowHead(ctx, duEndX, endY, resAngle, 12, "#10b981");

  ctx.fillStyle = "#34d399";
  ctx.font = "bold 12px 'JetBrains Mono', monospace";
  ctx.fillText(`U_对端 = ${round(U_end, 2)} kV`, (originX + duEndX) / 2 - 30, (originY + endY) / 2 - 12);

  // Phase angle arc
  if (Math.abs(angDeg) > 0.1) {
    const arcRadius = 40;
    ctx.strokeStyle = "#f43f5e";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(originX, originY, arcRadius, 0, resAngle, angDeg < 0);
    ctx.stroke();
    ctx.fillStyle = "#fb7185";
    ctx.font = "11px 'JetBrains Mono', monospace";
    ctx.fillText(`δ = ${round(angDeg, 2)}°`, originX + arcRadius + 6, originY - 8);
  }
}

function drawArrowHead(ctx, x, y, angle, size, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-size, -size * 0.45);
  ctx.lineTo(-size * 0.7, 0);
  ctx.lineTo(-size, size * 0.45);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * 环网潮流与功率分界点拓扑图 SVG
 */
export function renderRingNetworkSVG(nodes, S_A, S_B, branches, activeSplitNode, reactiveSplitNode) {
  const totalPoints = nodes.length + 2; // A + nodes + B
  const svgWidth = 620;
  const startX = 60;
  const endX = svgWidth - 60;
  const stepX = (endX - startX) / (totalPoints - 1);
  const busY = 100;

  let nodesSvg = "";
  let branchesSvg = "";

  // Render Buses A and B
  nodesSvg += `
    <!-- Bus A -->
    <line x1="${startX}" y1="${busY - 35}" x2="${startX}" y2="${busY + 35}" stroke="#38bdf8" stroke-width="6"/>
    <text x="${startX}" y="${busY - 45}" fill="#38bdf8" font-size="12" font-weight="bold" text-anchor="middle">电源 A</text>
    <text x="${startX}" y="${busY + 52}" fill="#94a3b8" font-size="10" font-family="'JetBrains Mono', monospace" text-anchor="middle">${S_A.toString(1)}</text>

    <!-- Bus B -->
    <line x1="${endX}" y1="${busY - 35}" x2="${endX}" y2="${busY + 35}" stroke="#38bdf8" stroke-width="6"/>
    <text x="${endX}" y="${busY - 45}" fill="#38bdf8" font-size="12" font-weight="bold" text-anchor="middle">电源 B</text>
    <text x="${endX}" y="${busY + 52}" fill="#94a3b8" font-size="10" font-family="'JetBrains Mono', monospace" text-anchor="middle">${S_B.toString(1)}</text>
  `;

  // Render Intermediate Load Nodes
  nodes.forEach((n, idx) => {
    const nodeIdx = idx + 1;
    const nx = startX + nodeIdx * stepX;
    const isPsplit = nodeIdx === activeSplitNode;
    const isQsplit = nodeIdx === reactiveSplitNode;

    let badgeText = "";
    if (isPsplit && isQsplit) badgeText = "★ 有功+无功分界点";
    else if (isPsplit) badgeText = "★ 有功分界点";
    else if (isQsplit) badgeText = "★ 无功分界点";

    const nodeColor = (isPsplit || isQsplit) ? "#f59e0b" : "#e2e8f0";
    const circleRadius = (isPsplit || isQsplit) ? 8 : 6;

    nodesSvg += `
      <!-- Node ${nodeIdx} -->
      <circle cx="${nx}" cy="${busY}" r="${circleRadius}" fill="${nodeColor}" stroke="#0f172a" stroke-width="2"/>
      <text x="${nx}" y="${busY - 14}" fill="${nodeColor}" font-size="11" font-weight="bold" text-anchor="middle">节点 ${nodeIdx}</text>
      
      <!-- Load arrow down -->
      <line x1="${nx}" y1="${busY + 6}" x2="${nx}" y2="${busY + 36}" stroke="#f43f5e" stroke-width="2" marker-end="url(#arrow-down)"/>
      <text x="${nx}" y="${busY + 50}" fill="#f43f5e" font-size="9" font-family="'JetBrains Mono', monospace" text-anchor="middle">
        ${n.P}+j${n.Q}
      </text>

      ${badgeText ? `
        <rect x="${nx - 52}" y="${busY - 38}" width="104" height="20" rx="4" fill="rgba(245, 158, 11, 0.2)" stroke="#f59e0b" stroke-width="1.2"/>
        <text x="${nx}" y="${busY - 24}" fill="#f59e0b" font-size="9" font-weight="bold" text-anchor="middle">${badgeText}</text>
      ` : ""}
    `;
  });

  // Render Branches
  for (let i = 0; i < totalPoints - 1; i++) {
    const x1 = startX + i * stepX;
    const x2 = startX + (i + 1) * stepX;
    const b = branches[i];
    const flowText = b ? `${round(b.flow.re, 0)}+j${round(b.flow.im, 0)}` : "";
    const pArrow = b && b.pDir === "→" ? "url(#arrow-right)" : "url(#arrow-left)";

    branchesSvg += `
      <line x1="${x1 + 6}" y1="${busY}" x2="${x2 - 6}" y2="${busY}" stroke="#475569" stroke-width="3"/>
      <!-- Midpoint flow direction -->
      <line x1="${(x1 + x2) / 2 - 12}" y1="${busY - 8}" x2="${(x1 + x2) / 2 + 12}" y2="${busY - 8}" stroke="#38bdf8" stroke-width="2" marker-end="${pArrow}"/>
      <text x="${(x1 + x2) / 2}" y="${busY - 14}" fill="#94a3b8" font-size="9" font-family="'JetBrains Mono', monospace" text-anchor="middle">
        ${flowText}
      </text>
    `;
  }

  return `
    <svg viewBox="0 0 ${svgWidth} 220" class="circuit-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="arrow-down" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f43f5e"/>
        </marker>
        <marker id="arrow-right" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38bdf8"/>
        </marker>
        <marker id="arrow-left" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38bdf8"/>
        </marker>
      </defs>

      ${branchesSvg}
      ${nodesSvg}
    </svg>
  `;
}

/**
 * 输电线路 π 型等效电路 SVG
 */
export function renderPiCircuitSVG(R, X, G, B) {
  return `
    <svg viewBox="0 0 520 200" class="circuit-svg" xmlns="http://www.w3.org/2000/svg">
      <line x1="40" y1="40" x2="480" y2="40" stroke="#475569" stroke-width="2"/>
      <line x1="40" y1="160" x2="480" y2="160" stroke="#475569" stroke-width="2"/>

      <line x1="70" y1="20" x2="70" y2="60" stroke="#38bdf8" stroke-width="5"/>
      <text x="70" y="15" fill="#38bdf8" font-size="12" font-weight="bold" text-anchor="middle">母线 A</text>

      <line x1="450" y1="20" x2="450" y2="60" stroke="#38bdf8" stroke-width="5"/>
      <text x="450" y="15" fill="#38bdf8" font-size="12" font-weight="bold" text-anchor="middle">母线 B</text>

      <rect x="180" y="24" width="160" height="32" rx="6" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
      <text x="260" y="44" fill="#f8fafc" font-size="11" font-family="'JetBrains Mono', monospace" text-anchor="middle">
        Z = ${round(R, 2)} + j${round(X, 2)} Ω
      </text>

      <line x1="120" y1="40" x2="120" y2="70" stroke="#94a3b8" stroke-width="2"/>
      <rect x="80" y="70" width="80" height="42" rx="4" fill="#0f172a" stroke="#a855f7" stroke-width="1.5"/>
      <text x="120" y="88" fill="#e2e8f0" font-size="10" text-anchor="middle">Y/2</text>
      <text x="120" y="103" fill="#c084fc" font-size="9" font-family="'JetBrains Mono', monospace" text-anchor="middle">+j${round(B/2, 2)} μS</text>
      <line x1="120" y1="112" x2="120" y2="160" stroke="#94a3b8" stroke-width="2"/>

      <line x1="400" y1="40" x2="400" y2="70" stroke="#94a3b8" stroke-width="2"/>
      <rect x="360" y="70" width="80" height="42" rx="4" fill="#0f172a" stroke="#a855f7" stroke-width="1.5"/>
      <text x="400" y="88" fill="#e2e8f0" font-size="10" text-anchor="middle">Y/2</text>
      <text x="400" y="103" fill="#c084fc" font-size="9" font-family="'JetBrains Mono', monospace" text-anchor="middle">+j${round(B/2, 2)} μS</text>
      <line x1="400" y1="112" x2="400" y2="160" stroke="#94a3b8" stroke-width="2"/>

      <line x1="260" y1="160" x2="260" y2="175" stroke="#64748b" stroke-width="2"/>
      <line x1="245" y1="175" x2="275" y2="175" stroke="#64748b" stroke-width="2"/>
      <line x1="250" y1="180" x2="270" y2="180" stroke="#64748b" stroke-width="1.5"/>
      <line x1="255" y1="185" x2="265" y2="185" stroke="#64748b" stroke-width="1"/>
      <text x="260" y="196" fill="#64748b" font-size="9" text-anchor="middle">参考地</text>
    </svg>
  `;
}

/**
 * 三绕组变压器星型等效电路 SVG
 */
export function renderThreeWindingStarSVG(z1, z2, z3) {
  const x1Color = z1.X < 0 ? "#f43f5e" : "#38bdf8";
  const x2Color = z2.X < 0 ? "#f43f5e" : "#38bdf8";
  const x3Color = z3.X < 0 ? "#f43f5e" : "#38bdf8";

  return `
    <svg viewBox="0 0 520 260" class="circuit-svg" xmlns="http://www.w3.org/2000/svg">
      <circle cx="260" cy="130" r="6" fill="#fbbf24"/>
      <text x="260" y="148" fill="#fbbf24" font-size="11" font-weight="bold" text-anchor="middle">中性星点 O</text>

      <line x1="40" y1="130" x2="150" y2="130" stroke="#38bdf8" stroke-width="2.5"/>
      <rect x="70" y="105" width="130" height="42" rx="5" fill="#1e293b" stroke="${x1Color}" stroke-width="2"/>
      <text x="135" y="122" fill="#93c5fd" font-size="10" font-weight="bold" text-anchor="middle">绕组 1 (高压侧)</text>
      <text x="135" y="138" fill="#f8fafc" font-size="9" font-family="'JetBrains Mono', monospace" text-anchor="middle">
        ${round(z1.R, 3)} + j${round(z1.X, 3)} Ω
      </text>
      <line x1="200" y1="130" x2="260" y2="130" stroke="#38bdf8" stroke-width="2.5"/>
      <circle cx="40" cy="130" r="5" fill="#38bdf8"/>
      <text x="25" y="134" fill="#38bdf8" font-size="11" font-weight="bold">1</text>

      <line x1="260" y1="130" x2="330" y2="70" stroke="#38bdf8" stroke-width="2.5"/>
      <rect x="320" y="35" width="130" height="42" rx="5" fill="#1e293b" stroke="${x2Color}" stroke-width="2"/>
      <text x="385" y="52" fill="#93c5fd" font-size="10" font-weight="bold" text-anchor="middle">绕组 2 (中压侧)</text>
      <text x="385" y="68" fill="#f8fafc" font-size="9" font-family="'JetBrains Mono', monospace" text-anchor="middle">
        ${round(z2.R, 3)} + j${round(z2.X, 3)} Ω
      </text>
      <line x1="450" y1="56" x2="490" y2="56" stroke="#38bdf8" stroke-width="2.5"/>
      <circle cx="490" cy="56" r="5" fill="#38bdf8"/>
      <text x="505" y="60" fill="#38bdf8" font-size="11" font-weight="bold">2</text>

      <line x1="260" y1="130" x2="330" y2="190" stroke="#38bdf8" stroke-width="2.5"/>
      <rect x="320" y="170" width="130" height="42" rx="5" fill="#1e293b" stroke="${x3Color}" stroke-width="2"/>
      <text x="385" y="187" fill="#93c5fd" font-size="10" font-weight="bold" text-anchor="middle">绕组 3 (低压侧)</text>
      <text x="385" y="203" fill="#f8fafc" font-size="9" font-family="'JetBrains Mono', monospace" text-anchor="middle">
        ${round(z3.R, 3)} + j${round(z3.X, 3)} Ω
      </text>
      <line x1="450" y1="190" x2="490" y2="190" stroke="#38bdf8" stroke-width="2.5"/>
      <circle cx="490" cy="190" r="5" fill="#38bdf8"/>
      <text x="505" y="194" fill="#38bdf8" font-size="11" font-weight="bold">3</text>
    </svg>
  `;
}

/**
 * 双绕组变压器 Γ 型等效电路 SVG
 */
export function renderTwoWindingGammaSVG(Rt, Xt, Gt_uS, Bt_uS) {
  return `
    <svg viewBox="0 0 500 190" class="circuit-svg" xmlns="http://www.w3.org/2000/svg">
      <line x1="40" y1="40" x2="460" y2="40" stroke="#475569" stroke-width="2"/>
      <line x1="40" y1="150" x2="460" y2="150" stroke="#475569" stroke-width="2"/>

      <circle cx="40" cy="40" r="4" fill="#38bdf8"/>
      <text x="30" y="25" fill="#38bdf8" font-size="11" font-weight="bold">原边</text>

      <rect x="90" y="22" width="160" height="36" rx="5" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
      <text x="170" y="44" fill="#f8fafc" font-size="10" font-family="'JetBrains Mono', monospace" text-anchor="middle">
        ZT = ${round(Rt, 3)} + j${round(Xt, 3)} Ω
      </text>

      <circle cx="460" cy="40" r="4" fill="#10b981"/>
      <text x="450" y="25" fill="#10b981" font-size="11" font-weight="bold">副边</text>

      <line x1="330" y1="40" x2="330" y2="65" stroke="#94a3b8" stroke-width="2"/>
      <rect x="260" y="65" width="140" height="42" rx="4" fill="#0f172a" stroke="#a855f7" stroke-width="1.5"/>
      <text x="330" y="82" fill="#e2e8f0" font-size="10" text-anchor="middle">激磁导纳 YT</text>
      <text x="330" y="98" fill="#c084fc" font-size="9" font-family="'JetBrains Mono', monospace" text-anchor="middle">
        ${round(Gt_uS, 2)} - j${round(Bt_uS, 2)} μS
      </text>
      <line x1="330" y1="107" x2="330" y2="150" stroke="#94a3b8" stroke-width="2"/>

      <line x1="250" y1="150" x2="250" y2="165" stroke="#64748b" stroke-width="2"/>
      <line x1="235" y1="165" x2="265" y2="165" stroke="#64748b" stroke-width="2"/>
      <line x1="240" y1="170" x2="260" y2="170" stroke="#64748b" stroke-width="1.5"/>
    </svg>
  `;
}
