import { Complex, round, parseF } from "./mathUtils.js";

/**
 * 模块1：电压降落与损耗
 */
export function calcModule1(inputs) {
  const U = parseF(inputs.U, 110);
  const P_k = parseF(inputs.P_k, 24000);
  const Q_k = parseF(inputs.Q_k, 18000);
  const R = parseF(inputs.R, 12.5);
  const X = parseF(inputs.X, 25.0);

  const P_M = P_k / 1000.0;
  const Q_M = Q_k / 1000.0;

  const dU = (P_M * R + Q_M * X) / U;
  const du = (P_M * X - Q_M * R) / U;

  const U_end = Math.sqrt(Math.pow(U + dU, 2) + Math.pow(du, 2));
  const angRad = Math.atan2(du, U + dU);
  const angDeg = (angRad * 180) / Math.PI;

  const steps = [
    {
      title: "1. 功率量纲换算 (统一归算至 MW / MVar)",
      latex: `P = ${P_k} \\text{ kW} = ${round(P_M, 3)} \\text{ MW}, \\quad Q = ${Q_k} \\text{ kVar} = ${round(Q_M, 3)} \\text{ MVar}`,
      content: `P = ${P_k} kW = ${round(P_M, 3)} MW,  Q = ${Q_k} kVar = ${round(Q_M, 3)} MVar`
    },
    {
      title: "2. 纵分量 (电压损耗 ΔU) 计算",
      latex: `\\Delta U = \\frac{P \\cdot R + Q \\cdot X}{U} = \\frac{${round(P_M, 3)} \\times ${R} + ${round(Q_M, 3)} \\times ${X}}{${U}} = ${round(dU, 4)} \\text{ kV}`,
      content: `ΔU = (P·R + Q·X) / U = (${round(P_M, 3)}×${R} + ${round(Q_M, 3)}×${X}) / ${U} = ${round(dU, 4)} kV`
    },
    {
      title: "3. 横分量 (δU) 计算",
      latex: `\\delta U = \\frac{P \\cdot X - Q \\cdot R}{U} = \\frac{${round(P_M, 3)} \\times ${X} - ${round(Q_M, 3)} \\times ${R}}{${U}} = ${round(du, 4)} \\text{ kV}`,
      content: `δU = (P·X - Q·R) / U = (${round(P_M, 3)}×${X} - ${round(Q_M, 3)}×${R}) / ${U} = ${round(du, 4)} kV`
    },
    {
      title: "4. 对端合成电压向量幅值与相角",
      latex: `U_{\\text{end}} = \\sqrt{(U + \\Delta U)^2 + (\\delta U)^2} = \\sqrt{(${U} + ${round(dU, 4)})^2 + (${round(du, 4)})^2} = ${round(U_end, 4)} \\text{ kV} \\\\ \\angle \\delta = \\arctan\\left(\\frac{\\delta U}{U + \\Delta U}\\right) = ${round(angDeg, 4)}^\\circ`,
      content: `U_end = √[(U + ΔU)² + (δU)²] = ${round(U_end, 4)} kV\n∠δ = arctan(δU / (U + ΔU)) = ${round(angDeg, 4)}°`
    }
  ];

  return {
    dU,
    du,
    U_end,
    angDeg,
    U,
    steps,
    trapTip: "【考研高频陷阱】若题目已知首端电压求末端电压，则实际末端电压为 U1 - ΔU - jδU；若已知末端求首端，则首端电压为 U2 + ΔU + jδU。公式中 P, Q 必须使用通过该线路阻抗的同侧潮流。"
  };
}

/**
 * 模块2：线路功率损耗与充电功率
 */
