import { round, parseF } from "./mathUtils.js";

/**
 * 47 个独立公式纯数字计算引擎与手算代入生成器 (V2.0 升级版)
 * 严谨支持：
 * 1. 任意物理量单位自适应换算 (kW/MW, V/kV, kVA/MVA, m/km 等)
 * 2. 环网潮流多运算负荷节点自适应力矩计算与功率分降点智能锁定
 * 3. 华电 811/812 考研真题量纲与草稿纸分步代入严密对应
 */

/**
 * 辅助：提取归一化单位换算系数
 * 将用户输入的数值根据其当前选择的单位，转换为标准计算基准量
 */
function getScale(unit, standard) {
  if (!unit || unit === standard) return 1;

  // 功率/容量换算基准：MW 或 MVA
  if (standard === 'MW' || standard === 'MVA') {
    if (unit === 'kW' || unit === 'kVA') return 1e-3;
    if (unit === 'W' || unit === 'VA') return 1e-6;
    if (unit === 'GW') return 1e3;
  }
  // 损耗换算基准：kW
  if (standard === 'kW') {
    if (unit === 'MW') return 1e3;
    if (unit === 'W') return 1e-3;
  }
  // 电压换算基准：kV
  if (standard === 'kV') {
    if (unit === 'V') return 1e-3;
    if (unit === 'MV') return 1e3;
  }
  // 电流换算基准：A 或 kA
  if (standard === 'A') {
    if (unit === 'kA') return 1e3;
    if (unit === 'mA') return 1e-3;
  }
  if (standard === 'kA') {
    if (unit === 'A') return 1e-3;
  }
  // 长度换算基准：km
  if (standard === 'km') {
    if (unit === 'm') return 1e-3;
  }
  // 阻抗换算基准：Ω
  if (standard === 'Ω') {
    if (unit === 'mΩ') return 1e-3;
    if (unit === 'kΩ') return 1e3;
  }
  // 间距换算基准：mm
  if (standard === 'mm') {
    if (unit === 'cm') return 10;
    if (unit === 'm') return 1000;
  }
  return 1;
}

