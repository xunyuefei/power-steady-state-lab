/**
 * 47 个必背公式模块配置 · 华电 811/812 考研电分专用 (重构版)
 * 严格按照考研复习与真题手算优先级排序：
 * #01 变压器参数计算
 * #02 线路参数计算
 * #03 线路对地电容功率 (充电功率)
 * #04 变压器不变损耗与可变损耗
 * #05 简单潮流：功率损耗
 * #06 简单潮流：电压降落
 * #07 简单潮流：环网潮流功率分布 (支持自适应多运算负荷)
 * #08 简单潮流：循环功率
 * 后续依次衔接：基础参数、简单潮流其他指标、调频调压、短路不对称故障等
 */

export const FORMULA_CHAPTERS = [
  { id: 'ch_param', name: '第一部分 元件参数与基础换算', icon: '⚙️' },
  { id: 'ch_flow', name: '第二部分 简单潮流计算', icon: '⚡' },
  { id: 'ch_freq', name: '第三部分 频率调节与功率分配', icon: '📊' },
  { id: 'ch_volt', name: '第四部分 电压调整与无功补偿', icon: '🎚️' },
  { id: 'ch_fault', name: '第五部分 短路与不对称故障', icon: '💥' },
];

export const FORMULAS = [
  // ═══════════════════════════════════════════════════════════════
  // 前 8 核心公式（严格按照用户指定顺序）
  // ═══════════════════════════════════════════════════════════════

  // #01 变压器参数计算
  {
    id: 1,
    chapter: 'ch_param',
    name: '变压器参数计算',
    badge: '设备建模·必考',
    latexFormula: 'R_T = \\frac{\\Delta P_k U_N^2}{1000 S_N^2},\\; X_T = \\frac{U_k\\% U_N^2}{100 S_N},\\; G_T = \\frac{\\Delta P_0}{1000 U_N^2},\\; B_T = \\frac{I_0\\% S_N}{100 U_N^2}',
    description: '双绕组变压器四个等值参数计算，全部阻抗与导纳归算到指定额定电压侧。',
    fields: [
      { id: 'SN', label: '额定容量 S_N', defaultUnit: 'MVA', units: ['MVA', 'kVA'], hint: '变压器铭牌容量' },
      { id: 'UN', label: '归算侧额定电压 U_N', defaultUnit: 'kV', units: ['kV', 'V'], hint: '归算侧电压' },
      { id: 'Pk', label: '短路损耗 ΔP_k', defaultUnit: 'kW', units: ['kW', 'MW', 'W'], hint: '铭牌短路损耗' },
      { id: 'Uk_pct', label: '短路电压百分比 U_k%', defaultUnit: '%', units: ['%'], hint: '如 10.5' },
      { id: 'P0', label: '空载损耗 ΔP_0', defaultUnit: 'kW', units: ['kW', 'MW', 'W'], hint: '铭牌空载损耗' },
      { id: 'I0_pct', label: '空载电流百分比 I_0%', defaultUnit: '%', units: ['%'], hint: '如 0.8' },
    ],
    presets: [
      { name: '110kV/31.5MVA 典型真题', values: { SN: 31.5, UN: 110, Pk: 135, Uk_pct: 10.5, P0: 31, I0_pct: 0.8 } },
      { name: '220kV/120MVA 主变', values: { SN: 120, UN: 220, Pk: 450, Uk_pct: 14.0, P0: 95, I0_pct: 0.6 } },
      { name: '10kV/1000kVA 配变', values: { SN: 1.0, UN: 10, Pk: 10.3, Uk_pct: 4.5, P0: 2.1, I0_pct: 1.2 } },
    ],
    calcFn: 'calcFormula1_TransformerParam'
  },

  // #02 线路参数计算
  {
    id: 2,
    chapter: 'ch_param',
    name: '线路参数计算',
    badge: '架空线四参数',
    latexFormula: 'r_1 = \\frac{\\rho}{S},\\; x_1 = 0.1445\\lg\\frac{D_m}{r_{eq}} + \\frac{0.0157}{n},\\; b_1 = \\frac{7.58\\times 10^{-6}}{\\lg(D_m/r_{eq})},\\; R = r_1 L,\\; X = x_1 L',
    description: '架空输电线路单位与全长电阻、电抗、电纳计算，支持单导线与分裂导线。',
    fields: [
      { id: 'rho', label: '电阻率 ρ', defaultUnit: 'Ω·mm²/km', units: ['Ω·mm²/km'], hint: '铝=31.5, 铜=18.8' },
      { id: 'S_cross', label: '导线标称截面积 S', defaultUnit: 'mm²', units: ['mm²'], hint: '如 LGJ-240 填 240' },
      { id: 'Dm', label: '几何均距 D_m', defaultUnit: 'm', units: ['m'], hint: '³√(Dab·Dbc·Dca)' },
      { id: 'r_mm', label: '导线外半径 r', defaultUnit: 'mm', units: ['mm'], hint: '单根导线外半径' },
      { id: 'n_split', label: '分裂根数 n', defaultUnit: '根', units: ['根'], hint: '1/2/3/4' },
      { id: 'd_split', label: '分裂间距 d', defaultUnit: 'mm', units: ['mm', 'cm'], hint: '单导线填 0' },
      { id: 'L_line', label: '线路全长 L', defaultUnit: 'km', units: ['km', 'm'], hint: '线路长度' },
    ],
    presets: [
      { name: '220kV LGJ-240 2分裂 (100km)', values: { rho: 31.5, S_cross: 240, Dm: 7.0, r_mm: 10.8, n_split: 2, d_split: 400, L_line: 100 } },
      { name: '110kV LGJ-185 单导线 (60km)', values: { rho: 31.5, S_cross: 185, Dm: 4.5, r_mm: 9.5, n_split: 1, d_split: 0, L_line: 60 } },
      { name: '500kV 4分裂 LGJ-400 (200km)', values: { rho: 31.5, S_cross: 400, Dm: 10.5, r_mm: 13.5, n_split: 4, d_split: 450, L_line: 200 } },
    ],
    calcFn: 'calcFormula2_LineParam'
  },

  // #03 线路对地电容功率 (充电功率)
  {
    id: 3,
    chapter: 'ch_param',
    name: '线路对地电容功率 (充电功率)',
    badge: '潮流前置',
    latexFormula: 'Q_C = U^2 B = U^2 (b_1 L),\\quad \\frac{Q_C}{2} = \\frac{1}{2} U^2 b_1 L',
    description: '线路对地容抗产生的充电功率。在简单潮流手算中，必须在首端和末端各并入半数充电功率 Qc/2。',
    fields: [
      { id: 'U', label: '运行/额定电压 U', defaultUnit: 'kV', units: ['kV', 'V'], hint: '线路运行电压' },
      { id: 'b1', label: '单位电纳 b₁', defaultUnit: '×10⁻⁶ S/km', units: ['×10⁻⁶ S/km', 'S/km'], hint: '典型架空线约 2.7~3.0' },
      { id: 'L', label: '线路长度 L', defaultUnit: 'km', units: ['km', 'm'], hint: '线路全长' },
    ],
    presets: [
      { name: '220kV 经典 150km 线路', values: { U: 220, b1: 2.85, L: 150 } },
      { name: '500kV 300km 超高压线路', values: { U: 500, b1: 4.15, L: 300 } },
      { name: '110kV 80km 线路', values: { U: 110, b1: 2.70, L: 80 } },
    ],
    calcFn: 'calcFormula3_ChargingPower'
  },

  // #04 变压器不变损耗与可变损耗
  {
    id: 4,
    chapter: 'ch_param',
    name: '变压器不变损耗与可变损耗',
    badge: '损耗分离',
    latexFormula: '\\Delta S_{Fe} = \\frac{\\Delta P_0}{1000} + j\\frac{I_0\\% S_N}{100},\\; \\Delta S_{Cu} = \\frac{\\Delta P_k}{1000}\\left(\\frac{S}{S_N}\\right)^2 + j\\frac{U_k\\% S_N}{100}\\left(\\frac{S}{S_N}\\right)^2',
    description: '不变损耗(铁耗励磁损耗)与外加电压相关且近似恒定；可变损耗(铜耗短路损耗)与通过负荷容量平方成正比。',
    fields: [
      { id: 'SN', label: '额定容量 S_N', defaultUnit: 'MVA', units: ['MVA', 'kVA'], hint: '铭牌额定容量' },
      { id: 'P0', label: '空载有功损耗 ΔP_0', defaultUnit: 'kW', units: ['kW', 'MW'], hint: '铁耗有功' },
      { id: 'I0_pct', label: '空载电流百分比 I_0%', defaultUnit: '%', units: ['%'], hint: '铁耗无功' },
      { id: 'Pk', label: '短路有功损耗 ΔP_k', defaultUnit: 'kW', units: ['kW', 'MW'], hint: '额定铜耗有功' },
      { id: 'Uk_pct', label: '短路电压百分比 U_k%', defaultUnit: '%', units: ['%'], hint: '额定铜耗无功' },
      { id: 'S_load', label: '实际通过容量 S', defaultUnit: 'MVA', units: ['MVA', 'kVA'], hint: '实际负荷容量' },
    ],
    presets: [
      { name: '31.5MVA 变压器 80% 负载', values: { SN: 31.5, P0: 31, I0_pct: 0.8, Pk: 135, Uk_pct: 10.5, S_load: 25.2 } },
      { name: '120MVA 主变满载', values: { SN: 120, P0: 95, I0_pct: 0.6, Pk: 450, Uk_pct: 14.0, S_load: 120 } },
    ],
    calcFn: 'calcFormula4_TransformerLoss'
  },

  // #05 简单潮流：功率损耗
  {
    id: 5,
    chapter: 'ch_flow',
    name: '简单潮流：功率损耗',
    badge: '潮流基础',
    latexFormula: '\\Delta P = \\frac{P^2 + Q^2}{U^2} R = \\frac{S^2}{U^2} R,\\quad \\Delta Q = \\frac{P^2 + Q^2}{U^2} X = \\frac{S^2}{U^2} X',
    description: '元件阻抗支路中的有功与无功功率损耗计算，支持按有功无功或视在功率与电压直接求解。',
    fields: [
      { id: 'P', label: '有功功率 P', defaultUnit: 'MW', units: ['MW', 'kW'], hint: '流经阻抗的有功' },
      { id: 'Q', label: '无功功率 Q', defaultUnit: 'MVar', units: ['MVar', 'kVar'], hint: '流经阻抗的无功' },
      { id: 'U', label: '运行电压 U', defaultUnit: 'kV', units: ['kV', 'V'], hint: '该侧节点电压' },
      { id: 'R', label: '支路电阻 R', defaultUnit: 'Ω', units: ['Ω', 'mΩ'], hint: '支路电阻' },
      { id: 'X', label: '支路电抗 X', defaultUnit: 'Ω', units: ['Ω', 'mΩ'], hint: '支路电抗' },
    ],
    presets: [
      { name: '110kV 输电线路损耗', values: { P: 30, Q: 15, U: 110, R: 10.5, X: 24.2 } },
      { name: '220kV 重载线路损耗', values: { P: 180, Q: 80, U: 220, R: 6.2, X: 35.0 } },
    ],
    calcFn: 'calcFormula5_PowerLoss'
  },

  // #06 简单潮流：电压降落
  {
    id: 6,
    chapter: 'ch_flow',
    name: '简单潮流：电压降落与相角差',
    badge: '潮流核心·必考',
    latexFormula: '\\Delta U = \\frac{PR + QX}{U},\\; \\delta U = \\frac{PX - QR}{U},\\; \\dot{U}_1 = (U_2 + \\Delta U) + j\\delta U,\\; \\delta = \\arctan\\frac{\\delta U}{U_2 + \\Delta U}',
    description: '阻抗两端电压相量差，纵分量 ΔU 主导电压幅值差，横分量 δU 主导相位角差。',
    fields: [
      { id: 'U', label: '参考端电压 U', defaultUnit: 'kV', units: ['kV', 'V'], hint: '末端电压U2或首端U1' },
      { id: 'P', label: '有功功率 P', defaultUnit: 'MW', units: ['MW', 'kW'], hint: '同侧有功' },
      { id: 'Q', label: '无功功率 Q', defaultUnit: 'MVar', units: ['MVar', 'kVar'], hint: '同侧无功' },
      { id: 'R', label: '线路/变压器电阻 R', defaultUnit: 'Ω', units: ['Ω'], hint: '支路电阻' },
      { id: 'X', label: '线路/变压器电抗 X', defaultUnit: 'Ω', units: ['Ω'], hint: '支路电抗' },
    ],
    presets: [
      { name: '末端已知求首端 (经典真题)', values: { U: 110, P: 25, Q: 12, R: 12.5, X: 25.0 } },
      { name: '大相角差高压工况', values: { U: 220, P: 150, Q: 60, R: 8.0, X: 45.0 } },
    ],
    calcFn: 'calcFormula6_VoltageDrop'
  },

  // #07 简单潮流：环网潮流功率分布
  {
    id: 7,
    chapter: 'ch_flow',
    name: '简单潮流：环网潮流功率分布',
    badge: '综合大题·可配节点',
    latexFormula: 'S_A = \\frac{\\sum_{i=1}^n S_i \\cdot Z_{iB}^*}{Z_\\Sigma^*},\\quad S_B = \\sum_{i=1}^n S_i - S_A',
    description: '两端供电网/闭式环网初步功率分布求解。可根据真题具体情况选择 1~3 个运算负荷，自动计算 A、B 端功率并精准判定功率分降点！',
    fields: [
      { id: 'node_count', label: '运算负荷节点数', type: 'select', options: [
        { value: '2', text: '2 个运算负荷节点 (经典考研大题)' },
        { value: '1', text: '1 个运算负荷节点 (双端单负荷)' },
        { value: '3', text: '3 个运算负荷节点 (三负荷环网)' },
      ]},
      { id: 'P1', label: '负荷1 有功 P₁', defaultUnit: 'MW', units: ['MW', 'kW'] },
      { id: 'Q1', label: '负荷1 无功 Q₁', defaultUnit: 'MVar', units: ['MVar', 'kVar'] },
      { id: 'R1', label: '区段1 电阻 R_A1', defaultUnit: 'Ω', units: ['Ω'] },
      { id: 'X1', label: '区段1 电抗 X_A1', defaultUnit: 'Ω', units: ['Ω'] },
      
      { id: 'P2', label: '负荷2 有功 P₂', defaultUnit: 'MW', units: ['MW', 'kW'] },
      { id: 'Q2', label: '负荷2 无功 Q₂', defaultUnit: 'MVar', units: ['MVar', 'kVar'] },
      { id: 'R2', label: '区段2 电阻 R_12', defaultUnit: 'Ω', units: ['Ω'] },
      { id: 'X2', label: '区段2 电抗 X_12', defaultUnit: 'Ω', units: ['Ω'] },

      { id: 'R3', label: '区段3 电阻 R_2B', defaultUnit: 'Ω', units: ['Ω'] },
      { id: 'X3', label: '区段3 电抗 X_2B', defaultUnit: 'Ω', units: ['Ω'] },

      { id: 'P3', label: '负荷3 有功 P₃ (3节点时使用)', defaultUnit: 'MW', units: ['MW', 'kW'] },
      { id: 'Q3', label: '负荷3 无功 Q₃ (3节点时使用)', defaultUnit: 'MVar', units: ['MVar', 'kVar'] },
      { id: 'R4', label: '区段4 电阻 R_3B (3节点时使用)', defaultUnit: 'Ω', units: ['Ω'] },
      { id: 'X4', label: '区段4 电抗 X_3B (3节点时使用)', defaultUnit: 'Ω', units: ['Ω'] },
    ],
    presets: [
      { name: '华电经典 2 节点真题', values: { node_count: '2', P1: 20, Q1: 10, R1: 4, X1: 8, P2: 30, Q2: 15, R2: 6, X2: 12, R3: 5, X3: 10, P3: 0, Q3: 0, R4: 0, X4: 0 } },
      { name: '对称 2 节点环网', values: { node_count: '2', P1: 15, Q1: 8, R1: 5, X1: 10, P2: 25, Q2: 12, R2: 5, X2: 10, R3: 5, X3: 10, P3: 0, Q3: 0, R4: 0, X4: 0 } },
      { name: '单负荷两端供电网', values: { node_count: '1', P1: 40, Q1: 20, R1: 8, X1: 16, R2: 12, X2: 24, P2: 0, Q2: 0, R3: 0, X3: 0, P3: 0, Q3: 0, R4: 0, X4: 0 } },
    ],
    calcFn: 'calcFormula7_RingPowerFlow'
  },

  // #08 简单潮流：循环功率
  {
    id: 8,
    chapter: 'ch_flow',
    name: '简单潮流：循环功率',
    badge: '环网调控',
    latexFormula: '\\dot{S}_C = \\frac{U_N \\cdot \\Delta \\dot{U}^*}{Z_\\Sigma^*} = \\frac{U_N (\\dot{U}_A - \\dot{U}_B)^*}{Z_\\Sigma^*}',
    description: '闭式环网两端电压不等时产生的强制循环功率。在环网中不贡献负荷却加剧线路损耗。',
    fields: [
      { id: 'UN', label: '额定平均电压 U_N', defaultUnit: 'kV', units: ['kV', 'V'], hint: '如 110kV' },
      { id: 'dU_re', label: '电压相差纵分量 Re(ΔU)', defaultUnit: 'kV', units: ['kV', 'V'], hint: 'UA - UB 的实部' },
      { id: 'dU_im', label: '电压相差横分量 Im(ΔU)', defaultUnit: 'kV', units: ['kV', 'V'], hint: 'UA - UB 的虚部' },
      { id: 'R_sum', label: '环路总电阻 R_Σ', defaultUnit: 'Ω', units: ['Ω'], hint: '环路所有支路电阻和' },
      { id: 'X_sum', label: '环路总电抗 X_Σ', defaultUnit: 'Ω', units: ['Ω'], hint: '环路所有支路电抗和' },
    ],
    presets: [
      { name: '经典电压差循环功率', values: { UN: 110, dU_re: 3.5, dU_im: 1.2, R_sum: 12, X_sum: 28 } },
      { name: '纯幅值差无横分量', values: { UN: 110, dU_re: 5.0, dU_im: 0, R_sum: 10, X_sum: 25 } },
    ],
    calcFn: 'calcFormula8_CirculatingPower'
  },

  // ═══════════════════════════════════════════════════════════════
  // 第一部分其余公式：元件参数与基础换算 (公式 9-16)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 9,
    chapter: 'ch_param',
    name: '消弧线圈补偿电流',
    badge: '中性点接地',
    latexFormula: '\\dot{I}_{Ck} = j\\left(\\frac{1}{\\omega L} - 3\\omega C\\right)\\dot{E}',
    description: '消弧线圈补偿后故障点残留电流。当 1/(ωL) = 3ωC 时为全补偿。',
    fields: [
      { id: 'omega', label: '角频率 ω', defaultUnit: 'rad/s', units: ['rad/s'] },
      { id: 'L_coil', label: '消弧线圈电感 L', defaultUnit: 'H', units: ['H', 'mH'] },
      { id: 'C_phase', label: '每相对地电容 C', defaultUnit: 'μF', units: ['μF', 'F'] },
      { id: 'E_mag', label: '相电源电势 |E|', defaultUnit: 'kV', units: ['kV', 'V'] },
    ],
    presets: [
      { name: '经典过补偿算例', values: { omega: 314.16, L_coil: 0.5, C_phase: 2.12, E_mag: 6.35 } }
    ],
    calcFn: 'calcFormula1'
  },
  {
    id: 10,
    chapter: 'ch_param',
    name: '基准值换算关系',
    badge: '标幺制基础',
    latexFormula: 'S_B = \\sqrt{3}U_B I_B,\\quad U_B = \\sqrt{3}Z_B I_B,\\quad Z_B = \\frac{U_B^2}{S_B}',
    description: '电力系统标幺制计算的基准值关系，三个量知二求一。',
    fields: [
      { id: 'S_B', label: '基准容量 S_B', defaultUnit: 'MVA', units: ['MVA', 'kVA'] },
      { id: 'U_B', label: '基准电压 U_B', defaultUnit: 'kV', units: ['kV', 'V'] },
    ],
    presets: [
      { name: '110kV 级基准', values: { S_B: 100, U_B: 115 } },
      { name: '220kV 级基准', values: { S_B: 100, U_B: 230 } },
    ],
    calcFn: 'calcFormula2'
  },
  {
    id: 11,
    chapter: 'ch_param',
    name: '波阻抗与自然功率',
    badge: '超高压理论',
    latexFormula: 'Z_C = \\sqrt{\\frac{x_1}{b_1}},\\quad P_N = \\frac{U_N^2}{Z_C}',
    description: '当输送功率等于自然功率时，沿线电压平直，无无功流动。',
    fields: [
      { id: 'U', label: '额定电压 U_N', defaultUnit: 'kV', units: ['kV'] },
      { id: 'Rc', label: '波阻抗 Z_C', defaultUnit: 'Ω', units: ['Ω'] },
    ],
    presets: [
      { name: '500kV 线路 (400Ω)', values: { U: 500, Rc: 400 } },
      { name: '220kV 线路 (380Ω)', values: { U: 220, Rc: 380 } },
    ],
    calcFn: 'calcFormula6'
  },
  {
    id: 12,
    chapter: 'ch_param',
    name: '限流电抗器参数',
    badge: '设备参数',
    latexFormula: 'X_R = \\frac{X_R\\% \\cdot U_{RN}}{100\\sqrt{3}\\cdot I_{RN}}',
    description: '电抗器电抗由额定电抗百分比、额定电压和电流确定。',
    fields: [
      { id: 'Xr_pct', label: '电抗百分比 X_R%', defaultUnit: '%', units: ['%'] },
      { id: 'U_RN', label: '额定电压 U_RN', defaultUnit: 'kV', units: ['kV', 'V'] },
      { id: 'I_RN', label: '额定电流 I_RN', defaultUnit: 'A', units: ['A', 'kA'] },
    ],
    presets: [
      { name: '10kV 限流电抗器', values: { Xr_pct: 5, U_RN: 10, I_RN: 600 } }
    ],
    calcFn: 'calcFormula7'
  },
  {
    id: 13,
    chapter: 'ch_param',
    name: '三绕组短路损耗折合',
    badge: '三绕组变压器',
    latexFormula: 'P_{k(1-3)}^{\\prime}=\\left(\\frac{S_{N1}}{S_{N3}}\\right)^2 P_{k(1-3)},\\quad P_{k1}=\\frac{1}{2}(P_{k12}+P_{k13}^{\\prime}-P_{k23}^{\\prime})',
    description: '容量比 100/100/50 时，较小容量绕组的短路损耗折合到 100% 容量必须乘以 4。',
    fields: [
      { id: 'SN1', label: '1号绕组容量', defaultUnit: 'MVA', units: ['MVA'] },
      { id: 'SN2', label: '2号绕组容量', defaultUnit: 'MVA', units: ['MVA'] },
      { id: 'SN3', label: '3号绕组容量', defaultUnit: 'MVA', units: ['MVA'] },
      { id: 'Pk12', label: 'Pk(1-2)', defaultUnit: 'kW', units: ['kW'] },
      { id: 'Pk13', label: 'Pk(1-3)', defaultUnit: 'kW', units: ['kW'] },
      { id: 'Pk23', label: 'Pk(2-3)', defaultUnit: 'kW', units: ['kW'] },
    ],
    presets: [
      { name: '100/100/50 经典折合', values: { SN1: 100, SN2: 100, SN3: 50, Pk12: 100, Pk13: 80, Pk23: 70 } }
    ],
    calcFn: 'calcFormula9'
  },
  {
    id: 14,
    chapter: 'ch_param',
    name: '最大短路损耗求变压器电阻',
    badge: '设备参数',
    latexFormula: 'R_{T(100\\%)}=\\frac{1}{2}\\frac{\\Delta P_{k\\max} U_N^2}{1000 S_N^2},\\quad R_{T(50\\%)}=2 R_{T(100\\%)}',
    description: '根据最大短路损耗直接求取三绕组变压器各绕组电阻。',
    fields: [
      { id: 'Pkmax', label: '最大短路损耗 Pk_max', defaultUnit: 'kW', units: ['kW', 'MW'] },
      { id: 'UN', label: '归算侧额定电压 U_N', defaultUnit: 'kV', units: ['kV'] },
      { id: 'SN', label: '归算侧额定容量 S_N', defaultUnit: 'MVA', units: ['MVA'] },
    ],
    presets: [
      { name: '典型最大损耗算例', values: { Pkmax: 250, UN: 110, SN: 31.5 } }
    ],
    calcFn: 'calcFormula10'
  },
  {
    id: 15,
    chapter: 'ch_param',
    name: '发电机运行相量与功角',
    badge: '发电机稳态',
    latexFormula: '\\tan\\delta = \\frac{P \\cdot x_d}{U^2 + Q \\cdot x_d},\\quad E_q = \\sqrt{(U + Q x_d / U)^2 + (P x_d / U)^2}',
    description: '发电机端电压、功率与内电势 Eq、功角 δ 的相量关系。',
    fields: [
      { id: 'U', label: '端电压 U', defaultUnit: 'kV', units: ['kV', 'V'] },
      { id: 'P', label: '有功出力 P', defaultUnit: 'MW', units: ['MW', 'kW'] },
      { id: 'Q', label: '无功出力 Q', defaultUnit: 'MVar', units: ['MVar', 'kVar'] },
      { id: 'xd', label: '同步电抗 xd', defaultUnit: 'Ω', units: ['Ω'] },
    ],
    presets: [
      { name: '发电机额定运行点', values: { U: 10.5, P: 25, Q: 15, xd: 1.2 } }
    ],
    calcFn: 'calcFormula11'
  },
  {
    id: 16,
    chapter: 'ch_param',
    name: '等值变压器 π 型模型',
    badge: '元件拓扑',
    latexFormula: 'k = \\frac{U_1}{U_2},\\; Y_T = \\frac{1}{R_T + jX_T},\\; Y_{10} = \\frac{1-k}{k}Y_T,\\; Y_{20} = \\frac{k-1}{k^2}Y_T',
    description: '非标准变比变压器的 π 型等效电路阻抗与导纳参数。',
    fields: [],
    presets: [],
    calcFn: 'calcFormulaRef'
  },

  // ═══════════════════════════════════════════════════════════════
  // 第二部分其余公式：简单潮流计算 (公式 17-25)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 17,
    chapter: 'ch_flow',
    name: '电压损耗百分比',
    badge: '电压指标',
    latexFormula: '\\Delta U\\% = \\frac{U_1 - U_2}{U_N} \\times 100\\%',
    description: '线路首末两端电压幅值的代数差值与额定电压的百分比。',
    fields: [
      { id: 'U1', label: '首端电压 U₁', defaultUnit: 'kV', units: ['kV', 'V'] },
      { id: 'U2', label: '末端电压 U₂', defaultUnit: 'kV', units: ['kV', 'V'] },
      { id: 'UN', label: '额定电压 U_N', defaultUnit: 'kV', units: ['kV', 'V'] },
    ],
    presets: [
      { name: '110kV 典型损耗', values: { U1: 115, U2: 108, UN: 110 } }
    ],
    calcFn: 'calcFormula13'
  },
  {
    id: 18,
    chapter: 'ch_flow',
    name: '电压偏移',
    badge: '电能质量',
    latexFormula: '\\Delta U_{dev}\\% = \\frac{U - U_N}{U_N} \\times 100\\%',
    description: '某节点实际运行电压与系统额定电压的数值差百分比。',
    fields: [
      { id: 'U', label: '实际运行电压 U', defaultUnit: 'kV', units: ['kV', 'V'] },
      { id: 'UN', label: '额定电压 U_N', defaultUnit: 'kV', units: ['kV', 'V'] },
    ],
    presets: [
      { name: '110kV 偏移校验', values: { U: 113, UN: 110 } }
    ],
    calcFn: 'calcFormula14'
  },
  {
    id: 19,
    chapter: 'ch_flow',
    name: '电压调整率',
    badge: '变压器指标',
    latexFormula: '\\Delta U_{adj}\\% = \\frac{U_{20} - U_2}{U_{20}} \\times 100\\%',
    description: '同一地点从负载变为空载时端电压的变化程度。',
    fields: [
      { id: 'U20', label: '空载电压 U₂₀', defaultUnit: 'kV', units: ['kV', 'V'] },
      { id: 'U2', label: '负载电压 U₂', defaultUnit: 'kV', units: ['kV', 'V'] },
    ],
    presets: [
      { name: '典型负载变空载', values: { U20: 115, U2: 105 } }
    ],
    calcFn: 'calcFormula15'
  },
  {
    id: 20,
    chapter: 'ch_flow',
    name: '最大负荷利用小时数 Tmax',
    badge: '负荷曲线',
    latexFormula: 'T_{\\max} = \\frac{W}{P_{\\max}}',
    description: '全年消耗电能与全年最大负荷的比值。',
    fields: [
      { id: 'W', label: '全年电能 W', defaultUnit: 'MWh', units: ['MWh', 'kWh'] },
      { id: 'Pmax', label: '最大负荷 P_max', defaultUnit: 'MW', units: ['MW', 'kW'] },
    ],
    presets: [
      { name: '工业负荷 Tmax', values: { W: 450000, Pmax: 100 } }
    ],
    calcFn: 'calcFormula16'
  },
  {
    id: 21,
    chapter: 'ch_flow',
    name: '最大功率损耗时间 τ',
    badge: '负荷曲线',
    latexFormula: '\\tau = \\frac{\\Delta W}{\\Delta P_{\\max}}',
    description: '全年线路电能损耗与最大负荷时功率损耗之比。',
    fields: [
      { id: 'dW', label: '年电能损耗 ΔW', defaultUnit: 'MWh', units: ['MWh', 'kWh'] },
      { id: 'dPmax', label: '最大损耗功率 ΔP_max', defaultUnit: 'MW', units: ['MW', 'kW'] },
    ],
    presets: [
      { name: '典型年损耗工况', values: { dW: 12000, dPmax: 3.2 } }
    ],
    calcFn: 'calcFormula17'
  },
  {
    id: 22,
    chapter: 'ch_flow',
    name: '年负荷率与损耗率',
    badge: '负荷曲线',
    latexFormula: '\\beta = \\frac{W}{8760 P_{\\max}},\\quad \\gamma = \\frac{\\Delta W}{8760 \\Delta P_{\\max}}',
    description: '衡量负荷平稳程度与年均损耗程度的无量纲指标。',
    fields: [
      { id: 'W', label: '全年消耗电能 W', defaultUnit: 'kWh', units: ['kWh', 'MWh'] },
      { id: 'Pmax', label: '最大负荷 P_max', defaultUnit: 'kW', units: ['kW', 'MW'] },
    ],
    presets: [
      { name: '典型年负荷率', values: { W: 525600, Pmax: 100 } }
    ],
    calcFn: 'calcFormula18'
  },
  {
    id: 23,
    chapter: 'ch_flow',
    name: '线路空载电压损耗 (费兰梯效应)',
    badge: '超高压轻载',
    latexFormula: '|\\Delta U| = \\frac{1}{2} B X U_2 = \\frac{1}{2} U_2 b_1 x_1 L^2',
    description: '长距离高压空载线路中对地电容充电电流流过感抗引起末端电压升高。',
    fields: [
      { id: 'U2', label: '末端电压 U₂', defaultUnit: 'kV', units: ['kV', 'V'] },
      { id: 'b1', label: '单位电纳 b₁', defaultUnit: '×10⁻⁶ S/km', units: ['×10⁻⁶ S/km'] },
      { id: 'x1', label: '单位电抗 x₁', defaultUnit: 'Ω/km', units: ['Ω/km'] },
      { id: 'L', label: '线路长度 L', defaultUnit: 'km', units: ['km'] },
    ],
    presets: [
      { name: '220kV 200km 空载升压', values: { U2: 220, b1: 2.8, x1: 0.4, L: 200 } }
    ],
    calcFn: 'calcFormula22'
  },
  {
    id: 24,
    chapter: 'ch_flow',
    name: '环网经济功率分布与均一网',
    badge: '经济调度',
    latexFormula: '\\dot{S}_{a(自然)} = \\frac{\\sum \\dot{S}_m Z_m^*}{Z_\\Sigma^*},\\; \\dot{S}_{a(经济)} = \\frac{\\sum \\dot{S}_m R_m}{R_\\Sigma},\\; \\dot{S}_{a(均一)} = \\frac{\\sum \\dot{S}_m L_m}{L_\\Sigma}',
    description: '自然分布与复阻抗共轭成反比，经济分布与纯电阻成反比。两者差值为循环功率。',
    fields: [],
    presets: [],
    calcFn: 'calcFormulaRef'
  },
  {
    id: 25,
    chapter: 'ch_flow',
    name: '潮流方程 (直角/极坐标与雅可比矩阵)',
    badge: '非线性潮流',
    latexFormula: 'P_i = U_i \\sum U_j(G_{ij}\\cos\\delta_{ij} + B_{ij}\\sin\\delta_{ij}),\\quad [\\Delta P, \\Delta Q]^T = [H, N; J, L][\\Delta\\delta, \\Delta U/U]^T',
    description: '牛顿-拉夫逊法潮流方程与雅可比矩阵各偏导数结构。',
    fields: [],
    presets: [],
    calcFn: 'calcFormulaRef'
  },

  // ═══════════════════════════════════════════════════════════════
  // 第三部分：频率调节与功率分配 (公式 26-30)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 26,
    chapter: 'ch_freq',
    name: '发电机单位调节功率',
    badge: '一次调频',
    latexFormula: 'K_G = -\\frac{\\Delta P}{\\Delta f},\\quad K_{G*} = K_G \\frac{f_N}{P_{GN}},\\quad \\sigma\\% = \\frac{1}{K_{G*}}\\times 100\\%',
    description: '发电机调速器特性，反映发电机随电网频率下降增加出力的能力。',
    fields: [
      { id: 'dP', label: '有功变化量 ΔP', defaultUnit: 'MW', units: ['MW', 'kW'] },
      { id: 'df', label: '频率变化量 Δf', defaultUnit: 'Hz', units: ['Hz'] },
      { id: 'fN', label: '额定频率 f_N', defaultUnit: 'Hz', units: ['Hz'] },
      { id: 'PGN', label: '额定容量 P_GN', defaultUnit: 'MW', units: ['MW'] },
    ],
    presets: [
      { name: '典型机组一次调频', values: { dP: 20, df: 0.2, fN: 50, PGN: 100 } }
    ],
    calcFn: 'calcFormula30'
  },
  {
    id: 27,
    chapter: 'ch_freq',
    name: '负荷单位调节功率',
    badge: '负荷效应',
    latexFormula: 'K_L = \\frac{\\Delta P}{\\Delta f},\\quad K_{L*} = K_L \\frac{f_N}{P_{LN}}',
    description: '负荷的自稳频率特性：频率下降时吸收有功减少。',
    fields: [
      { id: 'dP', label: '负荷变化量 ΔP', defaultUnit: 'MW', units: ['MW', 'kW'] },
      { id: 'df', label: '频率变化量 Δf', defaultUnit: 'Hz', units: ['Hz'] },
      { id: 'fN', label: '额定频率 f_N', defaultUnit: 'Hz', units: ['Hz'] },
      { id: 'PLN', label: '额定负荷 P_LN', defaultUnit: 'MW', units: ['MW'] },
    ],
    presets: [
      { name: '典型负荷调节效应', values: { dP: 5, df: 0.2, fN: 50, PLN: 100 } }
    ],
    calcFn: 'calcFormula31'
  },
  {
    id: 28,
    chapter: 'ch_freq',
    name: '系统单位调节功率',
    badge: '系统调频',
    latexFormula: 'K_S = K_G + K_L,\\quad \\Delta f = -\\frac{\\Delta P_L}{K_S}',
    description: '系统整体单位调节功率为各发电机与负荷调节功率之和。',
    fields: [
      { id: 'KG', label: '发电机总调节功率 K_G', defaultUnit: 'MW/Hz', units: ['MW/Hz'] },
      { id: 'KL', label: '负荷总调节功率 K_L', defaultUnit: 'MW/Hz', units: ['MW/Hz'] },
    ],
    presets: [
      { name: '典型全网一次调频', values: { KG: 80, KL: 20 } }
    ],
    calcFn: 'calcFormula32'
  },
  {
    id: 29,
    chapter: 'ch_freq',
    name: '互联系统频率变化量',
    badge: '互联电网',
    latexFormula: '\\Delta f = \\frac{(\\Delta P_{LA} - \\Delta P_{GA}) + (\\Delta P_{LB} - \\Delta P_{GB})}{K_A + K_B}',
    description: '互联电网扰动后系统稳态频差计算（Δf > 0 表示频率下降）。',
    fields: [
      { id: 'dPLA', label: 'A区负荷扰动 ΔP_LA', defaultUnit: 'MW', units: ['MW'] },
      { id: 'dPGA', label: 'A区增发功率 ΔP_GA', defaultUnit: 'MW', units: ['MW'] },
      { id: 'dPLB', label: 'B区负荷扰动 ΔP_LB', defaultUnit: 'MW', units: ['MW'] },
      { id: 'dPGB', label: 'B区增发功率 ΔP_GB', defaultUnit: 'MW', units: ['MW'] },
      { id: 'KA', label: 'A区总调节功率 K_A', defaultUnit: 'MW/Hz', units: ['MW/Hz'] },
      { id: 'KB', label: 'B区总调节功率 K_B', defaultUnit: 'MW/Hz', units: ['MW/Hz'] },
    ],
    presets: [
      { name: 'A区突增30MW负荷', values: { dPLA: 30, dPGA: 0, dPLB: 0, dPGB: 0, KA: 120, KB: 180 } }
    ],
    calcFn: 'calcFormula33'
  },
  {
    id: 30,
    chapter: 'ch_freq',
    name: '互联系统联络线功率变化',
    badge: '联络线潮流',
    latexFormula: '\\Delta P_{AB} = \\frac{K_A(\\Delta P_{LB} - \\Delta P_{GB}) - K_B(\\Delta P_{LA} - \\Delta P_{GA})}{K_A + K_B}',
    description: '两区域互联系统联络线上交换功率的增变量。',
    fields: [
      { id: 'dPLA', label: 'A区负荷扰动 ΔP_LA', defaultUnit: 'MW', units: ['MW'] },
      { id: 'dPGA', label: 'A区增发功率 ΔP_GA', defaultUnit: 'MW', units: ['MW'] },
      { id: 'dPLB', label: 'B区负荷扰动 ΔP_LB', defaultUnit: 'MW', units: ['MW'] },
      { id: 'dPGB', label: 'B区增发功率 ΔP_GB', defaultUnit: 'MW', units: ['MW'] },
      { id: 'KA', label: 'A区调节功率 K_A', defaultUnit: 'MW/Hz', units: ['MW/Hz'] },
      { id: 'KB', label: 'B区调节功率 K_B', defaultUnit: 'MW/Hz', units: ['MW/Hz'] },
    ],
    presets: [
      { name: 'A区增加负荷联络线支援', values: { dPLA: 30, dPGA: 0, dPLB: 0, dPGB: 0, KA: 120, KB: 180 } }
    ],
    calcFn: 'calcFormula34'
  },

  // ═══════════════════════════════════════════════════════════════
  // 第四部分：电压调整与无功补偿 (公式 31-35)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 31,
    chapter: 'ch_volt',
    name: '组合调压 · 补偿电容容量',
    badge: '调压计算·大题必考',
    latexFormula: 'Q_C = \\frac{k^2 U_{1\\max}^{\\prime}}{X}\\left(U_{1\\max}^{\\prime} - U_{2\\max} k\\right)',
    description: '当仅调节变压器分接头无法同时满足最大与最小负荷电压要求时，加装并联电容器的无功容量计算。',
    fields: [
      { id: 'k', label: '初选变比 k', defaultUnit: '', units: [''], hint: '选定的变压器变比' },
      { id: 'U1_prime', label: '最大负荷归算高压电压 U₁′max', defaultUnit: 'kV', units: ['kV', 'V'] },
      { id: 'U2', label: '低压侧允许电压要求 U₂max', defaultUnit: 'kV', units: ['kV', 'V'] },
      { id: 'X', label: '变压器等值电抗 X_T', defaultUnit: 'Ω', units: ['Ω'] },
    ],
    presets: [
      { name: '典型 110kV 调压补偿', values: { k: 1.05, U1_prime: 112, U2: 10.5, X: 15 } }
    ],
    calcFn: 'calcFormula38'
  },
  {
    id: 32,
    chapter: 'ch_volt',
    name: '降压变压器分接头电压选择',
    badge: '分接头选择',
    latexFormula: 'U_t = \\frac{U_1 - \\Delta U_T}{U_2} U_{2N}',
    description: '按最大负荷与最小负荷分别求出理想分接头电压，取平均值归档到标准额定档位。',
    fields: [
      { id: 'U1_prime', label: '最大负荷高压实际电压 U₁', defaultUnit: 'kV', units: ['kV'] },
      { id: 'U2_req', label: '低压侧要求电压 U₂', defaultUnit: 'kV', units: ['kV'] },
      { id: 'U2N', label: '低压侧额定电压 U₂N', defaultUnit: 'kV', units: ['kV'] },
      { id: 'X', label: '变压器阻抗 X_T', defaultUnit: 'Ω', units: ['Ω'] },
    ],
    presets: [
      { name: '110/10.5kV 变压器调压', values: { U1_prime: 112, U2_req: 10.5, U2N: 10.5, X: 15 } }
    ],
    calcFn: 'calcFormula38'
  },
  {
    id: 33,
    chapter: 'ch_volt',
    name: '等耗量微增率有功最优分配',
    badge: '经济调度',
    latexFormula: '\\frac{dF_i(P_{Gi})}{dP_{Gi}}\\frac{1}{1 - \\frac{\\partial\\Delta P_\\Sigma}{\\partial P_{Gi}}} = \\lambda',
    description: '电厂间有功功率负荷最优分配原则，不计网损时各机组微增率直接相等。',
    fields: [],
    presets: [],
    calcFn: 'calcFormulaRef'
  },
  {
    id: 34,
    chapter: 'ch_volt',
    name: '水火电有功最优分配',
    badge: '经济调度',
    latexFormula: '\\frac{\\partial F(P_{T1})}{\\partial P_{T1}} = \\gamma_2 \\frac{\\partial W_2(P_{H2})}{\\partial P_{H2}}',
    description: '考虑水煤换算系数的水火电厂负荷协调经济分配。',
    fields: [],
    presets: [],
    calcFn: 'calcFormulaRef'
  },
  {
    id: 35,
    chapter: 'ch_volt',
    name: '等网损微增率无功最优分布',
    badge: '无功优化',
    latexFormula: '\\frac{\\partial\\Delta P_\\Sigma}{\\partial Q_{Gi}} \\frac{1}{1 - \\frac{\\partial\\Delta Q_\\Sigma}{\\partial Q_{Gi}}} = \\lambda',
    description: '无功电源在全网中分布的最优判据，使全网总有功损耗达到极小。',
    fields: [],
    presets: [],
    calcFn: 'calcFormulaRef'
  },

  // ═══════════════════════════════════════════════════════════════
  // 第五部分：短路与不对称故障 (公式 36-47)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 36,
    chapter: 'ch_fault',
    name: '短路容量 (短路功率)',
    badge: '短路基础',
    latexFormula: 'S_k = \\sqrt{3} U_{av} I_k,\\quad S_{k*} = I_{k*}',
    description: '短路功率有名值必须乘以该电压等级的平均额定电压 Uav。',
    fields: [
      { id: 'Uav', label: '平均额定电压 U_av', defaultUnit: 'kV', units: ['kV', 'V'] },
      { id: 'Ik', label: '短路电流有效值 I_k', defaultUnit: 'kA', units: ['kA', 'A'] },
    ],
    presets: [
      { name: '115kV 级短路容量', values: { Uav: 115, Ik: 12.5 } },
      { name: '230kV 级短路容量', values: { Uav: 230, Ik: 25.0 } },
    ],
    calcFn: 'calcFormula39'
  },
  {
    id: 37,
    chapter: 'ch_fault',
    name: '冲击电流与最大有效值',
    badge: '动热稳定',
    latexFormula: 'i_{sh} = \\sqrt{2} K_M I_k,\\quad I_{sh} = I_k \\sqrt{1 + 2(K_M - 1)^2}',
    description: '短路发生约 0.01s 瞬间最大瞬时值冲击电流与冲击有效值电流。',
    fields: [
      { id: 'Ik', label: '短路电流周期分量 I_k', defaultUnit: 'kA', units: ['kA', 'A'] },
      { id: 'KM', label: '冲击系数 K_M', defaultUnit: '', units: [''], hint: '高压网通常取 1.8~1.9' },
    ],
    presets: [
      { name: '远离机组典型 (KM=1.8)', values: { Ik: 15, KM: 1.8 } },
      { name: '发电机端近区 (KM=1.9)', values: { Ik: 20, KM: 1.9 } },
    ],
    calcFn: 'calcFormula40'
  },
  {
    id: 38,
    chapter: 'ch_fault',
    name: '对称分量法变换矩阵',
    badge: '不对称基础',
    latexFormula: '[\\dot{F}_{a1}, \\dot{F}_{a2}, \\dot{F}_{a0}]^T = \\frac{1}{3}[1, a, a^2; 1, a^2, a; 1, 1, 1][\\dot{F}_a, \\dot{F}_b, \\dot{F}_c]^T',
    description: '三相不对称相分量转换为正序、负序和零序分量。',
    fields: [
      { id: 'Fa_mag', label: 'A相幅值 |Fa|', defaultUnit: 'p.u.', units: ['p.u.', 'A', 'V'] },
      { id: 'Fa_deg', label: 'A相初相角', defaultUnit: '°', units: ['°'] },
      { id: 'Fb_mag', label: 'B相幅值 |Fb|', defaultUnit: 'p.u.', units: ['p.u.', 'A', 'V'] },
      { id: 'Fb_deg', label: 'B相初相角', defaultUnit: '°', units: ['°'] },
      { id: 'Fc_mag', label: 'C相幅值 |Fc|', defaultUnit: 'p.u.', units: ['p.u.', 'A', 'V'] },
      { id: 'Fc_deg', label: 'C相初相角', defaultUnit: '°', units: ['°'] },
    ],
    presets: [
      { name: '单相对称基准', values: { Fa_mag: 1, Fa_deg: 0, Fb_mag: 1, Fb_deg: -120, Fc_mag: 1, Fc_deg: 120 } }
    ],
    calcFn: 'calcFormula41'
  },
  {
    id: 39,
    chapter: 'ch_fault',
    name: '不对称故障独立序网方程',
    badge: '序网解耦',
    latexFormula: '\\dot{U}_{f1} = E_{f|0|} - j x_{\\Sigma1}\\dot{I}_{f1},\\; \\dot{U}_{f2} = -j x_{\\Sigma2}\\dot{I}_{f2},\\; \\dot{U}_{f0} = -j x_{\\Sigma0}\\dot{I}_{f0}',
    description: '故障点各序电压与各序电流的独立端口戴维南等值方程。',
    fields: [],
    presets: [],
    calcFn: 'calcFormulaRef'
  },
  {
    id: 40,
    chapter: 'ch_fault',
    name: 'A相接地短路 f⁽¹⁾',
    badge: '单相接地',
    latexFormula: '\\dot{I}_{f1} = \\dot{I}_{f2} = \\dot{I}_{f0} = \\frac{E_{f|0|}}{j(x_{\\Sigma1} + x_{\\Sigma2} + x_{\\Sigma0})},\\quad I_{fa} = 3 I_{f1}',
    description: '单相接地短路边界条件：Ib=Ic=0, Ua=0。三个独立序网完全串联。',
    fields: [
      { id: 'Ef0', label: '故障前相电压 E_f|0|', defaultUnit: 'p.u.', units: ['p.u.', 'kV'] },
      { id: 'x1', label: '正序总电抗 x_Σ1', defaultUnit: 'p.u.', units: ['p.u.', 'Ω'] },
      { id: 'x2', label: '负序总电抗 x_Σ2', defaultUnit: 'p.u.', units: ['p.u.', 'Ω'] },
      { id: 'x0', label: '零序总电抗 x_Σ0', defaultUnit: 'p.u.', units: ['p.u.', 'Ω'] },
    ],
    presets: [
      { name: '典型单相接地', values: { Ef0: 1.0, x1: 0.2, x2: 0.2, x0: 0.1 } }
    ],
    calcFn: 'calcFormula43'
  },
  {
    id: 41,
    chapter: 'ch_fault',
    name: 'BC相相间两相短路 f⁽²⁾',
    badge: '两相短路',
    latexFormula: '\\dot{I}_{f1} = -\\dot{I}_{f2} = \\frac{E_{f|0|}}{j(x_{\\Sigma1} + x_{\\Sigma2})},\\quad I_{fb} = \\sqrt{3} I_{f1}',
    description: '两相短路边界条件：Ia=0, Ib=-Ic, Ub=Uc。正负序网串联，零序不参与。',
    fields: [
      { id: 'Ef0', label: '故障前相电压 E_f|0|', defaultUnit: 'p.u.', units: ['p.u.', 'kV'] },
      { id: 'x1', label: '正序总电抗 x_Σ1', defaultUnit: 'p.u.', units: ['p.u.', 'Ω'] },
      { id: 'x2', label: '负序总电抗 x_Σ2', defaultUnit: 'p.u.', units: ['p.u.', 'Ω'] },
    ],
    presets: [
      { name: '典型两相短路', values: { Ef0: 1.0, x1: 0.2, x2: 0.2 } }
    ],
    calcFn: 'calcFormula44'
  },
  {
    id: 42,
    chapter: 'ch_fault',
    name: 'BC相两相接地短路 f⁽¹·¹⁾',
    badge: '两相接地',
    latexFormula: 'I_{f1} = \\frac{E_{f|0|}}{x_{\\Sigma1} + \\frac{x_{\\Sigma2} x_{\\Sigma0}}{x_{\\Sigma2} + x_{\\Sigma0}}},\\quad I_n = 3 |I_{f0}|',
    description: '两相接地边界条件：Ia=0, Ub=Uc=0。负序与零序网并联后与正序网串联。',
    fields: [
      { id: 'Ef0', label: '故障前相电压 E_f|0|', defaultUnit: 'p.u.', units: ['p.u.', 'kV'] },
      { id: 'x1', label: '正序总电抗 x_Σ1', defaultUnit: 'p.u.', units: ['p.u.', 'Ω'] },
      { id: 'x2', label: '负序总电抗 x_Σ2', defaultUnit: 'p.u.', units: ['p.u.', 'Ω'] },
      { id: 'x0', label: '零序总电抗 x_Σ0', defaultUnit: 'p.u.', units: ['p.u.', 'Ω'] },
    ],
    presets: [
      { name: '典型两相接地', values: { Ef0: 1.0, x1: 0.2, x2: 0.2, x0: 0.1 } }
    ],
    calcFn: 'calcFormula45'
  },
  {
    id: 43,
    chapter: 'ch_fault',
    name: '变压器序分量相位变换 (时钟组)',
    badge: '相角变换',
    latexFormula: '\\dot{U}_{a1} = \\dot{U}_{A1} e^{-j N \\cdot 30^\\circ},\\quad \\dot{U}_{a2} = \\dot{U}_{A2} e^{j N \\cdot 30^\\circ}',
    description: 'Yd-11 或 Yy-N 联结组变压器高低压两侧正负序分量时钟角度旋转。',
    fields: [
      { id: 'UA1_mag', label: '高压侧正序幅值', defaultUnit: 'p.u.', units: ['p.u.', 'kV'] },
      { id: 'UA1_deg', label: '高压侧正序相角', defaultUnit: '°', units: ['°'] },
      { id: 'N_group', label: '时钟联结组号 N', defaultUnit: '', units: [''], hint: '如 Yd-11 填 11' },
    ],
    presets: [
      { name: 'Yd-11 典型主变', values: { UA1_mag: 1.0, UA1_deg: 0, N_group: 11 } }
    ],
    calcFn: 'calcFormula46'
  },
  {
    id: 44,
    chapter: 'ch_fault',
    name: '正序等效定则短路电流',
    badge: '短路统一法则',
    latexFormula: 'I_f = M \\frac{E_{f|0|}}{x_{\\Sigma1} + x_\\Delta}',
    description: '各类不对称短路的正序电流等效为在短路点串入附加阻抗 xΔ 的对称三相短路。',
    fields: [
      { id: 'Ef0', label: '故障前电压 E_f|0|', defaultUnit: 'p.u.', units: ['p.u.'] },
      { id: 'x1', label: '正序电抗 x_Σ1', defaultUnit: 'p.u.', units: ['p.u.'] },
      { id: 'x2', label: '负序电抗 x_Σ2', defaultUnit: 'p.u.', units: ['p.u.'] },
      { id: 'x0', label: '零序电抗 x_Σ0', defaultUnit: 'p.u.', units: ['p.u.'] },
      { id: 'zf', label: '过渡阻抗 z_f', defaultUnit: 'p.u.', units: ['p.u.'] },
      { id: 'fault_type', label: '故障类型', type: 'select', options: [
        { value: 'f3', text: 'f⁽³⁾ 对称三相短路 (xΔ=0, M=1)' },
        { value: 'f1', text: 'f⁽¹⁾ 单相接地短路 (xΔ=x2+x0, M=3)' },
        { value: 'f2', text: 'f⁽²⁾ 两相短路 (xΔ=x2, M=√3)' },
        { value: 'f11', text: 'f⁽¹·¹⁾ 两相接地短路 (xΔ=x2//x0, M=√3)' },
      ]},
    ],
    presets: [
      { name: '单相接地短路', values: { Ef0: 1.0, x1: 0.2, x2: 0.2, x0: 0.1, zf: 0, fault_type: 'f1' } },
      { name: '两相接地短路', values: { Ef0: 1.0, x1: 0.2, x2: 0.2, x0: 0.1, zf: 0, fault_type: 'f11' } },
    ],
    calcFn: 'calcFormula47'
  },
  {
    id: 45,
    chapter: 'ch_fault',
    name: '隐极/凸极机功角特性与静稳储备',
    badge: '电力系统稳定',
    latexFormula: 'P_E = \\frac{E_q U}{x_d} \\sin\\delta,\\quad K_p = \\frac{P_{M} - P_0}{P_0} \\times 100\\%',
    description: '功角极限特性与静态稳定储备系数计算（国标要求正常运行不小于 15%~20%）。',
    fields: [
      { id: 'P0', label: '正常运行有功 P₀', defaultUnit: 'MW', units: ['MW'] },
      { id: 'PM', label: '静态稳定极限功率 P_M', defaultUnit: 'MW', units: ['MW'] },
    ],
    presets: [
      { name: '典型静态稳定储备', values: { P0: 100, PM: 135 } }
    ],
    calcFn: 'calcFormula45_StabilityMargin'
  },
  {
    id: 46,
    chapter: 'ch_fault',
    name: '暂态稳定等面积定则与极限切除角',
    badge: '暂态稳定',
    latexFormula: '\\int_{\\delta_0}^{\\delta_c} (P_T - P_{II}) d\\delta = \\int_{\\delta_c}^{\\delta_{\\max}} (P_{III} - P_T) d\\delta',
    description: '加速面积等于最大减速面积时系统保持暂态稳定，推导极限切除角 δcm。',
    fields: [],
    presets: [],
    calcFn: 'calcFormulaRef'
  },
  {
    id: 47,
    chapter: 'ch_fault',
    name: '发电机等效惯性时间常数折算',
    badge: '机组参数',
    latexFormula: 'T_{Ji} = T_{JNi} \\frac{S_{Ni}}{S_B},\\quad T_{J\\Sigma} = \\sum_{i=1}^n T_{Ji}',
    description: '多台发电机折算到全系统统一基准容量下的等效惯性时间常数。',
    fields: [
      { id: 'TJ1', label: '1号机惯性常数 T_J1', defaultUnit: 's', units: ['s'] },
      { id: 'SN1', label: '1号机容量 S_N1', defaultUnit: 'MVA', units: ['MVA'] },
      { id: 'TJ2', label: '2号机惯性常数 T_J2', defaultUnit: 's', units: ['s'] },
      { id: 'SN2', label: '2号机容量 S_N2', defaultUnit: 'MVA', units: ['MVA'] },
      { id: 'SB', label: '系统基准容量 S_B', defaultUnit: 'MVA', units: ['MVA'] },
    ],
    presets: [
      { name: '两台机组折算', values: { TJ1: 8, SN1: 300, TJ2: 10, SN2: 600, SB: 100 } }
    ],
    calcFn: 'calcFormula47_InertiaConstant'
  },
];