export function calcModule2(inputs) {
  const U = parseF(inputs.U, 220);
  const P_k = parseF(inputs.P_k, 120000);
  const Q_k = parseF(inputs.Q_k, 60000);
  const R = parseF(inputs.R, 8.5);
  const X = parseF(inputs.X, 28.0);
  const B_u = parseF(inputs.B_u, 58.4);

  const P_M = P_k / 1000.0;
  const Q_M = Q_k / 1000.0;

  const S_sq = P_M * P_M + Q_M * Q_M;
  const U_sq = U * U;

  const dP_M = (S_sq / U_sq) * R;
  const dQ_M = (S_sq / U_sq) * X;
  const Qc_M = 0.5 * U_sq * (B_u * 1e-6);

  const dP_k = dP_M * 1000;
  const dQ_k = dQ_M * 1000;
  const Qc_k = Qc_M * 1000;

  const steps = [
    {
      title: "1. 线路流过视在功率模长平方 S²",
      latex: `S^2 = P^2 + Q^2 = (${round(P_M, 2)})^2 + (${round(Q_M, 2)})^2 = ${round(S_sq, 4)} \\text{ (MVA)}^2`,
      content: `S² = P² + Q² = ${round(P_M, 2)}² + ${round(Q_M, 2)}² = ${round(S_sq, 4)} (MVA)²`
    },
    {
      title: "2. 串联支路有功损耗 ΔP",
      latex: `\\Delta P = \\frac{S^2}{U^2} R = \\frac{${round(S_sq, 2)}}{${U}^2} \\times ${R} = ${round(dP_M, 5)} \\text{ MW} = ${round(dP_k, 2)} \\text{ kW}`,
      content: `ΔP = (S² / U²) × R = ${round(dP_M, 5)} MW (${round(dP_k, 2)} kW)`
    },
    {
      title: "3. 串联支路无功损耗 ΔQ",
      latex: `\\Delta Q = \\frac{S^2}{U^2} X = \\frac{${round(S_sq, 2)}}{${U}^2} \\times ${X} = ${round(dQ_M, 5)} \\text{ MVar} = ${round(dQ_k, 2)} \\text{ kVar}`,
      content: `ΔQ = (S² / U²) × X = ${round(dQ_M, 5)} MVar (${round(dQ_k, 2)} kVar)`
    },
    {
      title: "4. 单侧并联充电功率 Qc",
      latex: `Q_c = \\frac{1}{2} U^2 B = 0.5 \\times ${U}^2 \\times (${B_u} \\times 10^{-6}) = ${round(Qc_M, 5)} \\text{ MVar} = ${round(Qc_k, 2)} \\text{ kVar}`,
      content: `Qc = 1/2 × U² × B = ${round(Qc_M, 5)} MVar (${round(Qc_k, 2)} kVar)`
    }
  ];

  return {
    dP_k,
    dQ_k,
    Qc_k,
    dP_M,
    dQ_M,
    Qc_M,
    steps,
    trapTip: "【避坑】对地充电功率在稳态潮流中相当于并在母线上的并联电容器，其效应是向系统注入感性无功（即提供容性无功）。在节点功率平衡计算中，其符号常为 -jQc，不要写反成负载！"
  };
}

/**
 * 模块3：多节点环网潮流分布与【功率分界点】智能侦测
 */