export const FORMULA_CALCULATORS = {
  // ═══════════════════════════════════════════════════════════════
  // #01 变压器参数计算
  // ═══════════════════════════════════════════════════════════════
  calcFormula1_TransformerParam(inputs, units = {}) {
    const s_SN = getScale(units.SN || 'MVA', 'MVA');
    const s_UN = getScale(units.UN || 'kV', 'kV');
    const s_Pk = getScale(units.Pk || 'kW', 'kW');
    const s_P0 = getScale(units.P0 || 'kW', 'kW');

    const SN = parseF(inputs.SN, 31.5) * s_SN; // MVA
    const UN = parseF(inputs.UN, 110) * s_UN; // kV
    const Pk = parseF(inputs.Pk, 135) * s_Pk; // kW
    const Uk_pct = parseF(inputs.Uk_pct, 10.5); // %
    const P0 = parseF(inputs.P0, 31) * s_P0; // kW
    const I0_pct = parseF(inputs.I0_pct, 0.8); // %

    // 标准公式
    const RT = (Pk * Math.pow(UN, 2)) / (1000 * Math.pow(SN, 2)); // Ω
    const XT = (Uk_pct * Math.pow(UN, 2)) / (100 * SN); // Ω
    const GT = P0 / (1000 * Math.pow(UN, 2)); // S
    const BT = (I0_pct * SN) / (100 * Math.pow(UN, 2)); // S

    return {
      results: [
        { label: "变压器等值电阻 R_T", value: round(RT, 4), unit: "Ω", highlight: true },
        { label: "变压器等值电抗 X_T", value: round(XT, 4), unit: "Ω", highlight: true },
        { label: "励磁电导 G_T", value: (GT * 1e6).toFixed(4), unit: "×10⁻⁶ S" },
        { label: "励磁电纳 B_T", value: (BT * 1e6).toFixed(4), unit: "×10⁻⁶ S", highlight: true }
      ],
      substitution: `R_T = \\frac{\\Delta P_k U_N^2}{1000 S_N^2} = \\frac{${Pk}\\times ${UN}^2}{1000\\times ${SN}^2} = ${round(RT, 4)}\\,\\Omega \\\\ X_T = \\frac{U_k\\% U_N^2}{100 S_N} = \\frac{${Uk_pct}\\times ${UN}^2}{100\\times ${SN}} = ${round(XT, 4)}\\,\\Omega \\\\ B_T = \\frac{I_0\\% S_N}{100 U_N^2} = \\frac{${I0_pct}\\times ${SN}}{100\\times ${UN}^2} = ${round(BT * 1e6, 4)}\\times 10^{-6}\\text{ S}`,
      tips: "【考研核心避坑】UN 必须使用归算侧额定电压！SN 为三相总容量。若求标幺值，以变压器自身为基准时 XT* = Uk%/100。"
    };
  },

  // ═══════════════════════════════════════════════════════════════
  // #02 线路参数计算
  // ═══════════════════════════════════════════════════════════════
  calcFormula2_LineParam(inputs, units = {}) {
    const s_d = getScale(units.d_split || 'mm', 'mm');
    const s_L = getScale(units.L_line || 'km', 'km');

    const rho = parseF(inputs.rho, 31.5);
    const S = parseF(inputs.S_cross, 240);
    const Dm = parseF(inputs.Dm, 7.0); // m
    const r_mm = parseF(inputs.r_mm, 10.8); // mm
    const n = Math.max(1, parseInt(inputs.n_split, 10) || 1);
    const d_mm = parseF(inputs.d_split, 400) * s_d; // mm
    const L = parseF(inputs.L_line, 100) * s_L; // km

    const r1 = rho / (n * S); // 分裂导线总电阻为 n 根并联
    const R_total = r1 * L;

    // 分裂导线等效半径 req
    let req_m = 0;
    if (n === 1) {
      req_m = r_mm / 1000;
    } else if (n === 2) {
      req_m = Math.sqrt((r_mm / 1000) * (d_mm / 1000));
    } else if (n === 3) {
      req_m = Math.cbrt((r_mm / 1000) * Math.pow(d_mm / 1000, 2));
    } else if (n === 4) {
      req_m = Math.pow((r_mm / 1000) * Math.pow(d_mm / 1000, 3) * Math.sqrt(2), 0.25);
    } else {
      req_m = (r_mm / 1000);
    }

    const x1 = 0.1445 * Math.log10(Dm / req_m) + 0.0157 / n;
    const X_total = x1 * L;
    const b1 = (7.58 / Math.log10(Dm / req_m)) * 1e-6; // S/km
    const B_total = b1 * L;

    return {
      results: [
        { label: "单位电阻 r₁", value: round(r1, 5), unit: "Ω/km" },
        { label: "全长电阻 R", value: round(R_total, 4), unit: "Ω", highlight: true },
        { label: "单位电抗 x₁", value: round(x1, 5), unit: "Ω/km" },
        { label: "全长电抗 X", value: round(X_total, 4), unit: "Ω", highlight: true },
        { label: "全长电纳 B", value: (B_total * 1e6).toFixed(3), unit: "×10⁻⁶ S" }
      ],
      substitution: `r_{eq} = ${round(req_m * 1000, 2)}\\text{ mm}, \\quad r_1 = \\frac{${rho}}{${n}\\times ${S}} = ${round(r1, 5)}\\,\\Omega/\\text{km} \\\\ x_1 = 0.1445\\lg\\frac{${Dm}}{${round(req_m, 5)}} + \\frac{0.0157}{${n}} = ${round(x1, 5)}\\,\\Omega/\\text{km} \\implies X = ${round(x1, 5)}\\times ${L} = ${round(X_total, 4)}\\,\\Omega`,
      tips: "【华电考研要点】分裂导线显著增大了等效半径 req，使电抗 x1 减小约 20%~30%，电纳 b1 增大，极大提升特高压输送容量。"
    };
  },

  // ═══════════════════════════════════════════════════════════════
  // #03 线路对地电容功率 (充电功率)
  // ═══════════════════════════════════════════════════════════════
  calcFormula3_ChargingPower(inputs, units = {}) {
    const s_U = getScale(units.U || 'kV', 'kV');
    const s_L = getScale(units.L || 'km', 'km');
    const s_b1 = (units.b1 === 'S/km') ? 1e6 : 1; // 内部按 ×10⁻⁶ S/km 算

    const U = parseF(inputs.U, 220) * s_U; // kV
    const b1_raw = parseF(inputs.b1, 2.85) * s_b1; // ×10⁻⁶ S/km
    const L = parseF(inputs.L, 150) * s_L; // km

    const b1 = b1_raw * 1e-6; // S/km
    const B = b1 * L; // S
    const QC = Math.pow(U, 2) * B; // MVar
    const QC_half = QC / 2; // MVar

    return {
      results: [
        { label: "线路全长总充电功率 Q_C", value: round(QC, 4), unit: "MVar", highlight: true },
        { label: "单侧半数充电功率 Q_C/2", value: round(QC_half, 4), unit: "MVar", highlight: true },
        { label: "全长对地总电纳 B", value: (B * 1e6).toFixed(3), unit: "×10⁻⁶ S" }
      ],
      substitution: `Q_C = U^2 \\cdot (b_1 L) = ${U}^2 \\times (${b1_raw}\\times 10^{-6}\\times ${L}) = ${round(QC, 4)}\\text{ MVar} \\implies \\frac{Q_C}{2} = ${round(QC_half, 4)}\\text{ MVar}`,
      tips: "【潮流手算标准步骤】计算 П 型等值电路潮流时，必须在首端和末端分别并联 QC/2（发出无功，符号为负负荷）。"
    };
  },

  // ═══════════════════════════════════════════════════════════════
  // #04 变压器不变损耗与可变损耗
  // ═══════════════════════════════════════════════════════════════
  calcFormula4_TransformerLoss(inputs, units = {}) {
    const s_SN = getScale(units.SN || 'MVA', 'MVA');
    const s_S = getScale(units.S_load || 'MVA', 'MVA');
    const s_P0 = getScale(units.P0 || 'kW', 'kW');
    const s_Pk = getScale(units.Pk || 'kW', 'kW');

    const SN = parseF(inputs.SN, 31.5) * s_SN; // MVA
    const P0 = parseF(inputs.P0, 31) * s_P0; // kW
    const I0_pct = parseF(inputs.I0_pct, 0.8); // %
    const Pk = parseF(inputs.Pk, 135) * s_Pk; // kW
    const Uk_pct = parseF(inputs.Uk_pct, 10.5); // %
    const S = parseF(inputs.S_load, 25.2) * s_S; // MVA

    // 铁耗 (不变损耗)
    const dP_Fe = P0 / 1000; // MW
    const dQ_Fe = (I0_pct / 100) * SN; // MVar
    // 铜耗 (可变损耗)
    const load_ratio_sq = Math.pow(S / SN, 2);
    const dP_Cu = (Pk / 1000) * load_ratio_sq; // MW
    const dQ_Cu = (Uk_pct / 100) * SN * load_ratio_sq; // MVar

    const dP_total = dP_Fe + dP_Cu;
    const dQ_total = dQ_Fe + dQ_Cu;

    return {
      results: [
        { label: "总有功损耗 ΔP_T", value: round(dP_total, 4), unit: "MW", highlight: true },
        { label: "总无功损耗 ΔQ_T", value: round(dQ_total, 4), unit: "MVar", highlight: true },
        { label: "不变铁耗 ΔS_Fe", value: `${round(dP_Fe, 4)} + j${round(dQ_Fe, 4)}`, unit: "MVA" },
        { label: "可变铜耗 ΔS_Cu", value: `${round(dP_Cu, 4)} + j${round(dQ_Cu, 4)}`, unit: "MVA" }
      ],
      substitution: `\\Delta S_{Fe} = \\frac{${P0}}{1000} + j\\frac{${I0_pct}\\times ${SN}}{100} = ${round(dP_Fe, 4)} + j${round(dQ_Fe, 4)}\\text{ MVA} \\\\ \\Delta S_{Cu} = \\left(${round(Pk/1000, 4)} + j${round((Uk_pct/100)*SN, 4)}\\right)\\left(\\frac{${S}}{${SN}}\\right)^2 = ${round(dP_Cu, 4)} + j${round(dQ_Cu, 4)}\\text{ MVA}`,
      tips: "铁损(励磁支路)只随外加电压变化，手算中近似恒定；铜损与负荷容量 S 的平方成正比。经济运行负荷率对应铁损等于铜损处。"
    };
  },

  // ═══════════════════════════════════════════════════════════════
  // #05 简单潮流：功率损耗
  // ═══════════════════════════════════════════════════════════════
  calcFormula5_PowerLoss(inputs, units = {}) {
    const s_P = getScale(units.P || 'MW', 'MW');
    const s_Q = getScale(units.Q || 'MVar', 'MW');
    const s_U = getScale(units.U || 'kV', 'kV');
    const s_R = getScale(units.R || 'Ω', 'Ω');
    const s_X = getScale(units.X || 'Ω', 'Ω');

    const P = parseF(inputs.P, 30) * s_P; // MW
    const Q = parseF(inputs.Q, 15) * s_Q; // MVar
    const U = parseF(inputs.U, 110) * s_U; // kV
    const R = parseF(inputs.R, 10.5) * s_R; // Ω
    const X = parseF(inputs.X, 24.2) * s_X; // Ω

    const S2 = Math.pow(P, 2) + Math.pow(Q, 2);
    const dP = (S2 * R) / Math.pow(U, 2); // MW
    const dQ = (S2 * X) / Math.pow(U, 2); // MVar

    return {
      results: [
        { label: "支路有功损耗 ΔP", value: round(dP, 4), unit: "MW", highlight: true },
        { label: "支路无功损耗 ΔQ", value: round(dQ, 4), unit: "MVar", highlight: true },
        { label: "通过视在功率 S", value: round(Math.sqrt(S2), 3), unit: "MVA" }
      ],
      substitution: `\\Delta P = \\frac{${P}^2 + ${Q}^2}{${U}^2} \\times ${R} = ${round(dP, 4)}\\text{ MW}, \\quad \\Delta Q = \\frac{${P}^2 + ${Q}^2}{${U}^2} \\times ${X} = ${round(dQ, 4)}\\text{ MVar}`,
      tips: "公式中 P, Q 必须使用通过该线路阻抗本身的功率，电压 U 取同侧运行电压或平均额定电压 Uav。"
    };
  },

  // ═══════════════════════════════════════════════════════════════
  // #06 简单潮流：电压降落与相角差
  // ═══════════════════════════════════════════════════════════════
  calcFormula6_VoltageDrop(inputs, units = {}) {
    const s_P = getScale(units.P || 'MW', 'MW');
    const s_Q = getScale(units.Q || 'MVar', 'MW');
    const s_U = getScale(units.U || 'kV', 'kV');

    const U = parseF(inputs.U, 110) * s_U; // kV
    const P = parseF(inputs.P, 25) * s_P; // MW
    const Q = parseF(inputs.Q, 12) * s_Q; // MVar
    const R = parseF(inputs.R, 12.5); // Ω
    const X = parseF(inputs.X, 25.0); // Ω

    const dU = (P * R + Q * X) / U; // kV 纵分量
    const du = (P * X - Q * R) / U; // kV 横分量

    const U_send = Math.sqrt(Math.pow(U + dU, 2) + Math.pow(du, 2));
    const delta_deg = (Math.atan2(du, U + dU) * 180) / Math.PI;

    return {
      results: [
        { label: "电压降落纵分量 ΔU", value: round(dU, 4), unit: "kV", highlight: true },
        { label: "电压降落横分量 δU", value: round(du, 4), unit: "kV", highlight: true },
        { label: "合成电压幅值 U₁", value: round(U_send, 4), unit: "kV", highlight: true },
        { label: "相角差 δ", value: round(delta_deg, 4), unit: "°" }
      ],
      substitution: `\\Delta U = \\frac{${P}\\times ${R} + ${Q}\\times ${X}}{${U}} = ${round(dU, 4)}\\text{ kV}, \\quad \\delta U = \\frac{${P}\\times ${X} - ${Q}\\times ${R}}{${U}} = ${round(du, 4)}\\text{ kV} \\\\ U_1 = \\sqrt{(${U} + ${round(dU, 4)})^2 + (${round(du, 4)})^2} = ${round(U_send, 4)}\\text{ kV}, \\quad \\delta = \\arctan\\frac{${round(du, 4)}}{${U}+${round(dU, 4)}} = ${round(delta_deg, 4)}^\\circ`,
      tips: "【考研高频陷阱】纵分量 ΔU 主导电压幅值变化；横分量 δU 主导电压相角偏转。已知末端求首端用加号；已知首端求末端用减号。"
    };
  },

  // ═══════════════════════════════════════════════════════════════
  // #07 简单潮流：环网潮流功率分布 (支持多运算负荷节点)
  // ═══════════════════════════════════════════════════════════════
  calcFormula7_RingPowerFlow(inputs, units = {}) {
    const nodeCount = parseInt(inputs.node_count, 10) || 2;
    const s_P = getScale(units.P1 || 'MW', 'MW');
    const s_Q = getScale(units.Q1 || 'MVar', 'MW');

    let P1 = parseF(inputs.P1, 20) * s_P, Q1 = parseF(inputs.Q1, 10) * s_Q;
    let R1 = parseF(inputs.R1, 4), X1 = parseF(inputs.X1, 8);

    let P2 = parseF(inputs.P2, 30) * s_P, Q2 = parseF(inputs.Q2, 15) * s_Q;
    let R2 = parseF(inputs.R2, 6), X2 = parseF(inputs.X2, 12);

    let R3 = parseF(inputs.R3, 5), X3 = parseF(inputs.X3, 10);

    let P3 = 0, Q3 = 0, R4 = 0, X4 = 0;
    if (nodeCount === 3) {
      P3 = parseF(inputs.P3, 10) * s_P;
      Q3 = parseF(inputs.Q3, 5) * s_Q;
      R4 = parseF(inputs.R4, 4);
      X4 = parseF(inputs.X4, 8);
    }

    let SA_P = 0, SA_Q = 0, SB_P = 0, SB_Q = 0;
    let R_sum = 0, X_sum = 0;
    let p_divide = "", q_divide = "";
    let subText = "";

    if (nodeCount === 1) {
      // 1 个负荷节点: A -> Z1 -> 1 -> Z2 -> B
      R_sum = R1 + R2;
      X_sum = X1 + X2;
      // SA = S1 * Z2* / ZΣ* = S1 * Z2 / ZΣ (假设同比例网或复阻抗化简)
      const Z_sum_sq = Math.pow(R_sum, 2) + Math.pow(X_sum, 2);
      // 分子: S1 * Z2* = (P1+jQ1)*(R2-jX2) = (P1 R2 + Q1 X2) + j(Q1 R2 - P1 X2)
      const num_re = P1 * R2 + Q1 * X2;
      const num_im = Q1 * R2 - P1 * X2;
      // 除以 (R_sum - jX_sum): (num_re + j num_im)*(R_sum + j X_sum) / (R_sum^2 + X_sum^2)
      SA_P = (num_re * R_sum - num_im * X_sum) / Z_sum_sq;
      SA_Q = (num_re * X_sum + num_im * R_sum) / Z_sum_sq;
      SB_P = P1 - SA_P;
      SB_Q = Q1 - SA_Q;
      p_divide = "负荷节点 1";
      q_divide = "负荷节点 1";
      subText = `S_A = \\frac{(${P1}+j${Q1})(${R2}-j${X2})}{${R_sum}-j${X_sum}} = ${round(SA_P, 3)} + j${round(SA_Q, 3)}\\text{ MVA}`;
    } else if (nodeCount === 2) {
      // 2 个负荷节点: A -> Z1 -> 1 -> Z2 -> 2 -> Z3 -> B
      // Z1B = Z2 + Z3, Z2B = Z3
      const R1B = R2 + R3, X1B = X2 + X3;
      const R2B = R3, X2B = X3;
      R_sum = R1 + R2 + R3;
      X_sum = X1 + X2 + X3;

      // 分子 = S1 * Z1B* + S2 * Z2B*
      const term1_re = P1 * R1B + Q1 * X1B, term1_im = Q1 * R1B - P1 * X1B;
      const term2_re = P2 * R2B + Q2 * X2B, term2_im = Q2 * R2B - P2 * X2B;
      const num_re = term1_re + term2_re;
      const num_im = term1_im + term2_im;
      const Z_sum_sq = Math.pow(R_sum, 2) + Math.pow(X_sum, 2);

      SA_P = (num_re * R_sum - num_im * X_sum) / Z_sum_sq;
      SA_Q = (num_re * X_sum + num_im * R_sum) / Z_sum_sq;
      SB_P = (P1 + P2) - SA_P;
      SB_Q = (Q1 + Q2) - SA_Q;

      // 寻找功率分降点
      const S12_P = SA_P - P1;
      const S12_Q = SA_Q - Q1;

      p_divide = S12_P >= 0 ? "负荷节点 2" : "负荷节点 1";
      q_divide = S12_Q >= 0 ? "负荷节点 2" : "负荷节点 1";

      subText = `S_A = \\frac{S_1(Z_{12}+Z_{2B})^* + S_2 Z_{2B}^*}{Z_\\Sigma^*} = \\frac{(${P1}+j${Q1})(${R1B}-j${X1B}) + (${P2}+j${Q2})(${R2B}-j${X2B})}{${R_sum}-j${X_sum}} = ${round(SA_P, 3)} + j${round(SA_Q, 3)}\\text{ MVA} \\\\ S_{12} = S_A - S_1 = (${round(SA_P,3)}-${P1}) + j(${round(SA_Q,3)}-${Q1}) = ${round(S12_P, 3)} + j${round(S12_Q, 3)}\\text{ MVA}`;
    } else {
      // 3 个负荷节点: A -> Z1 -> 1 -> Z2 -> 2 -> Z3 -> 3 -> Z4 -> B
      const R1B = R2 + R3 + R4, X1B = X2 + X3 + X4;
      const R2B = R3 + R4, X2B = X3 + X4;
      const R3B = R4, X3B = X4;
      R_sum = R1 + R2 + R3 + R4;
      X_sum = X1 + X2 + X3 + X4;

      const t1_re = P1 * R1B + Q1 * X1B, t1_im = Q1 * R1B - P1 * X1B;
      const t2_re = P2 * R2B + Q2 * X2B, t2_im = Q2 * R2B - P2 * X2B;
      const t3_re = P3 * R3B + Q3 * X3B, t3_im = Q3 * R3B - P3 * X3B;
      const num_re = t1_re + t2_re + t3_re;
      const num_im = t1_im + t2_im + t3_im;
      const Z_sum_sq = Math.pow(R_sum, 2) + Math.pow(X_sum, 2);

      SA_P = (num_re * R_sum - num_im * X_sum) / Z_sum_sq;
      SA_Q = (num_re * X_sum + num_im * R_sum) / Z_sum_sq;
      SB_P = (P1 + P2 + P3) - SA_P;
      SB_Q = (Q1 + Q2 + Q3) - SA_Q;

      const S12_P = SA_P - P1;
      const S23_P = S12_P - P2;
      p_divide = S12_P < 0 ? "负荷节点 1" : S23_P < 0 ? "负荷节点 2" : "负荷节点 3";
      q_divide = (SA_Q - Q1) < 0 ? "负荷节点 1" : (SA_Q - Q1 - Q2) < 0 ? "负荷节点 2" : "负荷节点 3";

      subText = `S_A = \\frac{\\sum_{i=1}^3 S_i Z_{iB}^*}{Z_\\Sigma^*} = ${round(SA_P, 3)} + j${round(SA_Q, 3)}\\text{ MVA}, \\quad S_B = ${round(SB_P, 3)} + j${round(SB_Q, 3)}\\text{ MVA}`;
    }

    return {
      results: [
        { label: "A端初步送出功率 S_A", value: `${round(SA_P, 3)} + j${round(SA_Q, 3)}`, unit: "MVA", highlight: true },
        { label: "B端初步送出功率 S_B", value: `${round(SB_P, 3)} + j${round(SB_Q, 3)}`, unit: "MVA", highlight: true },
        { label: "有功功率分降点", value: p_divide, unit: "", highlight: true },
        { label: "无功功率分降点", value: q_divide, unit: "" },
        { label: "环网总阻抗 Z_Σ", value: `${round(R_sum, 2)} + j${round(X_sum, 2)}`, unit: "Ω" }
      ],
      substitution: subText,
      tips: "【华电考研大题最核心】阻抗力矩法求得初步功率后，必须顺流判断各区段潮流方向。分降点为双向流入节点，全网最低电压往往出现在无功分降点！"
    };
  },

  // ═══════════════════════════════════════════════════════════════
  // #08 简单潮流：循环功率
  // ═══════════════════════════════════════════════════════════════
  calcFormula8_CirculatingPower(inputs, units = {}) {
    const s_UN = getScale(units.UN || 'kV', 'kV');
    const s_dU = getScale(units.dU_re || 'kV', 'kV');

    const UN = parseF(inputs.UN, 110) * s_UN; // kV
    const dU_re = parseF(inputs.dU_re, 3.5) * s_dU; // kV
    const dU_im = parseF(inputs.dU_im, 1.2) * s_dU; // kV
    const R_sum = parseF(inputs.R_sum, 12); // Ω
    const X_sum = parseF(inputs.X_sum, 28); // Ω

    // Sc = UN * ΔU* / ZΣ* = UN * (dU_re - j dU_im) / (R_sum - j X_sum)
    // 分子乘分母共轭: UN * (dU_re - j dU_im) * (R_sum + j X_sum) / (R_sum^2 + X_sum^2)
    const Z2 = Math.pow(R_sum, 2) + Math.pow(X_sum, 2);
    const Sc_P = (UN * (dU_re * R_sum + dU_im * X_sum)) / Z2;
    const Sc_Q = (UN * (dU_re * X_sum - dU_im * R_sum)) / Z2;
    const Sc_mag = Math.hypot(Sc_P, Sc_Q);

    return {
      results: [
        { label: "循环功率幅值 |S_C|", value: round(Sc_mag, 3), unit: "MVA", highlight: true },
        { label: "循环有功 P_C", value: round(Sc_P, 3), unit: "MW" },
        { label: "循环无功 Q_C", value: round(Sc_Q, 3), unit: "MVar", highlight: true }
      ],
      substitution: `\\dot{S}_C = \\frac{U_N \\cdot \\Delta \\dot{U}^*}{Z_\\Sigma^*} = \\frac{${UN} \\times (${dU_re} - j${dU_im})}{${R_sum} - j${X_sum}} = ${round(Sc_P, 3)} + j${round(Sc_Q, 3)}\\text{ MVA}`,
      tips: "循环功率是由环网两端电压幅值差或相角差引起的强制无功/有功流动。它在环网内无功空转，增加网损，可通过加装串联移相变压器消除。"
    };
  },

  // ═══════════════════════════════════════════════════════════════
  // 原有公式 1~47 其余函数保持完备
  // ═══════════════════════════════════════════════════════════════
  calcFormula1(inputs, units = {}) {
    const s_E = getScale(units.E_mag || 'kV', 'kV');
    const omega = parseF(inputs.omega, 314.16);
    const L = parseF(inputs.L_coil, 0.5);
    const C_uF = parseF(inputs.C_phase, 2.12);
    const E = parseF(inputs.E_mag, 6.35) * s_E;
    const C = C_uF * 1e-6;

    const IL = (E * 1000) / (omega * L);
    const IC = 3 * omega * C * (E * 1000);
    const I_res = IL - IC;
    const state = Math.abs(I_res) < 0.05 ? "完全补偿 (I=0)" : I_res > 0 ? "过补偿 (感性残流)" : "欠补偿 (容性残流)";

    return {
      results: [
        { label: "故障点残流 |I_Ck|", value: round(Math.abs(I_res), 3), unit: "A", highlight: true },
        { label: "补偿状态", value: state, unit: "" },
        { label: "电感电流 I_L", value: round(IL, 3), unit: "A" },
        { label: "总电容电流 I_CΣ", value: round(IC, 3), unit: "A" }
      ],
      substitution: `I_{Ck} = j\\left(\\frac{1}{\\omega L} - 3\\omega C\\right) E = ${round(I_res, 3)}\\text{ A}`,
      tips: "我国配网规程要求中性点采用过补偿方式，防止线路切除时发生全补偿铁磁谐振。"
    };
  },

  calcFormula2(inputs, units = {}) {
    const s_SB = getScale(units.S_B || 'MVA', 'MVA');
    const s_UB = getScale(units.U_B || 'kV', 'kV');
    const SB = parseF(inputs.S_B, 100) * s_SB;
    const UB = parseF(inputs.U_B, 115) * s_UB;
    const IB = SB / (Math.sqrt(3) * UB);
    const ZB = Math.pow(UB, 2) / SB;
    return {
      results: [
        { label: "基准阻抗 Z_B", value: round(ZB, 4), unit: "Ω", highlight: true },
        { label: "基准电流 I_B", value: round(IB, 4), unit: "kA", highlight: true }
      ],
      substitution: `Z_B = \\frac{U_B^2}{S_B} = \\frac{${UB}^2}{${SB}} = ${round(ZB, 4)}\\,\\Omega, \\quad I_B = \\frac{S_B}{\\sqrt{3}U_B} = ${round(IB, 4)}\\text{ kA}`,
      tips: "标幺值换算基础：X* = X(Ω) / ZB = X(Ω) · SB / UB²。"
    };
  },

  calcFormula6(inputs) {
    const U = parseF(inputs.U, 500);
    const Zc = parseF(inputs.Rc, 400);
    const Pn = Math.pow(U, 2) / Zc;
    return {
      results: [
        { label: "自然功率 P_N", value: round(Pn, 2), unit: "MW", highlight: true },
        { label: "波阻抗 Z_C", value: round(Zc, 1), unit: "Ω" }
      ],
      substitution: `P_N = \\frac{U_N^2}{Z_C} = \\frac{${U}^2}{${Zc}} = ${round(Pn, 2)}\\text{ MW}`,
      tips: "传输自然功率时，线路产生的容性无功等于吸收的感性无功，沿线电压完全平直。"
    };
  },

  calcFormula7(inputs, units = {}) {
    const s_U = getScale(units.U_RN || 'kV', 'kV');
    const s_I = getScale(units.I_RN || 'A', 'A');
    const Xr_pct = parseF(inputs.Xr_pct, 5);
    const U_RN = parseF(inputs.U_RN, 10) * s_U;
    const I_RN = parseF(inputs.I_RN, 600) * s_I;
    const XR = (Xr_pct * U_RN * 1000) / (100 * Math.sqrt(3) * I_RN);
    return {
      results: [
        { label: "电抗器电抗 X_R", value: round(XR, 4), unit: "Ω", highlight: true }
      ],
      substitution: `X_R = \\frac{${Xr_pct}\\% \\times (${U_RN}\\times 10^3)}{100\\sqrt{3}\\times ${I_RN}} = ${round(XR, 4)}\\,\\Omega`,
      tips: "电抗器铭牌电抗百分比基于自身额定参数。"
    };
  },

  calcFormula9(inputs) {
    const SN1 = parseF(inputs.SN1, 100), SN2 = parseF(inputs.SN2, 100), SN3 = parseF(inputs.SN3, 50);
    const Pk12 = parseF(inputs.Pk12, 100), Pk13 = parseF(inputs.Pk13, 80), Pk23 = parseF(inputs.Pk23, 70);
    const Pk13_prime = Pk13 * Math.pow(SN1 / SN3, 2);
    const Pk23_prime = Pk23 * Math.pow(SN2 / SN3, 2);
    const Pk1 = 0.5 * (Pk12 + Pk13_prime - Pk23_prime);
    const Pk2 = 0.5 * (Pk12 + Pk23_prime - Pk13_prime);
    const Pk3 = 0.5 * (Pk13_prime + Pk23_prime - Pk12);
    return {
      results: [
        { label: "1号绕组损耗 Pk1", value: round(Pk1, 2), unit: "kW", highlight: true },
        { label: "2号绕组损耗 Pk2", value: round(Pk2, 2), unit: "kW" },
        { label: "3号绕组损耗 Pk3", value: round(Pk3, 2), unit: "kW" }
      ],
      substitution: `P_{k(1-3)}' = ${Pk13} \\times (${SN1}/${SN3})^2 = ${round(Pk13_prime, 1)}\\text{ kW}, \\; P_{k1} = ${round(Pk1, 2)}\\text{ kW}`,
      tips: "容量比 100/100/50 时，50% 容量绕组的测试损耗必须乘以 (100/50)² = 4 折算。"
    };
  },

  calcFormula10(inputs) {
    const Pkmax = parseF(inputs.Pkmax, 250);
    const UN = parseF(inputs.UN, 110);
    const SN = parseF(inputs.SN, 31.5);
    const RT_100 = 0.5 * ((Pkmax * Math.pow(UN, 2)) / (1000 * Math.pow(SN, 2)));
    const RT_50 = 2 * RT_100;
    return {
      results: [
        { label: "100%容量绕组电阻 RT(100%)", value: round(RT_100, 4), unit: "Ω", highlight: true },
        { label: "50%容量绕组电阻 RT(50%)", value: round(RT_50, 4), unit: "Ω", highlight: true }
      ],
      substitution: `R_{T(100\\%)} = \\frac{1}{2}\\frac{${Pkmax}\\times ${UN}^2}{1000\\times ${SN}^2} = ${round(RT_100, 4)}\\,\\Omega`,
      tips: "50% 容量的绕组截面较小，其电阻是 100% 绕组的 2 倍。"
    };
  },

  calcFormula11(inputs, units = {}) {
    const s_U = getScale(units.U || 'kV', 'kV');
    const s_P = getScale(units.P || 'MW', 'MW');
    const s_Q = getScale(units.Q || 'MVar', 'MW');
    const U = parseF(inputs.U, 10.5) * s_U;
    const P = parseF(inputs.P, 25) * s_P;
    const Q = parseF(inputs.Q, 15) * s_Q;
    const xd = parseF(inputs.xd, 1.2);
    const delta_deg = (Math.atan2(P * xd, Math.pow(U, 2) + Q * xd) * 180) / Math.PI;
    const Eq = Math.sqrt(Math.pow(U + (Q * xd) / U, 2) + Math.pow((P * xd) / U, 2));
    return {
      results: [
        { label: "功角 δ", value: round(delta_deg, 3), unit: "°", highlight: true },
        { label: "内电势 Eq", value: round(Eq, 3), unit: "kV", highlight: true }
      ],
      substitution: `\\tan\\delta = \\frac{${P}\\times ${xd}}{${U}^2 + ${Q}\\times ${xd}} \\implies \\delta = ${round(delta_deg, 3)}^\\circ, \\quad E_q = ${round(Eq, 3)}\\text{ kV}`,
      tips: "发电机静态稳定极限对应功角 δ = 90°。"
    };
  },

  calcFormula13(inputs, units = {}) {
    const s_U = getScale(units.UN || 'kV', 'kV');
    const U1 = parseF(inputs.U1, 115) * s_U;
    const U2 = parseF(inputs.U2, 108) * s_U;
    const UN = parseF(inputs.UN, 110) * s_U;
    const dU_pct = ((U1 - U2) / UN) * 100;
    return {
      results: [
        { label: "电压损耗 ΔU%", value: round(dU_pct, 3), unit: "%", highlight: true },
        { label: "绝对压差", value: round(U1 - U2, 3), unit: "kV" }
      ],
      substitution: `\\Delta U\\% = \\frac{${U1} - ${U2}}{${UN}}\\times 100\\% = ${round(dU_pct, 3)}\\%`,
      tips: "电压损耗为数值代数差，电压降落为向量相量差。"
    };
  },

  calcFormula14(inputs, units = {}) {
    const s_U = getScale(units.UN || 'kV', 'kV');
    const U = parseF(inputs.U, 113) * s_U;
    const UN = parseF(inputs.UN, 110) * s_U;
    const dev = ((U - UN) / UN) * 100;
    return {
      results: [
        { label: "电压偏移率", value: round(dev, 3), unit: "%", highlight: true }
      ],
      substitution: `\\Delta U_{dev}\\% = \\frac{${U} - ${UN}}{${UN}} \\times 100\\% = ${round(dev, 3)}\\%`,
      tips: "35kV 及以上电压偏差一般允许在 ±5%~±7% 范围内。"
    };
  },

  calcFormula15(inputs, units = {}) {
    const s_U = getScale(units.U20 || 'kV', 'kV');
    const U20 = parseF(inputs.U20, 115) * s_U;
    const U2 = parseF(inputs.U2, 105) * s_U;
    const adj = ((U20 - U2) / U20) * 100;
    return {
      results: [
        { label: "电压调整率 ΔU_adj%", value: round(adj, 3), unit: "%", highlight: true }
      ],
      substitution: `\\Delta U_{adj}\\% = \\frac{${U20} - ${U2}}{${U20}}\\times 100\\% = ${round(adj, 3)}\\%`,
      tips: "反映同一地点由负载变为空载时端电压的变化。"
    };
  },

  calcFormula16(inputs, units = {}) {
    const s_W = getScale(units.W || 'MWh', 'MWh');
    const s_P = getScale(units.Pmax || 'MW', 'MW');
    const W = parseF(inputs.W, 450000) * s_W;
    const Pmax = parseF(inputs.Pmax, 100) * s_P;
    const Tmax = W / Pmax;
    return {
      results: [
        { label: "最大负荷利用小时数 T_max", value: round(Tmax, 1), unit: "h", highlight: true }
      ],
      substitution: `T_{\\max} = \\frac{${W}}{${Pmax}} = ${round(Tmax, 1)}\\text{ h}`,
      tips: "Tmax 绝不可能超过 8760 小时。"
    };
  },

  calcFormula17(inputs, units = {}) {
    const s_W = getScale(units.dW || 'MWh', 'MWh');
    const s_P = getScale(units.dPmax || 'MW', 'MW');
    const dW = parseF(inputs.dW, 12000) * s_W;
    const dPmax = parseF(inputs.dPmax, 3.2) * s_P;
    const tau = dW / dPmax;
    return {
      results: [
        { label: "最大功率损耗时间 τ", value: round(tau, 1), unit: "h", highlight: true }
      ],
      substitution: `\\tau = \\frac{${dW}}{${dPmax}} = ${round(tau, 1)}\\text{ h}`,
      tips: "年电能损耗 ΔW = ΔPmax · τ。"
    };
  },

  calcFormula18(inputs, units = {}) {
    const s_W = getScale(units.W || 'kWh', 'kWh');
    const s_P = getScale(units.Pmax || 'kW', 'kW');
    const W = parseF(inputs.W, 525600) * s_W;
    const Pmax = parseF(inputs.Pmax, 100) * s_P;
    const beta = (W / (8760 * Pmax)) * 100;
    return {
      results: [
        { label: "年负荷率 β", value: round(beta, 2), unit: "%", highlight: true }
      ],
      substitution: `\\beta = \\frac{${W}}{8760 \\times ${Pmax}} = ${round(beta, 2)}\\%`,
      tips: "负荷越平稳，β 越接近 100%。"
    };
  },

  calcFormula22(inputs, units = {}) {
    const s_U = getScale(units.U2 || 'kV', 'kV');
    const s_L = getScale(units.L || 'km', 'km');
    const U2 = parseF(inputs.U2, 220) * s_U;
    const b1 = parseF(inputs.b1, 2.8e-6);
    const x1 = parseF(inputs.x1, 0.4);
    const L = parseF(inputs.L, 200) * s_L;
    const dU = 0.5 * U2 * b1 * x1 * Math.pow(L, 2);
    return {
      results: [
        { label: "空载升压值 ΔU", value: round(dU, 4), unit: "kV", highlight: true }
      ],
      substitution: `\\Delta U = \\frac{1}{2} U_2 b_1 x_1 L^2 = ${round(dU, 4)}\\text{ kV}`,
      tips: "费兰梯效应：长距离超高压空载线路末端电压高于首端。"
    };
  },

  calcFormula30(inputs, units = {}) {
    const s_P = getScale(units.dP || 'MW', 'MW');
    const dP = parseF(inputs.dP, 20) * s_P;
    const df = parseF(inputs.df, 0.2);
    const fN = parseF(inputs.fN, 50);
    const PGN = parseF(inputs.PGN, 100);
    const KG = Math.abs(dP / df);
    const KG_star = KG * (fN / PGN);
    const sigma = (1 / KG_star) * 100;
    return {
      results: [
        { label: "单位调节功率有名值 KG", value: round(KG, 3), unit: "MW/Hz", highlight: true },
        { label: "标幺值 KG*", value: round(KG_star, 3), unit: "p.u.", highlight: true },
        { label: "调差系数 σ%", value: round(sigma, 2), unit: "%" }
      ],
      substitution: `K_G = \\frac{${dP}}{${df}} = ${round(KG, 3)}\\text{ MW/Hz}, \\quad K_{G*} = ${round(KG_star, 3)}`,
      tips: "发电机调差系数一般在 3%~5% 之间。"
    };
  },

  calcFormula31(inputs, units = {}) {
    const s_P = getScale(units.dP || 'MW', 'MW');
    const dP = parseF(inputs.dP, 5) * s_P;
    const df = parseF(inputs.df, 0.2);
    const fN = parseF(inputs.fN, 50);
    const PLN = parseF(inputs.PLN, 100);
    const KL = dP / df;
    const KL_star = KL * (fN / PLN);
    return {
      results: [
        { label: "负荷调节功率有名值 KL", value: round(KL, 3), unit: "MW/Hz", highlight: true },
        { label: "标幺值 KL*", value: round(KL_star, 3), unit: "p.u." }
      ],
      substitution: `K_L = \\frac{${dP}}{${df}} = ${round(KL, 3)}\\text{ MW/Hz}, \\quad K_{L*} = ${round(KL_star, 3)}`,
      tips: "频率下降时负荷吸收有功自发减小。"
    };
  },

  calcFormula32(inputs) {
    const KG = parseF(inputs.KG, 80);
    const KL = parseF(inputs.KL, 20);
    const KS = KG + KL;
    return {
      results: [
        { label: "系统总调节功率 KS", value: round(KS, 3), unit: "MW/Hz", highlight: true }
      ],
      substitution: `K_S = K_G + K_L = ${KG} + ${KL} = ${round(KS, 3)}\\text{ MW/Hz}`,
      tips: "系统一次调频频差 Δf = -ΔPL / KS。"
    };
  },

  calcFormula33(inputs) {
    const dPLA = parseF(inputs.dPLA, 30), dPGA = parseF(inputs.dPGA, 0);
    const dPLB = parseF(inputs.dPLB, 0), dPGB = parseF(inputs.dPGB, 0);
    const KA = parseF(inputs.KA, 120), KB = parseF(inputs.KB, 180);
    const df = ((dPLA - dPGA) + (dPLB - dPGB)) / (KA + KB);
    return {
      results: [
        { label: "互联系统频差 Δf", value: round(df, 4), unit: "Hz", highlight: true },
        { label: "最终频率", value: round(50 - df, 4), unit: "Hz" }
      ],
      substitution: `\\Delta f = \\frac{(${dPLA}-${dPGA}) + (${dPLB}-${dPGB})}{${KA}+${KB}} = ${round(df, 4)}\\text{ Hz}`,
      tips: "Δf > 0 表示全系统频率下降。"
    };
  },

  calcFormula34(inputs) {
    const dPLA = parseF(inputs.dPLA, 30), dPGA = parseF(inputs.dPGA, 0);
    const dPLB = parseF(inputs.dPLB, 0), dPGB = parseF(inputs.dPGB, 0);
    const KA = parseF(inputs.KA, 120), KB = parseF(inputs.KB, 180);
    const dPAB = (KA * (dPLB - dPGB) - KB * (dPLA - dPGA)) / (KA + KB);
    return {
      results: [
        { label: "联络线交换功率变化 ΔP_AB", value: round(dPAB, 3), unit: "MW", highlight: true }
      ],
      substitution: `\\Delta P_{AB} = \\frac{${KA}(${dPLB}-${dPGB}) - ${KB}(${dPLA}-${dPGA})}{${KA}+${KB}} = ${round(dPAB, 3)}\\text{ MW}`,
      tips: "A区负荷增加时 ΔPAB 为负，说明功率从 B 流向 A 支援。"
    };
  },

  calcFormula38(inputs, units = {}) {
    const s_U = getScale(units.U1_prime || 'kV', 'kV');
    const k = parseF(inputs.k, 1.05);
    const U1_prime = parseF(inputs.U1_prime, 112) * s_U;
    const U2 = parseF(inputs.U2, 10.5) * s_U;
    const X = parseF(inputs.X, 15);
    const QC = (Math.pow(k, 2) * U1_prime / X) * (U1_prime - (U2 * k));
    return {
      results: [
        { label: "补偿电容容量 Qc", value: round(Math.abs(QC), 3), unit: "MVar", highlight: true }
      ],
      substitution: `Q_C = \\frac{${k}^2 \\times ${U1_prime}}{${X}} (${U1_prime} - ${U2}\\times ${k}) = ${round(QC, 3)}\\text{ MVar}`,
      tips: "调压大题必须兼顾最大负荷与最小负荷。"
    };
  },

  calcFormula39(inputs, units = {}) {
    const s_U = getScale(units.Uav || 'kV', 'kV');
    const s_I = getScale(units.Ik || 'kA', 'kA');
    const Uav = parseF(inputs.Uav, 115) * s_U;
    const Ik = parseF(inputs.Ik, 12.5) * s_I;
    const Sk = Math.sqrt(3) * Uav * Ik;
    return {
      results: [
        { label: "短路容量 Sk", value: round(Sk, 2), unit: "MVA", highlight: true }
      ],
      substitution: `S_k = \\sqrt{3} U_{av} I_k = \\sqrt{3}\\times ${Uav}\\times ${Ik} = ${round(Sk, 2)}\\text{ MVA}`,
      tips: "短路容量计算必须用平均额定电压 Uav！"
    };
  },

  calcFormula40(inputs, units = {}) {
    const s_I = getScale(units.Ik || 'kA', 'kA');
    const Ik = parseF(inputs.Ik, 15) * s_I;
    const KM = parseF(inputs.KM, 1.8);
    const ish = Math.sqrt(2) * KM * Ik;
    const Ish_rms = Ik * Math.sqrt(1 + 2 * Math.pow(KM - 1, 2));
    return {
      results: [
        { label: "冲击电流峰值 i_sh", value: round(ish, 3), unit: "kA", highlight: true },
        { label: "最大有效值电流 I_sh", value: round(Ish_rms, 3), unit: "kA", highlight: true }
      ],
      substitution: `i_{sh} = \\sqrt{2}\\times ${KM}\\times ${Ik} = ${round(ish, 3)}\\text{ kA}, \\quad I_{sh} = ${round(Ish_rms, 3)}\\text{ kA}`,
      tips: "发生在短路后约半个周期 (t=0.01s) 瞬间。"
    };
  },

  calcFormula41(inputs) {
    const Fa_mag = parseF(inputs.Fa_mag, 1.0), Fa_deg = parseF(inputs.Fa_deg, 0);
    const Fb_mag = parseF(inputs.Fb_mag, 1.0), Fb_deg = parseF(inputs.Fb_deg, -120);
    const Fc_mag = parseF(inputs.Fc_mag, 1.0), Fc_deg = parseF(inputs.Fc_deg, 120);

    const toRad = deg => (deg * Math.PI) / 180;
    const a_re = Fa_mag * Math.cos(toRad(Fa_deg)), a_im = Fa_mag * Math.sin(toRad(Fa_deg));
    const b_re = Fb_mag * Math.cos(toRad(Fb_deg)), b_im = Fb_mag * Math.sin(toRad(Fb_deg));
    const c_re = Fc_mag * Math.cos(toRad(Fc_deg)), c_im = Fc_mag * Math.sin(toRad(Fc_deg));

    const opA_re = -0.5, opA_im = Math.sqrt(3) / 2;
    const opA2_re = -0.5, opA2_im = -Math.sqrt(3) / 2;

    const f1_re = (a_re + (opA_re*b_re - opA_im*b_im) + (opA2_re*c_re - opA2_im*c_im)) / 3;
    const f1_im = (a_im + (opA_re*b_im + opA_im*b_re) + (opA2_re*c_im + opA2_im*c_re)) / 3;

    return {
      results: [
        { label: "正序分量幅值 |F₁|", value: round(Math.hypot(f1_re, f1_im), 4), unit: "p.u.", highlight: true },
        { label: "零序分量幅值 |F₀|", value: round(Math.hypot((a_re+b_re+c_re)/3, (a_im+b_im+c_im)/3), 4), unit: "p.u." }
      ],
      substitution: `\\dot{F}_1 = \\frac{1}{3}(\\dot{F}_a + a\\dot{F}_b + a^2\\dot{F}_c) = ${round(Math.hypot(f1_re, f1_im), 4)}`,
      tips: "旋转算子 a = e^(j120°) = -0.5 + j(√3/2)。"
    };
  },

  calcFormula43(inputs) {
    const Ef0 = parseF(inputs.Ef0, 1.0);
    const x1 = parseF(inputs.x1, 0.2), x2 = parseF(inputs.x2, 0.2), x0 = parseF(inputs.x0, 0.1);
    const If1 = Ef0 / (x1 + x2 + x0);
    return {
      results: [
        { label: "故障相短路电流 |I_fa|", value: round(3 * If1, 4), unit: "p.u.", highlight: true },
        { label: "各序电流 |I_f1|=|I_f2|=|I_f0|", value: round(If1, 4), unit: "p.u." },
        { label: "附加阻抗 xΔ", value: round(x2 + x0, 4), unit: "p.u." }
      ],
      substitution: `I_{f1} = \\frac{${Ef0}}{${x1}+${x2}+${x0}} = ${round(If1, 4)}, \\quad I_{fa} = 3I_{f1} = ${round(3*If1, 4)}\\text{ p.u.}`,
      tips: "单相接地三序网串联，附加阻抗 xΔ = x2 + x0。"
    };
  },

  calcFormula44(inputs) {
    const Ef0 = parseF(inputs.Ef0, 1.0);
    const x1 = parseF(inputs.x1, 0.2), x2 = parseF(inputs.x2, 0.2);
    const If1 = Ef0 / (x1 + x2);
    return {
      results: [
        { label: "短路相电流 |I_fb|=|I_fc|", value: round(Math.sqrt(3) * If1, 4), unit: "p.u.", highlight: true },
        { label: "正序电流 |I_f1|", value: round(If1, 4), unit: "p.u." }
      ],
      substitution: `I_{f1} = \\frac{${Ef0}}{${x1}+${x2}} = ${round(If1, 4)}, \\quad I_{fb} = \\sqrt{3}I_{f1} = ${round(Math.sqrt(3)*If1, 4)}\\text{ p.u.}`,
      tips: "两相短路正负序网串联，零序不参与。"
    };
  },

  calcFormula45(inputs) {
    const Ef0 = parseF(inputs.Ef0, 1.0);
    const x1 = parseF(inputs.x1, 0.2), x2 = parseF(inputs.x2, 0.2), x0 = parseF(inputs.x0, 0.1);
    const x_par = (x2 * x0) / (x2 + x0);
    const If1 = Ef0 / (x1 + x_par);
    return {
      results: [
        { label: "正序电流 |I_f1|", value: round(If1, 4), unit: "p.u.", highlight: true },
        { label: "附加阻抗 xΔ = x2 // x0", value: round(x_par, 4), unit: "p.u." }
      ],
      substitution: `x_\\Delta = \\frac{${x2}\\times ${x0}}{${x2}+${x0}} = ${round(x_par, 4)}, \\quad I_{f1} = ${round(If1, 4)}\\text{ p.u.}`,
      tips: "两相接地短路：负序与零序并联后再与正序串联。"
    };
  },

  calcFormula46(inputs) {
    const UA1_mag = parseF(inputs.UA1_mag, 1.0);
    const UA1_deg = parseF(inputs.UA1_deg, 0);
    const N = parseInt(inputs.N_group, 10) || 11;
    const Ua1_deg = ((UA1_deg - N * 30) % 360 + 360) % 360;
    const Ua2_deg = ((UA1_deg + N * 30) % 360 + 360) % 360;
    return {
      results: [
        { label: "低压侧正序相角", value: round(Ua1_deg, 1), unit: "°", highlight: true },
        { label: "低压侧负序相角", value: round(Ua2_deg, 1), unit: "°", highlight: true }
      ],
      substitution: `\\dot{U}_{a1} = \\angle (${UA1_deg} - ${N}\\times 30^\\circ) = \\angle ${round(Ua1_deg, 1)}^\\circ`,
      tips: "Yd-11 变压器正序低压落后 330°（即超前 30°）。"
    };
  },

  calcFormula47(inputs) {
    const Ef0 = parseF(inputs.Ef0, 1.0);
    const x1 = parseF(inputs.x1, 0.2), x2 = parseF(inputs.x2, 0.2), x0 = parseF(inputs.x0, 0.1);
    const zf = parseF(inputs.zf, 0);
    const type = inputs.fault_type || "f1";

    let x_delta = 0, M = 1;
    if (type === "f3") { x_delta = zf; M = 1; }
    else if (type === "f1") { x_delta = x2 + x0 + 3 * zf; M = 3; }
    else if (type === "f2") { x_delta = x2 + zf; M = Math.sqrt(3); }
    else if (type === "f11") {
      const z0_total = x0 + 3 * zf;
      x_delta = (x2 * z0_total) / (x2 + z0_total);
      M = Math.sqrt(3);
    }
    const If1 = Ef0 / (x1 + x_delta);
    const If = M * If1;
    return {
      results: [
        { label: "短路相电流有效值 If", value: round(If, 4), unit: "p.u.", highlight: true },
        { label: "附加阻抗 xΔ", value: round(x_delta, 4), unit: "p.u." }
      ],
      substitution: `I_f = M \\frac{E_{f0}}{x_1 + x_\\Delta} = ${round(M, 3)} \\times \\frac{${Ef0}}{${x1} + ${round(x_delta, 4)}} = ${round(If, 4)}\\text{ p.u.}`,
      tips: "正序等效法则将各类短路统一为串接 xΔ 的三相短路形式。"
    };
  },

  calcFormula45_StabilityMargin(inputs) {
    const P0 = parseF(inputs.P0, 100);
    const PM = parseF(inputs.PM, 135);
    const Kp = ((PM - P0) / P0) * 100;
    return {
      results: [
        { label: "静态稳定储备系数 Kp", value: round(Kp, 2), unit: "%", highlight: true }
      ],
      substitution: `K_p = \\frac{P_M - P_0}{P_0} \\times 100\\% = \\frac{${PM} - ${P0}}{${P0}} \\times 100\\% = ${round(Kp, 2)}\\%`,
      tips: "国标要求正常运行方式下静态稳定储备系数 Kp 不低于 15%~20%，事故后不低于 10%。"
    };
  },

  calcFormula47_InertiaConstant(inputs) {
    const TJ1 = parseF(inputs.TJ1, 8), SN1 = parseF(inputs.SN1, 300);
    const TJ2 = parseF(inputs.TJ2, 10), SN2 = parseF(inputs.SN2, 600);
    const SB = parseF(inputs.SB, 100);
    const TJ_sigma = (TJ1 * SN1 + TJ2 * SN2) / SB;
    return {
      results: [
        { label: "系统等效惯性时间常数 TJΣ", value: round(TJ_sigma, 2), unit: "s", highlight: true }
      ],
      substitution: `T_{J\\Sigma} = \\frac{${TJ1}\\times ${SN1} + ${TJ2}\\times ${SN2}}{${SB}} = ${round(TJ_sigma, 2)}\\text{ s}`,
      tips: "多机系统中各机组惯性时间常数按额定容量折算到统一系统基准 SB。"
    };
  },

  calcFormulaRef() {
    return {
      results: [{ label: "状态", value: "理论方程 / 判据标准", unit: "" }],
      substitution: "该公式为经典微分/拓扑方程，手算大题中作为分析判据，支持在卡片查看标准 LaTeX 结构与避坑要点。",
      tips: "华电 811 考研每年必考：牛顿-拉夫逊法修正方程的雅可比矩阵元素偏导数计算推导。"
    };
  }
};
