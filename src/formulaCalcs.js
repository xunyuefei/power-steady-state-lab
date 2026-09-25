import { round, parseF } from "./mathUtils.js";

/**
 * 47 个独立公式纯数字计算引擎与手算代入生成器
 * 每个函数接收 inputs 对象，输出:
 * - results: Array<{ label: string, value: string, unit: string, highlight?: boolean }>
 * - substitution: string (LaTeX 或紧凑文本代入式，对应草稿纸核验)
 * - tips?: string (考研重点与避坑指南)
 */

export const FORMULA_CALCULATORS = {
  // 1. 消弧线圈补偿电流
  calcFormula1(inputs) {
    const omega = parseF(inputs.omega, 314.16);
    const L = parseF(inputs.L_coil, 0.5);
    const C_uF = parseF(inputs.C_phase, 2.12);
    const E = parseF(inputs.E_mag, 6.35); // kV
    const C = C_uF * 1e-6; // F

    const IL = (E * 1000) / (omega * L); // A
    const IC = 3 * omega * C * (E * 1000); // A
    const I_res = IL - IC; // A (感性残流为正)

    const state = Math.abs(I_res) < 0.05 ? "完全补偿 (I=0)" : I_res > 0 ? "过补偿 (感性残流)" : "欠补偿 (容性残流)";

    return {
      results: [
        { label: "故障点残流 |I_Ck|", value: round(Math.abs(I_res), 3), unit: "A", highlight: true },
        { label: "补偿状态", value: state, unit: "" },
        { label: "电感电流 I_L", value: round(IL, 3), unit: "A" },
        { label: "总电容电流 I_CΣ", value: round(IC, 3), unit: "A" }
      ],
      substitution: `I_L = \\frac{${E}\\times 10^3}{${omega}\\times ${L}} = ${round(IL, 2)}\\text{ A}, \\; I_{C\\Sigma} = 3\\times ${omega}\\times (${C_uF}\\times 10^{-6})\\times (${E}\\times 10^3) = ${round(IC, 2)}\\text{ A} \\implies I_{Ck} = ${round(I_res, 3)}\\text{ A}`,
      tips: "华电考研高频考点：我国配电网规程要求中性点采用【过补偿方式】，避免线路切除时发生全补偿铁磁谐振过电压。"
    };
  },

  // 2. 基准值关系
  calcFormula2(inputs) {
    const S_B = parseF(inputs.S_B, 100); // MVA
    const U_B = parseF(inputs.U_B, 115); // kV

    const I_B = S_B / (Math.sqrt(3) * U_B); // kA
    const Z_B = Math.pow(U_B, 2) / S_B; // Ω

    return {
      results: [
        { label: "基准阻抗 Z_B", value: round(Z_B, 4), unit: "Ω", highlight: true },
        { label: "基准电流 I_B", value: round(I_B, 4), unit: "kA", highlight: true }
      ],
      substitution: `Z_B = \\frac{U_B^2}{S_B} = \\frac{${U_B}^2}{${S_B}} = ${round(Z_B, 4)}\\,\\Omega, \\quad I_B = \\frac{S_B}{\\sqrt{3}U_B} = \\frac{${S_B}}{\\sqrt{3}\\times ${U_B}} = ${round(I_B, 4)}\\text{ kA}`,
      tips: "计算标幺值前必须统一全网基准！高压线路换算时阻抗标幺值 X_* = X(Ω) / Z_B = X(Ω) · S_B / U_B²。"
    };
  },

  // 3. 线路电阻
  calcFormula3(inputs) {
    const rho = parseF(inputs.rho, 31.5);
    const S = parseF(inputs.S_cross, 240);
    const L = parseF(inputs.L_line, 100);

    const r1 = rho / S;
    const R_total = r1 * L;

    return {
      results: [
        { label: "单位电阻 r₁", value: round(r1, 5), unit: "Ω/km", highlight: true },
        { label: "线路全长总电阻 R", value: round(R_total, 4), unit: "Ω", highlight: true }
      ],
      substitution: `r_1 = \\frac{\\rho}{S} = \\frac{${rho}}{${S}} = ${round(r1, 5)}\\,\\Omega/\\text{km}, \\quad R = r_1 \\times L = ${round(r1, 5)} \\times ${L} = ${round(R_total, 4)}\\,\\Omega`,
      tips: "铝线 ρ_Al = 31.5 Ω·mm²/km，铜线 ρ_Cu = 18.8 Ω·mm²/km。华电考研中分裂导线总电阻为单相各根并联。"
    };
  },

  // 4. 线路电抗
  calcFormula4(inputs) {
    const Dm = parseF(inputs.Deq, 10.5); // m
    const r_mm = parseF(inputs.r, 13.5); // mm
    const n = Math.max(1, parseInt(inputs.n, 10) || 1);
    const d_mm = parseF(inputs.d, 450); // mm

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

    return {
      results: [
        { label: "等效半径 r_eq", value: round(req_m * 1000, 2), unit: "mm" },
        { label: "单位电抗 x₁", value: round(x1, 5), unit: "Ω/km", highlight: true }
      ],
      substitution: `x_1 = 0.1445\\lg\\frac{${Dm}}{${round(req_m, 5)}} + \\frac{0.0157}{${n}} = ${round(x1, 5)}\\,\\Omega/\\text{km}`,
      tips: "分裂导线增大了等效半径 req，显著减小了线路电抗 x1（减小约 20%~30%），并提高了电纳 b1，提升静态稳定极限。"
    };
  },

  // 5. 线路电导与电纳
  calcFormula5(inputs) {
    const dPg = parseF(inputs.delta_Pg, 0.5); // kW/km
    const U = parseF(inputs.U_nom, 220); // kV
    const Dm = parseF(inputs.Deq, 7.0); // m
    const req_mm = parseF(inputs.req, 65.7); // mm

    const g1 = (dPg / Math.pow(U, 2)) * 1e-3; // S/km
    const req_m = req_mm / 1000;
    const b1 = (7.58 / Math.log10(Dm / req_m)) * 1e-6; // S/km

    return {
      results: [
        { label: "单位电导 g₁", value: (g1 * 1e6).toFixed(4), unit: "×10⁻⁶ S/km" },
        { label: "单位电纳 b₁", value: (b1 * 1e6).toFixed(4), unit: "×10⁻⁶ S/km", highlight: true }
      ],
      substitution: `b_1 = \\frac{7.58}{\\lg\\frac{${Dm}}{${round(req_m, 4)}}} \\times 10^{-6} = ${round(b1 * 1e6, 4)} \\times 10^{-6}\\text{ S/km}`,
      tips: "110kV 及以下架空线通常电纳很小可忽略；220kV 及以上线路必须计及对地电纳产生的充电功率 Qc = U²·b1·L。"
    };
  },

  // 6. 波阻抗与自然功率
  calcFormula6(inputs) {
    const U = parseF(inputs.U, 500); // kV
    const Zc = parseF(inputs.Rc, 400); // Ω

    const Pn = Math.pow(U, 2) / Zc; // MW

    return {
      results: [
        { label: "自然功率 P_N", value: round(Pn, 2), unit: "MW", highlight: true },
        { label: "波阻抗 Z_C", value: round(Zc, 1), unit: "Ω" }
      ],
      substitution: `P_N = \\frac{U_N^2}{Z_C} = \\frac{${U}^2}{${Zc}} = ${round(Pn, 2)}\\text{ MW}`,
      tips: "当传输功率 P = P_N 时，线路产生的无功功率刚好等于消耗的无功功率，沿线电压平直，无无功流动。"
    };
  },

  // 7. 电抗器参数
  calcFormula7(inputs) {
    const Xr_pct = parseF(inputs.Xr_pct, 5); // %
    const U_RN = parseF(inputs.U_RN, 10); // kV
    const I_RN = parseF(inputs.I_RN, 600); // A

    const X_R = (Xr_pct * U_RN * 1000) / (100 * Math.sqrt(3) * I_RN); // Ω

    return {
      results: [
        { label: "电抗器电抗 X_R", value: round(X_R, 4), unit: "Ω", highlight: true }
      ],
      substitution: `X_R = \\frac{${Xr_pct}\\% \\times (${U_RN}\\times 10^3)}{100\\sqrt{3}\\times ${I_RN}} = ${round(X_R, 4)}\\,\\Omega`,
      tips: "限流电抗器电抗百分比 X_R% 是以电抗器自身的额定参数为基准的，归算到系统基准时需乘以 (SB/SRN)·(URN/UB)²。"
    };
  },

  // 8. 变压器四参数
  calcFormula8(inputs) {
    const Pk = parseF(inputs.Pk, 135); // kW
    const Uk_pct = parseF(inputs.Uk_pct, 10.5); // %
    const P0 = parseF(inputs.P0, 31); // kW
    const I0_pct = parseF(inputs.I0_pct, 0.8); // %
    const UN = parseF(inputs.UN, 110); // kV
    const SN = parseF(inputs.SN, 31.5); // MVA

    const RT = (Pk * Math.pow(UN, 2)) / (1000 * Math.pow(SN, 2));
    const XT = (Uk_pct * Math.pow(UN, 2)) / (100 * SN);
    const GT = (P0 / (1000 * Math.pow(UN, 2))); // S
    const BT = (I0_pct * SN) / (100 * Math.pow(UN, 2)); // S

    return {
      results: [
        { label: "变压器电阻 R_T", value: round(RT, 4), unit: "Ω", highlight: true },
        { label: "变压器电抗 X_T", value: round(XT, 4), unit: "Ω", highlight: true },
        { label: "励磁电导 G_T", value: (GT * 1e6).toFixed(4), unit: "×10⁻⁶ S" },
        { label: "励磁电纳 B_T", value: (BT * 1e6).toFixed(4), unit: "×10⁻⁶ S" }
      ],
      substitution: `R_T = \\frac{${Pk}\\times ${UN}^2}{1000\\times ${SN}^2} = ${round(RT, 4)}\\,\\Omega, \\quad X_T = \\frac{${Uk_pct}\\times ${UN}^2}{100\\times ${SN}} = ${round(XT, 4)}\\,\\Omega`,
      tips: "【高频避坑】UN 必须使用归算侧的额定电压！计算标幺值时，XT* = Uk% / 100 (以变压器自身额定值为基准)。"
    };
  },

  // 9. 三绕组短路损耗折合
  calcFormula9(inputs) {
    const SN1 = parseF(inputs.SN1, 100);
    const SN2 = parseF(inputs.SN2, 100);
    const SN3 = parseF(inputs.SN3, 50);
    const Pk12 = parseF(inputs.Pk12, 100);
    const Pk13 = parseF(inputs.Pk13, 80);
    const Pk23 = parseF(inputs.Pk23, 70);

    const Pk13_prime = Pk13 * Math.pow(SN1 / SN3, 2);
    const Pk23_prime = Pk23 * Math.pow(SN2 / SN3, 2);

    const Pk1 = 0.5 * (Pk12 + Pk13_prime - Pk23_prime);
    const Pk2 = 0.5 * (Pk12 + Pk23_prime - Pk13_prime);
    const Pk3 = 0.5 * (Pk13_prime + Pk23_prime - Pk12);

    return {
      results: [
        { label: "折合后 Pk(1-3)'", value: round(Pk13_prime, 2), unit: "kW" },
        { label: "折合后 Pk(2-3)'", value: round(Pk23_prime, 2), unit: "kW" },
        { label: "1号绕组损耗 Pk1", value: round(Pk1, 2), unit: "kW", highlight: true },
        { label: "2号绕组损耗 Pk2", value: round(Pk2, 2), unit: "kW" },
        { label: "3号绕组损耗 Pk3", value: round(Pk3, 2), unit: "kW" }
      ],
      substitution: `P_{k(1-3)}' = ${Pk13} \\times (${SN1}/${SN3})^2 = ${round(Pk13_prime, 1)}\\text{ kW}, \\; P_{k1} = \\frac{1}{2}(${Pk12} + ${round(Pk13_prime, 1)} - ${round(Pk23_prime, 1)}) = ${round(Pk1, 2)}\\text{ kW}`,
      tips: "华电811真题陷阱：当三绕组容量比为 100/100/50 时，铭牌给出的 Pk(1-3) 和 Pk(2-3) 是以 50% 较小容量测得的，折算到 100% 容量必须乘以 (100/50)² = 4！"
    };
  },

  // 10. 最大短路损耗求变压器电阻
  calcFormula10(inputs) {
    const Pkmax = parseF(inputs.Pkmax, 250); // kW
    const UN = parseF(inputs.UN, 110); // kV
    const SN = parseF(inputs.SN, 31.5); // MVA

    const RT_100 = 0.5 * ((Pkmax * Math.pow(UN, 2)) / (1000 * Math.pow(SN, 2)));
    const RT_50 = 2 * RT_100;

    return {
      results: [
        { label: "100%容量绕组电阻 RT(100%)", value: round(RT_100, 4), unit: "Ω", highlight: true },
        { label: "50%容量绕组电阻 RT(50%)", value: round(RT_50, 4), unit: "Ω", highlight: true }
      ],
      substitution: `R_{T(100\\%)} = \\frac{1}{2}\\frac{${Pkmax}\\times ${UN}^2}{1000\\times ${SN}^2} = ${round(RT_100, 4)}\\,\\Omega, \\quad R_{T(50\\%)} = 2 R_{T(100\\%)} = ${round(RT_50, 4)}\\,\\Omega`,
      tips: "对于容量比为 100/100/50 的三绕组变压器，50% 容量的绕组截面积小，其电阻是 100% 绕组的 2 倍。"
    };
  },

  // 11. 发电机运行相量关系与功角
  calcFormula11(inputs) {
    const U = parseF(inputs.U, 10.5); // kV
    const P = parseF(inputs.P, 25); // MW
    const Q = parseF(inputs.Q, 15); // MVar
    const xd = parseF(inputs.xd, 1.2); // p.u. 或 Ω (此处按有名值计算)

    const delta_rad = Math.atan2(P * xd, Math.pow(U, 2) + Q * xd);
    const delta_deg = (delta_rad * 180) / Math.PI;
    const Eq = Math.sqrt(Math.pow(U + (Q * xd) / U, 2) + Math.pow((P * xd) / U, 2));

    return {
      results: [
        { label: "功角 δ", value: round(delta_deg, 3), unit: "°", highlight: true },
        { label: "励磁电势 Eq", value: round(Eq, 3), unit: "kV", highlight: true }
      ],
      substitution: `\\tan\\delta = \\frac{P \\cdot x_d}{U^2 + Q \\cdot x_d} = \\frac{${P}\\times ${xd}}{${U}^2 + ${Q}\\times ${xd}} \\implies \\delta = ${round(delta_deg, 3)}^\\circ`,
      tips: "发电机静态稳定极限对应功角 δ = 90°；正常运行时功角 δ 一般在 20°~35° 之间，保证足够的静态稳定储备。"
    };
  },

  // 12. 线路电压降落 (纵分量 ΔU 与横分量 δU) & 21. 阻抗支路首末端
  calcFormula12(inputs) {
    const U = parseF(inputs.U, 110); // kV
    const P = parseF(inputs.P, 30); // MW
    const Q = parseF(inputs.Q, 15); // MVar
    const R = parseF(inputs.R, 10); // Ω
    const X = parseF(inputs.X, 25); // Ω

    const dU = (P * R + Q * X) / U; // kV
    const du = (P * X - Q * R) / U; // kV

    const U_send = Math.sqrt(Math.pow(U + dU, 2) + Math.pow(du, 2));
    const delta_deg = (Math.atan2(du, U + dU) * 180) / Math.PI;

    return {
      results: [
        { label: "电压降落纵分量 ΔU", value: round(dU, 4), unit: "kV", highlight: true },
        { label: "电压降落横分量 δU", value: round(du, 4), unit: "kV", highlight: true },
        { label: "首端合成电压 U₁", value: round(U_send, 4), unit: "kV" },
        { label: "相角差 δ", value: round(delta_deg, 4), unit: "°" }
      ],
      substitution: `\\Delta U = \\frac{${P}\\times ${R} + ${Q}\\times ${X}}{${U}} = ${round(dU, 4)}\\text{ kV}, \\quad \\delta U = \\frac{${P}\\times ${X} - ${Q}\\times ${R}}{${U}} = ${round(du, 4)}\\text{ kV}`,
      tips: "【极高频考点】纵分量 ΔU 主要由有功流过电阻、无功流过电抗决定，主导电压幅值差；横分量 δU 主要由有功流过电抗决定，主导相位角差 δ。"
    };
  },

  // 13. 电压损耗百分比
  calcFormula13(inputs) {
    const U1 = parseF(inputs.U1, 115);
    const U2 = parseF(inputs.U2, 108);
    const UN = parseF(inputs.UN, 110);

    const dU_pct = ((U1 - U2) / UN) * 100;

    return {
      results: [
        { label: "电压损耗 ΔU%", value: round(dU_pct, 3), unit: "%", highlight: true },
        { label: "实际电压幅值差", value: round(U1 - U2, 3), unit: "kV" }
      ],
      substitution: `\\Delta U\\% = \\frac{U_1 - U_2}{U_N} \\times 100\\% = \\frac{${U1} - ${U2}}{${UN}} \\times 100\\% = ${round(dU_pct, 3)}\\%`,
      tips: "概念辨析：【电压降落】是首末端相量差；【电压损耗】是数值差(U1-U2)/UN；手算中高压电网通常近似有 U1 - U2 ≈ ΔU。"
    };
  },

  // 14. 电压偏移
  calcFormula14(inputs) {
    const U = parseF(inputs.U, 113);
    const UN = parseF(inputs.UN, 110);

    const dev = ((U - UN) / UN) * 100;

    return {
      results: [
        { label: "电压偏移率", value: round(dev, 3), unit: "%", highlight: true },
        { label: "绝对偏移量", value: round(U - UN, 3), unit: "kV" }
      ],
      substitution: `\\Delta U_{\\text{dev}}\\% = \\frac{${U} - ${UN}}{${UN}} \\times 100\\% = ${round(dev, 3)}\\%`,
      tips: "我国国标规定：35kV 及以上供电电压正负偏差绝对值之和不超过额定电压的 10%（通常允许 ±5%~±7%）。"
    };
  },

  // 15. 电压调整率
  calcFormula15(inputs) {
    const U20 = parseF(inputs.U20, 115); // 空载
    const U2 = parseF(inputs.U2, 105); // 负载

    const adj = ((U20 - U2) / U20) * 100;

    return {
      results: [
        { label: "电压调整率 ΔU_adj%", value: round(adj, 3), unit: "%", highlight: true }
      ],
      substitution: `\\Delta U_{\\text{adj}}\\% = \\frac{U_{20} - U_2}{U_{20}}\\times 100\\% = \\frac{${U20} - ${U2}}{${U20}}\\times 100\\% = ${round(adj, 3)}\\%`,
      tips: "电压调整反映同一地点由负载变为空载时端电压的变化程度，考研选择题常考与【电压损耗】的定义区分。"
    };
  },

  // 16. 最大负荷利用小时数 Tmax
  calcFormula16(inputs) {
    const W = parseF(inputs.W, 450000); // MWh 或 kWh
    const Pmax = parseF(inputs.Pmax, 100); // MW 或 kW

    const Tmax = W / Pmax;

    return {
      results: [
        { label: "最大负荷利用小时数 T_max", value: round(Tmax, 1), unit: "h", highlight: true }
      ],
      substitution: `T_{\\max} = \\frac{W}{P_{\\max}} = \\frac{${W}}{${Pmax}} = ${round(Tmax, 1)}\\text{ h}`,
      tips: "Tmax 绝不可能超过全年的总小时数 8760 小时。一般重工业用户 Tmax 约 5000~7000h，照明农业负荷 Tmax 约 2000~3000h。"
    };
  },

  // 17. 最大功率损耗时间 τ
  calcFormula17(inputs) {
    const dW = parseF(inputs.dW, 12000); // MWh
    const dPmax = parseF(inputs.dPmax, 3.2); // MW

    const tau = dW / dPmax;

    return {
      results: [
        { label: "最大功率损耗时间 τ", value: round(tau, 1), unit: "h", highlight: true }
      ],
      substitution: `\\tau = \\frac{\\Delta W}{\\Delta P_{\\max}} = \\frac{${dW}}{${dPmax}} = ${round(tau, 1)}\\text{ h}`,
      tips: "全年线路电能损耗 ΔW = ΔPmax · τ。τ 始终小于 Tmax，考研中常用经验公式 τ = (0.124 + Tmax/10000)² · 8760。"
    };
  },

  // 18. 年负荷率
  calcFormula18(inputs) {
    const W = parseF(inputs.W, 525600); // kWh
    const Pmax = parseF(inputs.Pmax, 100); // kW

    const beta = (W / (8760 * Pmax)) * 100;

    return {
      results: [
        { label: "年负荷率 β", value: round(beta, 2), unit: "%", highlight: true }
      ],
      substitution: `\\beta = \\frac{W}{8760 \\times P_{\\max}} = \\frac{${W}}{8760 \\times ${Pmax}} = ${round(beta, 2)}\\%`,
      tips: "年负荷率反映负荷曲线的平坦程度，β 越接近 100%，表明负荷越平稳，设备利用效率越高。"
    };
  },

  // 19. 年负荷损耗率
  calcFormula19(inputs) {
    const dW = parseF(inputs.dW, 15000);
    const dPmax = parseF(inputs.dPmax, 4.5);

    const loss_rate = (dW / (8760 * dPmax)) * 100;

    return {
      results: [
        { label: "年负荷损耗率", value: round(loss_rate, 2), unit: "%", highlight: true }
      ],
      substitution: `\\frac{\\Delta W}{8760 \\times \\Delta P_{\\max}} = \\frac{${dW}}{8760 \\times ${dPmax}} = ${round(loss_rate, 2)}\\%`,
      tips: "等于最大功率损耗时间 τ 与 8760 的比值：τ / 8760。"
    };
  },

  // 20. 变压器的损耗公式
  calcFormula20(inputs) {
    const P0 = parseF(inputs.P0, 30); // kW
    const I0_pct = parseF(inputs.I0_pct, 1.0); // %
    const Pk = parseF(inputs.Pk, 120); // kW
    const Uk_pct = parseF(inputs.Uk_pct, 10.5); // %
    const SN = parseF(inputs.SN, 31.5); // MVA
    const S = parseF(inputs.S, 25); // MVA 实际负载

    const dP_Fe = P0 / 1000; // MW
    const dQ_Fe = (I0_pct / 100) * SN; // MVar
    const dP_Cu = (Pk / 1000) * Math.pow(S / SN, 2); // MW
    const dQ_Cu = (Uk_pct / 100) * (Math.pow(S, 2) / SN); // MVar

    const dP_total = dP_Fe + dP_Cu;
    const dQ_total = dQ_Fe + dQ_Cu;

    return {
      results: [
        { label: "总有功损耗 ΔP_T", value: round(dP_total, 4), unit: "MW", highlight: true },
        { label: "总无功损耗 ΔQ_T", value: round(dQ_total, 4), unit: "MVar", highlight: true },
        { label: "铁耗 (空载损耗)", value: `${round(dP_Fe, 4)} MW + j${round(dQ_Fe, 4)} MVar`, unit: "" },
        { label: "铜耗 (短路负载损耗)", value: `${round(dP_Cu, 4)} MW + j${round(dQ_Cu, 4)} MVar`, unit: "" }
      ],
      substitution: `\\Delta P_T = \\frac{${P0}}{1000} + \\frac{${Pk}}{1000}\\left(\\frac{${S}}{${SN}}\\right)^2 = ${round(dP_total, 4)}\\text{ MW}`,
      tips: "铁损（励磁损耗）大小只与外加电压有关，近似恒定；铜损与负荷电流平方（负荷容量 S 的平方）成正比。"
    };
  },

  // 22. 线路空载时电压损耗 (电容效应升压)
  calcFormula22(inputs) {
    const U2 = parseF(inputs.U2, 220); // kV
    const b1 = parseF(inputs.b1, 2.8e-6); // S/km
    const x1 = parseF(inputs.x1, 0.4); // Ω/km
    const L = parseF(inputs.L, 200); // km

    const B = b1 * L;
    const X = x1 * L;
    const dU = 0.5 * B * X * U2;

    return {
      results: [
        { label: "空载电压升高 ΔU", value: round(dU, 4), unit: "kV", highlight: true },
        { label: "首末端升压比", value: round((dU / U2) * 100, 3), unit: "%" }
      ],
      substitution: `\\Delta U = \\frac{1}{2} b_1 x_1 L^2 U_2 = \\frac{1}{2} \\times (${b1}) \\times ${x1} \\times ${L}^2 \\times ${U2} = ${round(dU, 4)}\\text{ kV}`,
      tips: "长距离高压架空线在轻载或空载时，由于对地电纳充电无功流过线路感抗，末端电压会反高于首端电压（费兰梯效应/Ferranti Effect），需加装并联电抗器吸收无功。"
    };
  },

  // 23. 功率损耗与充电功率
  calcFormula23(inputs) {
    const P = parseF(inputs.P, 40); // MW
    const Q = parseF(inputs.Q, 20); // MVar
    const U = parseF(inputs.U, 110); // kV
    const R = parseF(inputs.R, 12); // Ω
    const X = parseF(inputs.X, 28); // Ω
    const b1 = parseF(inputs.b1, 2.75e-6); // S/km
    const L = parseF(inputs.L, 100); // km

    const S2 = Math.pow(P, 2) + Math.pow(Q, 2);
    const dP = (S2 * R) / Math.pow(U, 2);
    const dQ_line = (S2 * X) / Math.pow(U, 2);
    const Qc = Math.pow(U, 2) * b1 * L; // MVar

    return {
      results: [
        { label: "线路有功损耗 ΔP", value: round(dP, 4), unit: "MW", highlight: true },
        { label: "线路电抗无功损耗 ΔQ_L", value: round(dQ_line, 4), unit: "MVar", highlight: true },
        { label: "线路充电无功功率 Q_C", value: round(Qc, 4), unit: "MVar", highlight: true }
      ],
      substitution: `\\Delta P = \\frac{${P}^2 + ${Q}^2}{${U}^2} \\times ${R} = ${round(dP, 4)}\\text{ MW}, \\quad Q_C = ${U}^2 \\times (${b1}\\times ${L}) = ${round(Qc, 4)}\\text{ MVar}`,
      tips: "潮流手算标准步骤：先算充电功率 Qc/2，求得阻抗中流过的真实功率，再算阻抗损耗 ΔP + jΔQ。"
    };
  },

  // 24. 环形网络功率自然分布
  calcFormula24(inputs) {
    const P1 = parseF(inputs.P1, 30);
    const Q1 = parseF(inputs.Q1, 15);
    const Z1 = parseF(inputs.Z1, 10); // 支路1阻抗幅值
    const Z2 = parseF(inputs.Z2, 15); // 支路2阻抗幅值

    const Z_sum = Z1 + Z2;
    const Sa_P = (P1 * Z2) / Z_sum;
    const Sa_Q = (Q1 * Z2) / Z_sum;

    return {
      results: [
        { label: "A端分流有功 Pa", value: round(Sa_P, 3), unit: "MW", highlight: true },
        { label: "A端分流无功 Qa", value: round(Sa_Q, 3), unit: "MVar", highlight: true },
        { label: "B端分流有功 Pb", value: round(P1 - Sa_P, 3), unit: "MW" }
      ],
      substitution: `S_a = S_1 \\frac{Z_2}{Z_1 + Z_2} = (${P1}+j${Q1}) \\frac{${Z2}}{${Z1}+${Z2}} = ${round(Sa_P, 3)} + j${round(Sa_Q, 3)}\\text{ MVA}`,
      tips: "环网自然功率分布与线路复阻抗共轭成反比；经济功率分布与电阻成反比。若两者不一致，会产生循环功率增加损耗。"
    };
  },

  // 25. 循环功率
  calcFormula25(inputs) {
    const UN = parseF(inputs.UN, 110); // kV
    const dU_mag = parseF(inputs.dU_mag, 3.5); // kV 电势差
    const Z_sum = parseF(inputs.Z_sum, 18); // Ω 环路总阻抗

    const Sc = (UN * dU_mag) / Z_sum;

    return {
      results: [
        { label: "循环功率幅值 Sc", value: round(Sc, 3), unit: "MVA", highlight: true }
      ],
      substitution: `S_C = \\frac{U_N \\cdot d\\dot{U}^*}{Z_\\Sigma^*} = \\frac{${UN} \\times ${dU_mag}}{${Z_sum}} = ${round(Sc, 3)}\\text{ MVA}`,
      tips: "循环功率是由环网内两端实际电压不相等引起的，它在环网内无功空转，显著加剧线路损耗，需采用带负荷加装移相变压器消除。"
    };
  },

  // 26~29, 35~37: 潮流方程与微增率原理卡片
  calcFormulaRef() {
    return {
      results: [
        { label: "模式", value: "理论方程 / 判据标准", unit: "" }
      ],
      substitution: "该公式为经典微分/拓扑方程，手算大题中作为分析判据，支持在卡片查看标准 LaTeX 结构与避坑要点。",
      tips: "华电 811 考研每年必考：牛顿-拉夫逊法修正方程的雅可比矩阵元素偏导数计算推导。"
    };
  },

  // 30. 发电机单位调节功率
  calcFormula30(inputs) {
    const dP = parseF(inputs.dP, 20); // MW
    const df = parseF(inputs.df, 0.2); // Hz
    const fN = parseF(inputs.fN, 50); // Hz
    const PGN = parseF(inputs.PGN, 100); // MW

    const KG = Math.abs(dP / df); // MW/Hz
    const KG_star = KG * (fN / PGN);
    const sigma = (1 / KG_star) * 100; // %

    return {
      results: [
        { label: "单位调节功率有名值 KG", value: round(KG, 3), unit: "MW/Hz", highlight: true },
        { label: "单位调节功率标幺值 KG*", value: round(KG_star, 3), unit: "p.u.", highlight: true },
        { label: "发电机调差系数 σ%", value: round(sigma, 2), unit: "%" }
      ],
      substitution: `K_G = \\left|\\frac{\\Delta P}{\\Delta f}\\right| = \\frac{${dP}}{${df}} = ${round(KG, 3)}\\text{ MW/Hz}, \\quad K_{G*} = ${round(KG, 3)}\\times\\frac{${fN}}{${PGN}} = ${round(KG_star, 3)}`,
      tips: "注意正负号定义：发电机调节功率有名值 KG = -ΔP/Δf，频率下降时出力增加，故 KG 本身为正值；调差系数一般在 3%~5% 之间。"
    };
  },

  // 31. 负荷单位调节功率
  calcFormula31(inputs) {
    const dP = parseF(inputs.dP, 5); // MW
    const df = parseF(inputs.df, 0.2); // Hz
    const fN = parseF(inputs.fN, 50);
    const PLN = parseF(inputs.PLN, 100);

    const KL = dP / df; // MW/Hz
    const KL_star = KL * (fN / PLN);

    return {
      results: [
        { label: "负荷调节功率有名值 KL", value: round(KL, 3), unit: "MW/Hz", highlight: true },
        { label: "负荷调节功率标幺值 KL*", value: round(KL_star, 3), unit: "p.u.", highlight: true }
      ],
      substitution: `K_L = \\frac{\\Delta P}{\\Delta f} = \\frac{${dP}}{${df}} = ${round(KL, 3)}\\text{ MW/Hz}, \\quad K_{L*} = ${round(KL, 3)}\\times \\frac{${fN}}{${PLN}} = ${round(KL_star, 3)}`,
      tips: "负荷调节效应是电力系统的自稳特性：系统频率下降时，旋转电机负载转速下降、吸收有功减少，阻止频率进一步降低。"
    };
  },

  // 32. 系统单位调节功率
  calcFormula32(inputs) {
    const KG = parseF(inputs.KG, 80); // MW/Hz
    const KL = parseF(inputs.KL, 20); // MW/Hz

    const KS = KG + KL;

    return {
      results: [
        { label: "系统总调节功率有名值 KS", value: round(KS, 3), unit: "MW/Hz", highlight: true }
      ],
      substitution: `K_S = K_G + K_L = ${KG} + ${KL} = ${round(KS, 3)}\\text{ MW/Hz}`,
      tips: "系统的频率静态特性由发电机与负荷两者共同决定：一次调频稳态频差 Δf = -ΔPL / KS。"
    };
  },

  // 33. 联合系统频率变化量
  calcFormula33(inputs) {
    const dPLA = parseF(inputs.dPLA, 30); // MW
    const dPGA = parseF(inputs.dPGA, 0); // MW
    const dPLB = parseF(inputs.dPLB, 0); // MW
    const dPGB = parseF(inputs.dPGB, 0); // MW
    const KA = parseF(inputs.KA, 120); // MW/Hz
    const KB = parseF(inputs.KB, 180); // MW/Hz

    const num = (dPLA - dPGA) + (dPLB - dPGB);
    const den = KA + KB;
    const df = num / den; // Hz 频率下降量

    return {
      results: [
        { label: "系统稳态频差 Δf", value: round(df, 4), unit: "Hz", highlight: true },
        { label: "最终频率 (若基准50Hz)", value: round(50 - df, 4), unit: "Hz" }
      ],
      substitution: `\\Delta f = \\frac{(${dPLA}-${dPGA}) + (${dPLB}-${dPGB})}{${KA} + ${KB}} = \\frac{${num}}{${den}} = ${round(df, 4)}\\text{ Hz (下降)}`,
      tips: "公式中 Δf > 0 表示频率下降。互联系统中任何一个子系统有负荷扰动，都由全互联系统的所有调频机组按调节功率比例分担。"
    };
  },

  // 34. 联合系统联络线功率变化量
  calcFormula34(inputs) {
    const dPLA = parseF(inputs.dPLA, 30);
    const dPGA = parseF(inputs.dPGA, 0);
    const dPLB = parseF(inputs.dPLB, 0);
    const dPGB = parseF(inputs.dPGB, 0);
    const KA = parseF(inputs.KA, 120);
    const KB = parseF(inputs.KB, 180);

    const delta_PAB = (KA * (dPLB - dPGB) - KB * (dPLA - dPGA)) / (KA + KB);

    return {
      results: [
        { label: "联络线交换功率变化 ΔP_AB", value: round(delta_PAB, 3), unit: "MW", highlight: true }
      ],
      substitution: `\\Delta P_{AB} = \\frac{${KA}(${dPLB}-${dPGB}) - ${KB}(${dPLA}-${dPGA})}{${KA}+${KB}} = ${round(delta_PAB, 3)}\\text{ MW}`,
      tips: "当 A 系统负荷增加 (dPLA > 0) 时，ΔPAB 为负值，说明功率自 B 系统通过联络线流向 A 系统支援 A 系统。"
    };
  },

  // 38. 组合调压 · 补偿电容容量
  calcFormula38(inputs) {
    const k = parseF(inputs.k, 1.05); // 变比
    const U1_prime = parseF(inputs.U1_prime, 112); // kV 折算到高压侧
    const U2 = parseF(inputs.U2, 10.5); // kV 低压侧要求电压
    const X = parseF(inputs.X, 15); // Ω 变压器电抗

    const QC = (Math.pow(k, 2) * U1_prime / X) * (U1_prime - (U2 * k));

    return {
      results: [
        { label: "所需无功补偿容量 Qc", value: round(Math.abs(QC), 3), unit: "MVar", highlight: true }
      ],
      substitution: `Q_C = \\frac{${k}^2 \\times ${U1_prime}}{${X}} \\left( ${U1_prime} - ${U2}\\times ${k} \\right) = ${round(QC, 3)}\\text{ MVar}`,
      tips: "调压手算经典步骤：先按最大负荷选择分接头变比 k，校验最小负荷；若不能同时满足调压要求，则需计算加装并联电容器的容量 Qc。"
    };
  },

  // 39. 短路功率 (容量)
  calcFormula39(inputs) {
    const Uav = parseF(inputs.Uav, 115); // kV 平均额定电压
    const Ik = parseF(inputs.Ik, 12.5); // kA 短路电流有效值

    const Sk = Math.sqrt(3) * Uav * Ik;

    return {
      results: [
        { label: "短路容量 Sk", value: round(Sk, 2), unit: "MVA", highlight: true }
      ],
      substitution: `S_k = \\sqrt{3} U_{av} I_k = \\sqrt{3} \\times ${Uav} \\times ${Ik} = ${round(Sk, 2)}\\text{ MVA}`,
      tips: "短路容量计算必须使用该电压等级的【平均额定电压 Uav】（如 115kV, 230kV, 525kV），而不是设备额定电压 UN！"
    };
  },

  // 40. 冲击电流
  calcFormula40(inputs) {
    const Ik = parseF(inputs.Ik, 15); // kA
    const KM = parseF(inputs.KM, 1.8); // 冲击系数

    const ish = Math.sqrt(2) * KM * Ik; // 峰值
    const Ish_rms = Ik * Math.sqrt(1 + 2 * Math.pow(KM - 1, 2)); // 最大有效值

    return {
      results: [
        { label: "冲击电流峰值 i_sh", value: round(ish, 3), unit: "kA", highlight: true },
        { label: "最大有效值电流 I_sh", value: round(Ish_rms, 3), unit: "kA", highlight: true }
      ],
      substitution: `i_{sh} = \\sqrt{2} \\times ${KM} \\times ${Ik} = ${round(ish, 3)}\\text{ kA}, \\quad I_{sh} = ${Ik}\\sqrt{1 + 2(${KM}-1)^2} = ${round(Ish_rms, 3)}\\text{ kA}`,
      tips: "冲击电流发生在短路后约半个工频周期 (t = 0.01s) 瞬间。发电机端短路 KM 取 1.9，远离发电机处取 1.8。"
    };
  },

  // 41. 对称分量法变换矩阵 (相分量转序分量)
  calcFormula41(inputs) {
    const Fa_mag = parseF(inputs.Fa_mag, 1.0);
    const Fa_deg = parseF(inputs.Fa_deg, 0);
    const Fb_mag = parseF(inputs.Fb_mag, 1.0);
    const Fb_deg = parseF(inputs.Fb_deg, -120);
    const Fc_mag = parseF(inputs.Fc_mag, 1.0);
    const Fc_deg = parseF(inputs.Fc_deg, 120);

    // 将相量转化为直角坐标
    const toRad = deg => (deg * Math.PI) / 180;
    const a_re = Fa_mag * Math.cos(toRad(Fa_deg));
    const a_im = Fa_mag * Math.sin(toRad(Fa_deg));
    const b_re = Fb_mag * Math.cos(toRad(Fb_deg));
    const b_im = Fb_mag * Math.sin(toRad(Fb_deg));
    const c_re = Fc_mag * Math.cos(toRad(Fc_deg));
    const c_im = Fc_mag * Math.sin(toRad(Fc_deg));

    // a 算子 = -0.5 + j(√3/2)
    const opA_re = -0.5, opA_im = Math.sqrt(3) / 2;
    const opA2_re = -0.5, opA2_im = -Math.sqrt(3) / 2;

    // F1 = (Fa + a Fb + a² Fc) / 3
    const aFb_re = opA_re * b_re - opA_im * b_im;
    const aFb_im = opA_re * b_im + opA_im * b_re;
    const a2Fc_re = opA2_re * c_re - opA2_im * c_im;
    const a2Fc_im = opA2_re * c_im + opA2_im * c_re;

    const f1_re = (a_re + aFb_re + a2Fc_re) / 3;
    const f1_im = (a_im + aFb_im + a2Fc_im) / 3;
    const f1_mag = Math.hypot(f1_re, f1_im);

    // F2 = (Fa + a² Fb + a Fc) / 3
    const a2Fb_re = opA2_re * b_re - opA2_im * b_im;
    const a2Fb_im = opA2_re * b_im + opA2_im * b_re;
    const aFc_re = opA_re * c_re - opA_im * c_im;
    const aFc_im = opA_re * c_im + opA_im * c_re;

    const f2_re = (a_re + a2Fb_re + aFc_re) / 3;
    const f2_im = (a_im + a2Fb_im + aFc_im) / 3;
    const f2_mag = Math.hypot(f2_re, f2_im);

    // F0 = (Fa + Fb + Fc) / 3
    const f0_re = (a_re + b_re + c_re) / 3;
    const f0_im = (a_im + b_im + c_im) / 3;
    const f0_mag = Math.hypot(f0_re, f0_im);

    return {
      results: [
        { label: "正序分量幅值 |F₁|", value: round(f1_mag, 4), unit: "p.u.", highlight: true },
        { label: "负序分量幅值 |F₂|", value: round(f2_mag, 4), unit: "p.u." },
        { label: "零序分量幅值 |F₀|", value: round(f0_mag, 4), unit: "p.u." }
      ],
      substitution: `\\dot{F}_1 = \\frac{1}{3}(\\dot{F}_a + a\\dot{F}_b + a^2\\dot{F}_c) = ${round(f1_mag, 4)}, \\quad \\dot{F}_0 = \\frac{1}{3}(\\dot{F}_a+\\dot{F}_b+\\dot{F}_c) = ${round(f0_mag, 4)}`,
      tips: "对称分量法只适用于线性对称三相系统。旋转算子 a = e^(j120°) = -1/2 + j(√3/2)，a³ = 1，1 + a + a² = 0。"
    };
  },

  // 43. A相接地短路 f⁽¹⁾
  calcFormula43(inputs) {
    const Ef0 = parseF(inputs.Ef0, 1.0);
    const x1 = parseF(inputs.x1, 0.2);
    const x2 = parseF(inputs.x2, 0.2);
    const x0 = parseF(inputs.x0, 0.1);

    const x_sum = x1 + x2 + x0;
    const If1 = Ef0 / x_sum;
    const If_total = 3 * If1; // 故障相电流 Ia = 3 * If1

    return {
      results: [
        { label: "故障相接地短路电流 |I_fa|", value: round(If_total, 4), unit: "p.u.", highlight: true },
        { label: "各序电流 |I_f1|=|I_f2|=|I_f0|", value: round(If1, 4), unit: "p.u.", highlight: true },
        { label: "附加阻抗 xΔ", value: round(x2 + x0, 4), unit: "p.u." }
      ],
      substitution: `I_{f(1)} = \\frac{E_{f|0|}}{x_1 + x_2 + x_0} = \\frac{${Ef0}}{${x1} + ${x2} + ${x0}} = ${round(If1, 4)}\\text{ p.u.}, \\quad I_{fa} = 3I_{f(1)} = ${round(If_total, 4)}\\text{ p.u.}`,
      tips: "A相单相接地边界条件：Ib = Ic = 0, Ua = 0。三序网串联，附加阻抗 xΔ = x2 + x0。"
    };
  },

  // 44. BC相两相短路 f⁽²⁾
  calcFormula44(inputs) {
    const Ef0 = parseF(inputs.Ef0, 1.0);
    const x1 = parseF(inputs.x1, 0.2);
    const x2 = parseF(inputs.x2, 0.2);

    const x_sum = x1 + x2;
    const If1 = Ef0 / x_sum;
    const If_BC = Math.sqrt(3) * If1; // Ib = -Ic = -j√3 If1

    return {
      results: [
        { label: "短路相电流 |I_fb|=|I_fc|", value: round(If_BC, 4), unit: "p.u.", highlight: true },
        { label: "正序电流 |I_f1|", value: round(If1, 4), unit: "p.u." },
        { label: "附加阻抗 xΔ", value: round(x2, 4), unit: "p.u." }
      ],
      substitution: `I_{f(1)} = \\frac{E_{f|0|}}{x_1 + x_2} = \\frac{${Ef0}}{${x1}+${x2}} = ${round(If1, 4)}, \\quad I_{fb} = \\sqrt{3} I_{f(1)} = ${round(If_BC, 4)}\\text{ p.u.}`,
      tips: "两相短路边界条件：Ia = 0, Ib = -Ic, Ub = Uc。正负序网串联，零序网完全不参与（If0 = 0），附加阻抗 xΔ = x2。"
    };
  },

  // 45. BC相两相接地短路 f⁽¹·¹⁾
  calcFormula45(inputs) {
    const Ef0 = parseF(inputs.Ef0, 1.0);
    const x1 = parseF(inputs.x1, 0.2);
    const x2 = parseF(inputs.x2, 0.2);
    const x0 = parseF(inputs.x0, 0.1);

    const x_parallel = (x2 * x0) / (x2 + x0);
    const If1 = Ef0 / (x1 + x_parallel);
    const If2 = -If1 * (x0 / (x2 + x0));
    const If0 = -If1 * (x2 / (x2 + x0));
    const In = 3 * Math.abs(If0); // 入地电流 3*If0

    return {
      results: [
        { label: "正序电流 |I_f1|", value: round(If1, 4), unit: "p.u.", highlight: true },
        { label: "入地总电流 |In|", value: round(In, 4), unit: "p.u.", highlight: true },
        { label: "附加阻抗 xΔ = x2 // x0", value: round(x_parallel, 4), unit: "p.u." }
      ],
      substitution: `x_\\Delta = \\frac{${x2}\\times ${x0}}{${x2}+${x0}} = ${round(x_parallel, 4)}, \\quad I_{f(1)} = \\frac{${Ef0}}{${x1} + ${round(x_parallel, 4)}} = ${round(If1, 4)}\\text{ p.u.}`,
      tips: "两相接地短路边界条件：Ia = 0, Ub = Uc = 0。负序与零序网并联后与正序网串联。"
    };
  },

  // 46. 变压器序分量相位变换 (时钟表示法)
  calcFormula46(inputs) {
    const UA1_mag = parseF(inputs.UA1_mag, 1.0);
    const UA1_deg = parseF(inputs.UA1_deg, 0);
    const N = parseInt(inputs.N_group, 10) || 11;

    const angle_shift_pos = -N * 30; // 正序落后 N*30°
    const angle_shift_neg = N * 30; // 负序超前 N*30°

    const Ua1_deg = ((UA1_deg + angle_shift_pos) % 360 + 360) % 360;
    const Ua2_deg = ((UA1_deg + angle_shift_neg) % 360 + 360) % 360;

    return {
      results: [
        { label: "低压侧正序相角", value: round(Ua1_deg, 1), unit: "°", highlight: true },
        { label: "低压侧负序相角", value: round(Ua2_deg, 1), unit: "°", highlight: true },
        { label: "联结钟点组移相角", value: `${-N * 30}° (落后)`, unit: "" }
      ],
      substitution: `\\dot{U}_{a1} = \\dot{U}_{A1} e^{-j(${N}\\times 30^\\circ)} = \\angle ${round(Ua1_deg, 1)}^\\circ, \\quad \\dot{U}_{a2} = \\dot{U}_{A2} e^{j(${N}\\times 30^\\circ)} = \\angle ${round(Ua2_deg, 1)}^\\circ`,
      tips: "我国最普遍的 Yd-11 变压器：正序量低压侧比高压侧落后 330°（即超前 30°）；负序量低压侧比高压侧超前 330°（即落后 30°）。"
    };
  },

  // 47. 正序等效定则
  calcFormula47(inputs) {
    const Ef0 = parseF(inputs.Ef0, 1.0);
    const x1 = parseF(inputs.x1, 0.2);
    const x2 = parseF(inputs.x2, 0.2);
    const x0 = parseF(inputs.x0, 0.1);
    const zf = parseF(inputs.zf, 0);
    const type = inputs.fault_type || "f1";

    let x_delta = 0;
    let M = 1;
    let typeName = "";

    if (type === "f3") {
      typeName = "三相短路 f⁽³⁾";
      x_delta = zf;
      M = 1;
    } else if (type === "f1") {
      typeName = "单相接地短路 f⁽¹⁾";
      x_delta = x2 + (x0 + 3 * zf);
      M = 3;
    } else if (type === "f2") {
      typeName = "两相短路 f⁽²⁾";
      x_delta = x2 + zf;
      M = Math.sqrt(3);
    } else if (type === "f11") {
      typeName = "两相接地短路 f⁽¹·¹⁾";
      const z0_total = x0 + 3 * zf;
      x_delta = (x2 * z0_total) / (x2 + z0_total);
      M = Math.sqrt(3);
    }

    const If1 = Ef0 / (x1 + x_delta);
    const If = M * If1;

    return {
      results: [
        { label: "短路相电流有效值 If", value: round(If, 4), unit: "p.u.", highlight: true },
        { label: "正序电流 If(1)", value: round(If1, 4), unit: "p.u.", highlight: true },
        { label: "附加阻抗 xΔ", value: round(x_delta, 4), unit: "p.u." },
        { label: "比例系数 M", value: round(M, 3), unit: "" }
      ],
      substitution: `I_f = M \\frac{E_{f|0|}}{x_1 + x_\\Delta} = ${round(M, 3)} \\times \\frac{${Ef0}}{${x1} + ${round(x_delta, 4)}} = ${round(If, 4)}\\text{ p.u.}`,
      tips: `【${typeName}】在正序等效定则中，各类不对称短路的正序电流均等效为在故障点串联附加阻抗 xΔ 的对称三相短路。`
    };
  }
};