export function calcModule3(inputs) {
  const R_sum = parseF(inputs.R_sum, 20);
  const X_sum = parseF(inputs.X_sum, 48);
  const nodes = inputs.nodes || [];

  const Z_sum = new Complex(R_sum, X_sum);
  const Z_sum_conj = Z_sum.conj();

  let numerator = new Complex(0, 0);
  let totalLoad = new Complex(0, 0);

  const nodeSteps = [];

  nodes.forEach((n, idx) => {
    const P = parseF(n.P, 0);
    const Q = parseF(n.Q, 0);
    const R_iB = parseF(n.R_iB, 0);
    const X_iB = parseF(n.X_iB, 0);

    const S_i = new Complex(P, Q);
    const Z_iB = new Complex(R_iB, X_iB);
    const Z_iB_conj = Z_iB.conj();

    const term = S_i.mul(Z_iB_conj);
    numerator = numerator.add(term);
    totalLoad = totalLoad.add(S_i);

    nodeSteps.push({
      nodeId: idx + 1,
      S_i: S_i.toString(),
      Z_iB: Z_iB.toString(),
      term: term.toString()
    });
  });

  const S_A = numerator.div(Z_sum_conj);
  const S_B = totalLoad.sub(S_A);

  // 逐段潮流推演与功率分界点侦测 (Power Flow Branches)
  const branches = [];
  let currFlow = S_A;
  let activeSplitNode = -1;
  let reactiveSplitNode = -1;

  for (let i = 0; i < nodes.length; i++) {
    const nodeLoad = new Complex(parseF(nodes[i].P, 0), parseF(nodes[i].Q, 0));
    const nextFlow = currFlow.sub(nodeLoad);

    branches.push({
      from: i === 0 ? "A" : `节点${i}`,
      to: `节点${i + 1}`,
      flow: currFlow,
      pDir: currFlow.re >= 0 ? "→" : "←",
      qDir: currFlow.im >= 0 ? "→" : "←"
    });

    // 检查有功分界点：前一段向右流，后一段向左流，则该节点同时从两侧吸收有功
    if (activeSplitNode === -1 && currFlow.re >= 0 && nextFlow.re < 0) {
      activeSplitNode = i + 1;
    }
    // 检查无功分界点
    if (reactiveSplitNode === -1 && currFlow.im >= 0 && nextFlow.im < 0) {
      reactiveSplitNode = i + 1;
    }

    currFlow = nextFlow;
  }

  // 最后一段流入 B 端
  branches.push({
    from: `节点${nodes.length}`,
    to: "B",
    flow: currFlow,
    pDir: currFlow.re >= 0 ? "→" : "←",
    qDir: currFlow.im >= 0 ? "→" : "←"
  });

  // 如果潮流一直正向流到B端
  if (activeSplitNode === -1) activeSplitNode = nodes.length;
  if (reactiveSplitNode === -1) reactiveSplitNode = nodes.length;

  const steps = [
    {
      title: "1. 环网总阻抗与其复数共轭 Z_Σ*",
      latex: `Z_\\Sigma = (${R_sum} + j${X_sum}) \\ \\Omega \\implies Z_\\Sigma^* = (${R_sum} - j${X_sum}) \\ \\Omega`,
      content: `Z_Σ = ${Z_sum.toString()} Ω  ==>  Z_Σ* = ${Z_sum_conj.toString()} Ω`
    },
    {
      title: "2. 力矩式分子求和: Σ (S_i · Z_iB*)",
      latex: `\\sum_{i=1}^n \\dot{S}_i Z_{iB}^* = ${numerator.toString()} \\text{ kVA}\\cdot\\Omega`,
      content: nodeSteps.map(ns => `节点${ns.nodeId}: S${ns.nodeId}=(${ns.S_i}) × Z${ns.nodeId}B*=(${ns.Z_iB}*) => ${ns.term}`).join("\n") +
               `\n分子总和 = ${numerator.toString()}`
    },
    {
      title: "3. A 端送出初功率 S_A 与 B 端送出初功率 S_B",
      latex: `\\dot{S}_A = \\frac{${numerator.toString()}}{${Z_sum_conj.toString()}} = ${S_A.toString()} \\text{ kVA} \\\\[6pt] \\dot{S}_B = \\sum \\dot{S}_i - \\dot{S}_A = ${S_B.toString()} \\text{ kVA}`,
      content: `S_A = ${S_A.toString()} kVA\nS_B = ${S_B.toString()} kVA\n总负荷 S_总 = ${totalLoad.toString()} kVA`
    },
    {
      title: "4. 逐段潮流推演与【分界点】判定结论",
      latex: `\\text{有功功率分界点：} \\mathbf{节点 ${activeSplitNode}} \\quad | \\quad \\text{无功功率分界点：} \\mathbf{节点 ${reactiveSplitNode}}`,
      content: branches.map(b => `${b.from} 至 ${b.to}: 潮流 = ${b.flow.toString(2)} kVA (有功${b.pDir}, 无功${b.qDir})`).join("\n") +
               `\n\n🎯 考研核心结论：\n有功分界点位于【节点 ${activeSplitNode}】\n无功分界点位于【节点 ${reactiveSplitNode}】（全网最低电压往往发生在该点！）`
    }
  ];

  return {
    S_A,
    S_B,
    totalLoad,
    branches,
    activeSplitNode,
    reactiveSplitNode,
    nodesCount: nodes.length,
    steps,
    trapTip: "【核心考点：分界点与共轭】环网分流公式分子必须是 S_i × Z_iB*，分母是 Z_Σ*。功率分界点是两端潮流汇聚点，两端分别向该节点供电。无功分界点往往是全网电压降落最大、电压最低的节点，是解环计算和调压校核的关键！"
  };
}

/**
 * 模块4：两端供电循环功率
 */
export function calcModule4(inputs) {
  const Ua_mag = parseF(inputs.Ua_mag, 115);
  const Ua_deg = parseF(inputs.Ua_deg, 0);
  const Ub_mag = parseF(inputs.Ub_mag, 110);
  const Ub_deg = parseF(inputs.Ub_deg, -4.5);
  const R_sum = parseF(inputs.R_sum, 6.5);
  const X_sum = parseF(inputs.X_sum, 18.0);

  const Ua = Complex.fromPolar(Ua_mag, Ua_deg);
  const Ub = Complex.fromPolar(Ub_mag, Ub_deg);
  const deltaU = Ua.sub(Ub);
  const deltaU_conj = deltaU.conj();

  const Z_sum = new Complex(R_sum, X_sum);
  const Z_sum_conj = Z_sum.conj();

  const num = Ua.mul(deltaU_conj);
  const Sc_MVA = num.div(Z_sum_conj);
  const Sc_kVA = Sc_MVA.mulScalar(1000);

  const steps = [
    {
      title: "1. 两端电压相量分解 (直角坐标与相角)",
      latex: `\\dot{U}_A = ${Ua_mag} \\angle ${Ua_deg}^\\circ = (${Ua.toString(3)}) \\text{ kV} \\\\[4pt] \\dot{U}_B = ${Ub_mag} \\angle ${Ub_deg}^\\circ = (${Ub.toString(3)}) \\text{ kV}`,
      content: `Ua = ${Ua.toString(3)} kV\nUb = ${Ub.toString(3)} kV`
    },
    {
      title: "2. 环路电压相量差 ΔU = Ua - Ub",
      latex: `\\Delta \\dot{U} = \\dot{U}_A - \\dot{U}_B = (${deltaU.toString(3)}) \\text{ kV} \\quad (|\\Delta U| = ${round(deltaU.mag(), 3)} \\text{ kV})`,
      content: `ΔU = ${deltaU.toString(3)} kV (|ΔU| = ${round(deltaU.mag(), 3)} kV)`
    },
    {
      title: "3. 阻抗共轭与循环功率代入公式",
      latex: `\\dot{S}_c = \\frac{\\dot{U}_A (\\dot{U}_A - \\dot{U}_B)^*}{Z_\\Sigma^*} = \\frac{(${Ua.toString(2)}) \\times (${deltaU_conj.toString(2)})}{${Z_sum_conj.toString(2)}} = (${Sc_MVA.toString(4)}) \\text{ MVA}`,
      content: `Sc = ${Sc_MVA.toString(4)} MVA = ${Sc_kVA.toString(2)} kVA`
    }
  ];

  return {
    Sc_MVA,
    Sc_kVA,
    deltaU,
    steps,
    trapTip: "【避坑】两端电压幅值不相等会导致无功循环功率；两端电压存在相角差主要导致有功循环功率。循环功率以从 A 到 B 为参考方向。"
  };
}

/**
 * 模块5：自然功率 / 波阻抗
 */
export function calcModule5(inputs) {
  const U = parseF(inputs.U, 500);
  const Rc = parseF(inputs.Rc, 400);
  const Xc = parseF(inputs.Xc, 0);

  const Zc = new Complex(Rc, Xc);
  const Zc_conj = Zc.conj();

  const U_sq = U * U;
  const Sn = new Complex(U_sq, 0).div(Zc_conj);

  const steps = [
    {
      title: "1. 波阻抗及其共轭 Zc*",
      latex: `Z_c = (${Zc.toString()}) \\ \\Omega \\implies Z_c^* = (${Zc_conj.toString()}) \\ \\Omega`,
      content: `Zc = ${Zc.toString()} Ω  ==>  Zc* = ${Zc_conj.toString()} Ω`
    },
    {
      title: "2. 自然功率公式代入求解",
      latex: `S_n = \\frac{U^2}{Z_c^*} = \\frac{${U}^2}{${Zc_conj.toString()}} = (${Sn.toString(4)}) \\text{ MVA}`,
      content: `Sn = ${U}² / (${Zc_conj.toString()}) = ${Sn.toString(4)} MVA`
    },
    {
      title: "3. 物理本质解析",
      latex: Xc === 0 ? `Z_c \\text{ 为纯实数时，自然功率为纯有功 } P_n = ${round(Sn.re, 2)} \\text{ MW}` : `Z_c \\text{ 含有电抗成分，自然功率伴随无功传输}`,
      content: `自然功率模长 |Sn| = ${round(Sn.mag(), 3)} MVA`
    }
  ];

  return {
    Sn,
    steps,
    trapTip: "【考点】当线路传输有功等于自然功率 P = Pn 时，沿线各点电压幅值相等，不存在沿线电压升高或跌落，功率因数处处为 1。"
  };
}

/**
 * 模块6：双绕组变压器铭牌参数
 */
export function calcModule6(inputs) {
  const Sn = parseF(inputs.Sn, 31.5);
  const Un = parseF(inputs.Un, 110);
  const Pk = parseF(inputs.Pk, 180);
  const Uk = parseF(inputs.Uk, 10.5);
  const P0 = parseF(inputs.P0, 32);
  const I0 = parseF(inputs.I0, 0.8);

  const Rt = (Pk * (Un * Un)) / (1000 * (Sn * Sn));
  const Xt = (Uk * (Un * Un)) / (100 * Sn);
  const Gt_S = P0 / (1000 * (Un * Un));
  const Bt_S = (I0 * Sn) / (100 * (Un * Un));

  const Gt_uS = Gt_S * 1e6;
  const Bt_uS = Bt_S * 1e6;

  const steps = [
    {
      title: "1. 串联电阻 Rt (来自短路损耗 Pk)",
      latex: `R_T = \\frac{P_k U_N^2}{1000 S_N^2} = \\frac{${Pk} \\times ${Un}^2}{1000 \\times ${Sn}^2} = ${round(Rt, 4)} \\ \\Omega`,
      content: `Rt = (${Pk} × ${Un}²) / (1000 × ${Sn}²) = ${round(Rt, 4)} Ω`
    },
    {
      title: "2. 串联电抗 Xt (来自短路电压百分比 Uk%)",
      latex: `X_T = \\frac{U_k\\% U_N^2}{100 S_N} = \\frac{${Uk} \\times ${Un}^2}{100 \\times ${Sn}} = ${round(Xt, 4)} \\ \\Omega`,
      content: `Xt = (${Uk} × ${Un}²) / (100 × ${Sn}) = ${round(Xt, 4)} Ω`
    },
    {
      title: "3. 激磁并联电导 Gt (来自空载损耗 P0)",
      latex: `G_T = \\frac{P_0}{1000 U_N^2} = \\frac{${P0}}{1000 \\times ${Un}^2} = ${round(Gt_uS, 4)} \\ \\mu\\text{S}`,
      content: `Gt = ${round(Gt_uS, 4)} μS`
    },
    {
      title: "4. 激磁并联电纳 Bt (来自空载电流百分比 I0%)",
      latex: `B_T = \\frac{I_0\\% S_N}{100 U_N^2} = \\frac{${I0} \\times ${Sn}}{100 \\times ${Un}^2} = ${round(Bt_uS, 4)} \\ \\mu\\text{S}`,
      content: `Bt = ${round(Bt_uS, 4)} μS`
    }
  ];

  return {
    Rt,
    Xt,
    Gt_uS,
    Bt_uS,
    steps,
    trapTip: "【避坑】变压器参数必须明确归算到哪一侧电压 Un！如果是高压侧，Un 代入高压额定电压（如 110kV 或 121kV）；如果折算到中/低压侧，阻抗与变比平方成反比折算。"
  };
}

/**
 * 模块7：等效运算负荷
 */
export function calcModule7(inputs) {
  const P_L = parseF(inputs.P_L, 18000);
  const Q_L = parseF(inputs.Q_L, 13500);
  const Qc = parseF(inputs.Qc, 1200);

  const Sn = parseF(inputs.Sn, 25);
  const Pk = parseF(inputs.Pk, 135);
  const Uk = parseF(inputs.Uk, 10.5);
  const P0 = parseF(inputs.P0, 25);
  const I0 = parseF(inputs.I0, 0.95);

  const P_L_M = P_L / 1000.0;
  const Q_L_M = Q_L / 1000.0;
  const S_L_mag = Math.sqrt(P_L_M * P_L_M + Q_L_M * Q_L_M);

  const beta = S_L_mag / Sn;
  const load_ratio_sq = beta * beta;

  const dP0_kw = P0;
  const dQ0_kvar = (I0 / 100.0) * Sn * 1000.0;

  const dPk_kw_actual = Pk * load_ratio_sq;
  const dQk_kvar_actual = ((Uk / 100.0) * Sn * 1000.0) * load_ratio_sq;

  const P_op = P_L + dP0_kw + dPk_kw_actual;
  const Q_op = Q_L + dQ0_kvar + dQk_kvar_actual - Qc;

  const steps = [
    {
      title: "1. 负载视在功率与负载率 β 计算",
      latex: `S_L = \\sqrt{P_L^2 + Q_L^2} = \\sqrt{${P_L_M}^2 + ${Q_L_M}^2} = ${round(S_L_mag, 4)} \\text{ MVA} \\\\[4pt] \\beta = \\frac{S_L}{S_N} = \\frac{${round(S_L_mag, 4)}}{${Sn}} = ${round(beta, 4)} \\implies \\beta^2 = ${round(load_ratio_sq, 4)}`,
      content: `负载率 β = S_L / Sn = ${round(beta, 4)} (β² = ${round(load_ratio_sq, 4)})`
    },
    {
      title: "2. 变压器空载损耗 (铁损 ΔS0)",
      latex: `\\Delta P_0 = P_0 = ${round(dP0_kw, 2)} \\text{ kW}, \\quad \\Delta Q_0 = \\frac{I_0\\%}{100} S_N \\times 1000 = ${round(dQ0_kvar, 2)} \\text{ kVar}`,
      content: `铁损: ΔP0 = ${round(dP0_kw, 2)} kW, ΔQ0 = ${round(dQ0_kvar, 2)} kVar`
    },
    {
      title: "3. 当前负载率下的短路损耗 (铜损 ΔSk)",
      latex: `\\Delta P_k = P_k \\cdot \\beta^2 = ${Pk} \\times ${round(load_ratio_sq, 4)} = ${round(dPk_kw_actual, 2)} \\text{ kW} \\\\[4pt] \\Delta Q_k = \\left(\\frac{U_k\\%}{100} S_N \\times 1000\\right) \\beta^2 = ${round(dQk_kvar_actual, 2)} \\text{ kVar}`,
      content: `铜损: ΔPk = ${round(dPk_kw_actual, 2)} kW, ΔQk = ${round(dQk_kvar_actual, 2)} kVar`
    },
    {
      title: "4. 最终等效运算负荷 S' (严格扣除对地电容 Qc)",
      latex: `P' = P_L + \\Delta P_0 + \\Delta P_k = ${round(P_op, 2)} \\text{ kW} \\\\[4pt] Q' = Q_L + \\Delta Q_0 + \\Delta Q_k - Q_c = ${round(Q_op, 2)} \\text{ kVar}`,
      content: `S' = ${round(P_op, 2)} + j${round(Q_op, 2)} kVA`
    }
  ];

  return {
    beta,
    dP0_kw,
    dQ0_kvar,
    dPk_kw_actual,
    dQk_kvar_actual,
    P_op,
    Q_op,
    steps,
    trapTip: "【高频丢分陷阱】铜损与负载率平方成正比，切勿把额定短路损耗 Pk, Qk 直接加到负荷上！另外，若节点存在线路充电功率或并联电容器，无功中必须减去 Qc。"
  };
}

/**
 * 模块8：三绕组变压器参数计算
 */
export function calcModule8(inputs) {
  const Sn = parseF(inputs.Sn, 120);
  const Un = parseF(inputs.Un, 220);
  const uk_flag = inputs.uk_flag === "1" || inputs.uk_flag === true;

  const S_12 = parseF(inputs.S_12, 120);
  const Pk12 = parseF(inputs.Pk12, 520);
  const Uk12 = parseF(inputs.Uk12, 14.5);

  const S_13 = parseF(inputs.S_13, 60);
  const Pk13 = parseF(inputs.Pk13, 280);
  const Uk13 = parseF(inputs.Uk13, 24.0);

  const S_23 = parseF(inputs.S_23, 60);
  const Pk23 = parseF(inputs.Pk23, 220);
  const Uk23 = parseF(inputs.Uk23, 8.5);

  const Pk12_N = Pk12 * Math.pow(Sn / S_12, 2);
  const Pk13_N = Pk13 * Math.pow(Sn / S_13, 2);
  const Pk23_N = Pk23 * Math.pow(Sn / S_23, 2);

  const Uk12_N = uk_flag ? Uk12 * (Sn / S_12) : Uk12;
  const Uk13_N = uk_flag ? Uk13 * (Sn / S_13) : Uk13;
  const Uk23_N = uk_flag ? Uk23 * (Sn / S_23) : Uk23;

  const Pk1 = 0.5 * (Pk12_N + Pk13_N - Pk23_N);
  const Pk2 = 0.5 * (Pk12_N + Pk23_N - Pk13_N);
  const Pk3 = 0.5 * (Pk13_N + Pk23_N - Pk12_N);

  const Uk1 = 0.5 * (Uk12_N + Uk13_N - Uk23_N);
  const Uk2 = 0.5 * (Uk12_N + Uk23_N - Uk13_N);
  const Uk3 = 0.5 * (Uk13_N + Uk23_N - Uk12_N);

  function calcZ(Pk_val, Uk_val) {
    const R = (Pk_val * (Un * Un)) / (1000 * (Sn * Sn));
    const X = (Uk_val * (Un * Un)) / (100 * Sn);
    return { R, X };
  }

  const z1 = calcZ(Pk1, Uk1);
  const z2 = calcZ(Pk2, Uk2);
  const z3 = calcZ(Pk3, Uk3);

  const steps = [
    {
      title: "1. 铜损容量折算归算至额定容量 Sn",
      latex: `P_{k12}' = P_{k12} \\left(\\frac{${Sn}}{${S_12}}\\right)^2 = ${round(Pk12_N, 1)} \\text{ kW}, \\quad P_{k13}' = ${round(Pk13_N, 1)} \\text{ kW}, \\quad P_{k23}' = ${round(Pk23_N, 1)} \\text{ kW}`,
      content: `Pk12' = ${round(Pk12_N, 2)} kW, Pk13' = ${round(Pk13_N, 2)} kW, Pk23' = ${round(Pk23_N, 2)} kW`
    },
    {
      title: "2. 星型解耦各绕组短路有功损耗分量",
      latex: `P_{k1} = \\frac{1}{2}(P_{k12}' + P_{k13}' - P_{k23}') = ${round(Pk1, 2)} \\text{ kW} \\\\[4pt] P_{k2} = \\frac{1}{2}(P_{k12}' + P_{k23}' - P_{k13}') = ${round(Pk2, 2)} \\text{ kW} \\\\[4pt] P_{k3} = \\frac{1}{2}(P_{k13}' + P_{k23}' - P_{k12}') = ${round(Pk3, 2)} \\text{ kW}`,
      content: `Pk1 = ${round(Pk1, 2)} kW, Pk2 = ${round(Pk2, 2)} kW, Pk3 = ${round(Pk3, 2)} kW`
    },
    {
      title: "3. 星型解耦各绕组短路电压百分比",
      latex: `U_{k1} = \\frac{1}{2}(U_{k12}' + U_{k13}' - U_{k23}') = ${round(Uk1, 2)}\\% \\\\[4pt] U_{k2} = \\frac{1}{2}(U_{k12}' + U_{k23}' - U_{k13}') = ${round(Uk2, 2)}\\% \\\\[4pt] U_{k3} = \\frac{1}{2}(U_{k13}' + U_{k23}' - U_{k12}') = ${round(Uk3, 2)}\\%`,
      content: `Uk1 = ${round(Uk1, 2)}%, Uk2 = ${round(Uk2, 2)}%, Uk3 = ${round(Uk3, 2)}%`
    },
    {
      title: "4. 计算归算至指定电压 Un 侧的各绕组等效阻抗",
      latex: `Z_1 = (${round(z1.R, 4)} + j${round(z1.X, 4)}) \\ \\Omega \\\\[4pt] Z_2 = (${round(z2.R, 4)} + j${round(z2.X, 4)}) \\ \\Omega \\\\[4pt] Z_3 = (${round(z3.R, 4)} + j${round(z3.X, 4)}) \\ \\Omega`,
      content: `绕组1: Z1 = ${round(z1.R, 4)} + j${round(z1.X, 4)} Ω\n绕组2: Z2 = ${round(z2.R, 4)} + j${round(z2.X, 4)} Ω\n绕组3: Z3 = ${round(z3.R, 4)} + j${round(z3.X, 4)} Ω`
    }
  ];

  let hasNegativeX = z1.X < 0 || z2.X < 0 || z3.X < 0;

  return {
    z1,
    z2,
    z3,
    Pk1,
    Pk2,
    Pk3,
    Uk1,
    Uk2,
    Uk3,
    hasNegativeX,
    steps,
    trapTip: hasNegativeX
      ? "【专业课经典考点：负电抗】检测到某个绕组电抗 X < 0！这在三绕组变压器（特别是中容量/中间布置绕组）中是完全正常的物理现象。因高压、中压、低压三者几何漏磁通重叠所致，等效电路中允许出现负电抗，手算时千万不要以为算错了而强行改正！"
      : "【避坑】我国三绕组变压器容量比常见 100/100/100, 100/100/50, 100/50/100 三种。若出现 50% 缩减容量的绕组，短路损耗 Pk 必须按 (Sn/S_test)² 进行换算！"
  };
}

/**
 * 模块9：输电线路参数与等效电路
 */
export function calcModule9(inputs) {
  const subChoice = inputs.subChoice || "1";

  if (subChoice === "1") {
    const L = parseF(inputs.L, 120);
    const r1 = parseF(inputs.r1, 0.038);
    const x1 = parseF(inputs.x1, 0.285);
    const b1 = parseF(inputs.b1, 4.12);
    const g1 = parseF(inputs.g1, 0);

    const R = r1 * L;
    const X = x1 * L;
    const B = b1 * L;
    const G = g1 * L;

    const steps = [
      {
        title: "1. 串联总阻抗集中参数 Z = R + jX",
        latex: `R = r_1 \\times L = ${r1} \\times ${L} = ${round(R, 4)} \\ \\Omega \\\\[4pt] X = x_1 \\times L = ${x1} \\times ${L} = ${round(X, 4)} \\ \\Omega \\\\[4pt] Z = (${round(R, 4)} + j${round(X, 4)}) \\ \\Omega`,
        content: `R = ${round(R, 4)} Ω, X = ${round(X, 4)} Ω`
      },
      {
        title: "2. 并联总导纳 Y 与单侧支路 Y/2",
        latex: `Y = (${round(G, 4)} + j${round(B, 4)}) \\ \\mu\\text{S} \\\\[4pt] \\frac{Y}{2} = (${round(G/2, 4)} + j${round(B/2, 4)}) \\ \\mu\\text{S}`,
        content: `Y = ${round(G, 4)} + j${round(B, 4)} μS, Y/2 = ${round(G/2, 4)} + j${round(B/2, 4)} μS`
      }
    ];

    return {
      subChoice: "1",
      R,
      X,
      G,
      B,
      steps,
      trapTip: "【避坑】π 型等效电路两端各并联 Y/2，计算节点功率平衡时，每侧母线注入的充电功率为 Qc = 1/2 U² B，切勿漏掉 1/2。"
    };
  } else {
    const Deq = parseF(inputs.Deq, 10.5);
    const r = parseF(inputs.r, 13.5);
    const n = Math.max(1, parseInt(inputs.n, 10) || 1);
    const d = parseF(inputs.d, 450);

    let req = r;
    let reqFormula = `r = ${r} mm`;

    if (n > 1) {
      if (n === 2) {
        req = Math.sqrt(r * d);
        reqFormula = `\\sqrt{r \\cdot d} = \\sqrt{${r} \\times ${d}} = ${round(req, 4)} \\text{ mm}`;
      } else if (n === 3) {
        req = Math.cbrt(r * d * d);
        reqFormula = `\\sqrt[3]{r \\cdot d^2} = ${round(req, 4)} \\text{ mm}`;
      } else if (n === 4) {
        req = 1.09 * Math.pow(r * Math.pow(d, 3), 0.25);
        reqFormula = `1.09 \\times \\sqrt[4]{r \\cdot d^3} = ${round(req, 4)} \\text{ mm}`;
      } else {
        const req_R = d / (2 * Math.sin(Math.PI / n));
        req = Math.pow(r * Math.pow(req_R, n - 1), 1 / n);
        reqFormula = `${round(req, 4)} \\text{ mm}`;
      }
    }

    const ratio = (Deq * 1000) / req;
    const logRatio = Math.log10(ratio);

    const x1 = 0.1445 * logRatio + 0.0157 / n;
    const b1 = 7.58 / logRatio;

    const steps = [
      {
        title: "1. 分裂导线等效半径 req 换算",
        latex: `r_{eq} = ${reqFormula}`,
        content: `根数 n = ${n}, 分裂间距 d = ${d} mm, req = ${round(req, 4)} mm`
      },
      {
        title: "2. 几何均距与等效半径比值 (量纲统一为 mm)",
        latex: `\\frac{D_{eq} \\times 1000}{r_{eq}} = \\frac{${Deq} \\times 1000}{${round(req, 4)}} = ${round(ratio, 4)} \\implies \\lg\\left(\\frac{D_{eq}}{r_{eq}}\\right) = ${round(logRatio, 4)}`,
        content: `Deq / req = ${round(ratio, 4)}, lg(Deq/req) = ${round(logRatio, 4)}`
      },
      {
        title: "3. 单位电抗 x1 与电纳 b1 经验公式",
        latex: `x_1 = 0.1445 \\lg\\left(\\frac{D_{eq}}{r_{eq}}\\right) + \\frac{0.0157}{n} = ${round(x1, 4)} \\ \\Omega/\\text{km} \\\\[4pt] b_1 = \\frac{7.58}{\\lg(D_{eq}/r_{eq})} = ${round(b1, 4)} \\ \\mu\\text{S}/\\text{km}`,
        content: `x1 = ${round(x1, 4)} Ω/km, b1 = ${round(b1, 4)} μS/km`
      }
    ];

    return {
      subChoice: "2",
      req,
      ratio,
      x1,
      b1,
      steps,
      trapTip: "【避坑】Deq 的单位是米 (m)，导线半径 r 和分裂间距 d 的单位是毫米 (mm)！代入常用公式 lg(Deq / req) 时必须乘以 1000 统一量纲，否则电抗和电纳结果将完全失真！"
    };
  }
}
