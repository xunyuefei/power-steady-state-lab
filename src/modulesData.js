/**
 * 47 个必背公式模块配置 · 华电 811/812 考研电分专用
 * 按章节分组，包含公式元数据、KaTeX、输入字段、预设算例
 */

export const FORMULA_CHAPTERS = [
  { id: 'ch1', name: '第一章 基础参数与换算', icon: '📐' },
  { id: 'ch2', name: '第二章 设备参数建模', icon: '⚙️' },
  { id: 'ch3', name: '第三章 电压与功率指标', icon: '⚡' },
  { id: 'ch4', name: '第四章 变压器损耗与运算负荷', icon: '🔥' },
  { id: 'ch5', name: '第五章 网络潮流分布', icon: '🔄' },
  { id: 'ch6', name: '第六章 频率调节与功率分配', icon: '📊' },
  { id: 'ch7', name: '第七章 调压与补偿', icon: '🎚️' },
  { id: 'ch8', name: '第八章 短路计算', icon: '💥' },
];

export const FORMULAS = [
  // ═══════════ 第一章：基础参数与换算 (公式 1-6) ═══════════
  {
    id: 1,
    chapter: 'ch1',
    name: '消弧线圈补偿电流',
    badge: '中性点接地',
    latexFormula: '\\dot{I}_{Ck} = j\\left(\\frac{1}{\\omega L} - 3\\omega C\\right)\\dot{E}',
    description: '消弧线圈补偿后故障点残留电流。当 1/(ωL) = 3ωC 时为全补偿，残留电流为零。',
    fields: [
      { id: 'omega', label: '角频率 ω', unit: 'rad/s', hint: '工频50Hz时 ω = 314.16' },
      { id: 'L_coil', label: '消弧线圈电感 L', unit: 'H', hint: '消弧线圈电感值' },
      { id: 'C_phase', label: '单相对地电容 C', unit: 'μF', hint: '每相对地电容' },
      { id: 'E_mag', label: '电源电势幅值 |E|', unit: 'kV', hint: '系统相电压' },
    ],
    presets: [
      { name: '经典补偿算例', values: { omega: 314.16, L_coil: 0.5, C_phase: 2.12, E_mag: 6.35 } },
      { name: '过补偿工况', values: { omega: 314.16, L_coil: 0.4, C_phase: 2.0, E_mag: 6.35 } },
    ],
    calcFn: 'calcFormula1'
  },
  {
    id: 2,
    chapter: 'ch1',
    name: '基准值关系',
    badge: '标幺制基础',
    latexFormula: 'S_B = \\sqrt{3}U_B I_B,\\quad U_B = \\sqrt{3}Z_B I_B,\\quad Z_B = \\frac{U_B^2}{S_B}',
    description: '电力系统标幺制计算的基准值换算关系，三个量知二求一。',
    fields: [
      { id: 'S_B', label: '基准容量 S_B', unit: 'MVA', hint: '通常取 100 MVA' },
      { id: 'U_B', label: '基准电压 U_B', unit: 'kV', hint: '取各级的平均额定电压' },
    ],
    presets: [
      { name: '110kV 级基准', values: { S_B: 100, U_B: 115 } },
      { name: '220kV 级基准', values: { S_B: 100, U_B: 230 } },
      { name: '500kV 级基准', values: { S_B: 100, U_B: 525 } },
    ],
    calcFn: 'calcFormula2'
  },
  {
    id: 3,
    chapter: 'ch1',
    name: '线路电阻',
    badge: '线路参数',
    latexFormula: 'r_1 = \\frac{\\rho}{S}\\;(\\Omega/\\text{km}),\\quad \\rho_{Cu}=18.8,\\; \\rho_{Al}=31.5\\;(\\Omega\\cdot mm^2/\\text{km})',
    description: '根据导线材质电阻率和截面积求单位长度电阻。',
    fields: [
      { id: 'rho', label: '电阻率 ρ', unit: 'Ω·mm²/km', hint: '铜=18.8, 铝=31.5' },
      { id: 'S_cross', label: '导线截面积 S', unit: 'mm²', hint: '导线标称截面积' },
      { id: 'L_line', label: '线路长度 L', unit: 'km', hint: '线路全长' },
    ],
    presets: [
      { name: 'LGJ-240 铝导线', values: { rho: 31.5, S_cross: 240, L_line: 100 } },
      { name: 'LGJ-400 铝导线', values: { rho: 31.5, S_cross: 400, L_line: 80 } },
    ],
    calcFn: 'calcFormula3'
  },
  {
    id: 4,
    chapter: 'ch1',
    name: '线路电抗',
    badge: '线路参数',
    latexFormula: 'x_1 = 0.1445\\lg\\frac{D_m}{r_{eq}} + \\frac{0.0157}{n}\\;(\\Omega/\\text{km})',
    description: '架空线路单位电抗取决于几何均距 Dm 和等效半径 req，分裂导线需计算等效半径。',
    fields: [
      { id: 'Deq', label: '几何均距 D_m', unit: 'm', hint: '³√(Dab·Dbc·Dca)' },
      { id: 'r', label: '导线外半径 r', unit: 'mm', hint: '导线外径一半' },
      { id: 'n', label: '分裂根数 n', unit: '根', hint: '1/2/3/4' },
      { id: 'd', label: '分裂间距 d', unit: 'mm', hint: '单导线填 0' },
    ],
    presets: [
      { name: '500kV 4分裂 LGJ-400', values: { Deq: 10.5, r: 13.5, n: 4, d: 450 } },
      { name: '220kV 2分裂', values: { Deq: 7.0, r: 10.8, n: 2, d: 400 } },
      { name: '110kV 单导线', values: { Deq: 4.5, r: 8.5, n: 1, d: 0 } },
    ],
    calcFn: 'calcFormula4'
  },
  {
    id: 5,
    chapter: 'ch1',
    name: '线路电导与电纳',
    badge: '线路参数',
    latexFormula: 'g_1 = \\frac{\\Delta P_g}{U^2}\\times 10^{-3},\\quad b_1 = \\frac{7.58}{\\lg\\frac{D_m}{r_{eq}}}\\times 10^{-6}\\;(\\text{S/km})',
    description: '电导反映电晕损耗，电纳反映线路对地电容。高电压等级电纳不可忽略。',
    fields: [
      { id: 'delta_Pg', label: '电晕损耗 ΔP_g', unit: 'kW/km', hint: '三相每公里电晕损耗功率' },
      { id: 'U_nom', label: '额定电压 U', unit: 'kV', hint: '线路额定电压' },
      { id: 'Deq', label: '几何均距 D_m', unit: 'm', hint: '³√(Dab·Dbc·Dca)' },
      { id: 'req', label: '等效半径 r_eq', unit: 'mm', hint: '分裂导线等效半径' },
    ],
    presets: [
      { name: '220kV 线路', values: { delta_Pg: 0.5, U_nom: 220, Deq: 7.0, req: 65.7 } },
    ],
    calcFn: 'calcFormula5'
  },
  {
    id: 6,
    chapter: 'ch1',
    name: '波阻抗与自然功率',
    badge: '超高压理论',
    latexFormula: 'Z_C = \\sqrt{\\frac{x_1}{b_1}},\\quad P_N = \\frac{U_N^2}{Z_C}',
    description: '超高压/特高压线路的波阻抗和自然功率。传输功率等于自然功率时，沿线电压恒定。',
    fields: [
      { id: 'U', label: '额定电压 U_N', unit: 'kV', hint: '如 500kV' },
      { id: 'Rc', label: '波阻抗实部', unit: 'Ω', hint: '架空线约 250~400Ω' },
      { id: 'Xc', label: '波阻抗虚部', unit: 'Ω', hint: '无损近似填 0' },
    ],
    presets: [
      { name: '500kV (Zc=400Ω)', values: { U: 500, Rc: 400, Xc: 0 } },
      { name: '220kV (Zc=380Ω)', values: { U: 220, Rc: 380, Xc: 0 } },
      { name: '电缆 (Zc=50Ω)', values: { U: 110, Rc: 50, Xc: 0 } },
    ],
    calcFn: 'calcFormula6'
  },

  // ═══════════ 第二章：设备参数建模 (公式 7-11) ═══════════
  {
    id: 7,
    chapter: 'ch2',
    name: '电抗器参数',
    badge: '设备参数',
    latexFormula: 'X_R = \\frac{X_R\\% \\cdot U_{RN}}{100\\sqrt{3}\\cdot I_{RN}}',
    description: '限流电抗器的电抗值由铭牌电抗百分比、额定电压和额定电流求取。',
    fields: [
      { id: 'Xr_pct', label: '电抗百分比 X_R%', unit: '%', hint: '铭牌给出' },
      { id: 'U_RN', label: '额定电压 U_RN', unit: 'kV', hint: '电抗器额定电压' },
      { id: 'I_RN', label: '额定电流 I_RN', unit: 'A', hint: '电抗器额定电流' },
    ],
    presets: [
      { name: '10kV 限流电抗器', values: { Xr_pct: 5, U_RN: 10, I_RN: 600 } },
    ],
    calcFn: 'calcFormula7'
  },
  {
    id: 8,
    chapter: 'ch2',
    name: '变压器四参数',
    badge: '设备建模必考',
    latexFormula: 'R_T = \\frac{P_k U_N^2}{1000 S_N^2},\\; X_T = \\frac{U_k\\% \\cdot U_N^2}{100 S_N},\\; G_T = \\frac{P_0}{1000 U_N^2},\\; B_T = \\frac{I_0\\% \\cdot S_N}{100 U_N^2}',
    description: '依据短路试验(Pk, Uk%)与空载试验(P0, I0%)铭牌，求归算至指定电压侧的等效阻抗与励磁导纳。',
    fields: [
      { id: 'Sn', label: '额定容量 S_N', unit: 'MVA', hint: '如 31.5 MVA' },
      { id: 'Un', label: '归算侧电压 U_N', unit: 'kV', hint: '如 110 或 121 kV' },
      { id: 'Pk', label: '短路损耗 P_k', unit: 'kW', hint: '铜耗' },
      { id: 'Uk', label: '短路电压 U_k%', unit: '%', hint: '如 10.5%' },
      { id: 'P0', label: '空载损耗 P_0', unit: 'kW', hint: '铁耗' },
      { id: 'I0', label: '空载电流 I_0%', unit: '%', hint: '如 0.8%' },
    ],
    presets: [
      { name: 'SFL1-31500/110', values: { Sn: 31.5, Un: 110, Pk: 180, Uk: 10.5, P0: 32, I0: 0.8 } },
      { name: 'SFP-240000/220', values: { Sn: 240, Un: 242, Pk: 650, Uk: 14.0, P0: 160, I0: 0.45 } },
      { name: 'S11-1000/10', values: { Sn: 1.0, Un: 10, Pk: 10.3, Uk: 4.5, P0: 1.15, I0: 1.1 } },
    ],
    calcFn: 'calcFormula8'
  },
  {
    id: 9,
    chapter: 'ch2',
    name: '三绕组短路损耗折合',
    badge: '高难度压轴',
    latexFormula: "P'_{k(1\\text{-}3)} = \\left(\\frac{S_{N1}}{S_{N3}}\\right)^2 P_{k(1\\text{-}3)}",
    description: '三绕组变压器容量比非 100/100/100 时，铜耗需按容量平方归算至最大绕组额定容量。',
    fields: [
      { id: 'Sn', label: '基准额定容量 S_N', unit: 'MVA', hint: '最大绕组容量' },
      { id: 'Un', label: '计算侧电压 U_N', unit: 'kV', hint: '归算侧' },
      { id: 'uk_flag', label: 'Uk% 是否需归算？', type: 'select', options: [
        { value: '0', text: '已归算至额定容量 (常见)' },
        { value: '1', text: '未归算，需乘以 Sn/S_test' },
      ], hint: '按题目说明选择' },
      { id: 'S_12', label: 'S12 试验容量', unit: 'MVA' },
      { id: 'Pk12', label: 'Pk12 短路损耗', unit: 'kW' },
      { id: 'Uk12', label: 'Uk12%', unit: '%' },
      { id: 'S_13', label: 'S13 试验容量', unit: 'MVA' },
      { id: 'Pk13', label: 'Pk13 短路损耗', unit: 'kW' },
      { id: 'Uk13', label: 'Uk13%', unit: '%' },
      { id: 'S_23', label: 'S23 试验容量', unit: 'MVA' },
      { id: 'Pk23', label: 'Pk23 短路损耗', unit: 'kW' },
      { id: 'Uk23', label: 'Uk23%', unit: '%' },
    ],
    presets: [
      { name: '容量比100/100/50', values: { Sn: 120, Un: 220, uk_flag: '0', S_12: 120, Pk12: 520, Uk12: 14.5, S_13: 60, Pk13: 280, Uk13: 24.0, S_23: 60, Pk23: 220, Uk23: 8.5 } },
      { name: '容量比100/50/100 (负电抗)', values: { Sn: 90, Un: 220, uk_flag: '0', S_12: 45, Pk12: 360, Uk12: 10.5, S_13: 90, Pk13: 450, Uk13: 18.0, S_23: 45, Pk23: 210, Uk23: 6.5 } },
      { name: '容量比100/100/100', values: { Sn: 63, Un: 110, uk_flag: '0', S_12: 63, Pk12: 310, Uk12: 10.5, S_13: 63, Pk13: 340, Uk13: 17.5, S_23: 63, Pk23: 290, Uk23: 6.5 } },
    ],
    calcFn: 'calcFormula9'
  },
  {
    id: 10,
    chapter: 'ch2',
    name: '最大短路损耗求变压器电阻',
    badge: '三绕组进阶',
    latexFormula: 'R_{T(100\\%)} = \\frac{1}{2}\\frac{P_{k\\max}}{1000 S_N}\\cdot\\frac{U_N^2}{S_N},\\quad R_{T(50\\%)} = 2R_{T(100\\%)}',
    description: '给出最大短路损耗直接计算变压器绕组电阻的简便公式。50%容量绕组电阻为100%绕组的2倍。',
    fields: [
      { id: 'Pk_max', label: '最大短路损耗 Pk_max', unit: 'kW' },
      { id: 'Sn', label: '额定容量 S_N', unit: 'MVA' },
      { id: 'Un', label: '归算侧电压 U_N', unit: 'kV' },
    ],
    presets: [
      { name: '典型算例', values: { Pk_max: 520, Sn: 120, Un: 220 } },
    ],
    calcFn: 'calcFormula10'
  },
  {
    id: 11,
    chapter: 'ch2',
    name: '发电机运行相量关系',
    badge: '电机基础',
    latexFormula: '\\dot{E}_G = \\dot{U} + jx_G\\dot{I},\\quad P = \\frac{E_G U}{x_G}\\sin\\delta,\\quad Q = \\frac{E_G U}{x_G}\\cos\\delta - \\frac{U^2}{x_G}',
    description: '发电机内电势与端电压的相量关系，以及有功/无功功率的功角特性表达式。',
    fields: [
      { id: 'E_G', label: '发电机电势 E_G', unit: 'kV' },
      { id: 'U_gen', label: '端电压 U', unit: 'kV' },
      { id: 'x_G', label: '同步电抗 x_G', unit: 'Ω' },
      { id: 'delta_deg', label: '功角 δ', unit: '°', hint: '内电势超前端电压的角度' },
    ],
    presets: [
      { name: '发电机稳态算例', values: { E_G: 13.8, U_gen: 10.5, x_G: 1.2, delta_deg: 30 } },
    ],
    calcFn: 'calcFormula11'
  },

  // ═══════════ 第三章：电压与功率指标 (公式 12-19) ═══════════
  {
    id: 12,
    chapter: 'ch3',
    name: '电压降落',
    badge: '基础高频',
    latexFormula: '\\Delta U = \\frac{PR + QX}{U},\\quad \\delta U = \\frac{PX - QR}{U},\\quad \\dot{U}_1 = (U_2 + \\Delta U) + j\\delta U',
    description: '电压降落为线路始末两端电压的相量差。纵分量 ΔU 决定电压幅值变化，横分量 δU 决定相角偏移。',
    fields: [
      { id: 'U', label: '参考端电压', unit: 'kV', hint: '已知端电压' },
      { id: 'P_k', label: '有功功率 P', unit: 'kW', canToggleUnit: true },
      { id: 'Q_k', label: '无功功率 Q', unit: 'kVar', canToggleUnit: true },
      { id: 'R', label: '线路电阻 R', unit: 'Ω' },
      { id: 'X', label: '线路电抗 X', unit: 'Ω' },
    ],
    presets: [
      { name: '华电811真题：110kV重负荷', values: { U: 110, P_k: 24000, Q_k: 18000, R: 12.5, X: 25.0 } },
      { name: '陈珩例2-2：已知末端求首端', values: { U: 110, P_k: 16000, Q_k: 12000, R: 8.4, X: 16.8 } },
      { name: '500kV 远距离输电', values: { U: 500, P_k: 650000, Q_k: 220000, R: 7.2, X: 45.0 } },
    ],
    calcFn: 'calcFormula12'
  },
  {
    id: 13,
    chapter: 'ch3',
    name: '电压损耗',
    badge: '概念辨析',
    latexFormula: '\\text{电压损耗} = \\frac{U_1 - U_2}{U_N}\\times 100\\%',
    description: '线路始末两端电压的数值差（标量差），与电压降落（相量差）区分。',
    fields: [
      { id: 'U1', label: '始端电压 U₁', unit: 'kV' },
      { id: 'U2', label: '末端电压 U₂', unit: 'kV' },
      { id: 'U_N', label: '额定电压 U_N', unit: 'kV' },
    ],
    presets: [
      { name: '110kV线路', values: { U1: 115, U2: 108, U_N: 110 } },
    ],
    calcFn: 'calcFormula13'
  },
  {
    id: 14,
    chapter: 'ch3',
    name: '电压偏移',
    badge: '概念辨析',
    latexFormula: '\\text{电压偏移} = \\frac{U_1 - U_N}{U_N}\\times 100\\%\\;\\text{或}\\;\\frac{U_2 - U_N}{U_N}\\times 100\\%',
    description: '节点实际电压与额定电压的数值差百分比，是电能质量的重要指标。',
    fields: [
      { id: 'U_actual', label: '实际电压 U', unit: 'kV', hint: '始端或末端实际电压' },
      { id: 'U_N', label: '额定电压 U_N', unit: 'kV' },
    ],
    presets: [
      { name: '110kV偏移', values: { U_actual: 115, U_N: 110 } },
    ],
    calcFn: 'calcFormula14'
  },
  {
    id: 15,
    chapter: 'ch3',
    name: '电压调整',
    badge: '概念辨析',
    latexFormula: '\\text{电压调整} = \\frac{U_{20} - U_2}{U_{20}}\\times 100\\%',
    description: '末端空载与负载时电压的数值差百分比。反映负荷变化对末端电压的影响程度。',
    fields: [
      { id: 'U20', label: '空载电压 U₂₀', unit: 'kV' },
      { id: 'U2', label: '负载电压 U₂', unit: 'kV' },
    ],
    presets: [
      { name: '典型算例', values: { U20: 115, U2: 108 } },
    ],
    calcFn: 'calcFormula15'
  },
  {
    id: 16,
    chapter: 'ch3',
    name: '最大负荷利用小时数',
    badge: '经济运行',
    latexFormula: 'T_{\\max} = \\frac{W}{P_{\\max}}',
    description: '一年中负荷消耗的总电能除以最大负荷，反映负荷利用效率。',
    fields: [
      { id: 'W', label: '年电能消耗 W', unit: 'MWh' },
      { id: 'P_max', label: '最大负荷 P_max', unit: 'MW' },
    ],
    presets: [
      { name: '工业用户', values: { W: 35000, P_max: 8 } },
    ],
    calcFn: 'calcFormula16'
  },
  {
    id: 17,
    chapter: 'ch3',
    name: '最大功率损耗时间',
    badge: '经济运行',
    latexFormula: '\\tau = \\frac{\\Delta W}{\\Delta P_{\\max}}',
    description: '全年电能损耗除以最大负荷时的功率损耗，用于年损耗电量计算。',
    fields: [
      { id: 'delta_W', label: '全年电能损耗 ΔW', unit: 'MWh' },
      { id: 'delta_P_max', label: '最大功率损耗 ΔP_max', unit: 'MW' },
    ],
    presets: [
      { name: '典型算例', values: { delta_W: 2400, delta_P_max: 0.6 } },
    ],
    calcFn: 'calcFormula17'
  },
  {
    id: 18,
    chapter: 'ch3',
    name: '年负荷率',
    badge: '经济运行',
    latexFormula: '\\alpha = \\frac{W}{8760 \\cdot P_{\\max}}',
    description: '年平均负荷与最大负荷之比，反映负荷曲线的平坦程度。',
    fields: [
      { id: 'W', label: '年电能消耗 W', unit: 'MWh' },
      { id: 'P_max', label: '最大负荷 P_max', unit: 'MW' },
    ],
    presets: [
      { name: '工业用户', values: { W: 35000, P_max: 8 } },
    ],
    calcFn: 'calcFormula18'
  },
  {
    id: 19,
    chapter: 'ch3',
    name: '年负荷损耗率',
    badge: '经济运行',
    latexFormula: '\\beta = \\frac{\\Delta W}{8760 \\cdot \\Delta P_{\\max}}',
    description: '全年电能损耗与最大功率损耗全年运行的比值。',
    fields: [
      { id: 'delta_W', label: '全年电能损耗 ΔW', unit: 'MWh' },
      { id: 'delta_P_max', label: '最大功率损耗 ΔP_max', unit: 'MW' },
    ],
    presets: [
      { name: '典型算例', values: { delta_W: 2400, delta_P_max: 0.6 } },
    ],
    calcFn: 'calcFormula19'
  },

  // ═══════════ 第四章：变压器损耗与运算负荷 (公式 20-21) ═══════════
  {
    id: 20,
    chapter: 'ch4',
    name: '变压器损耗公式',
    badge: '潮流计算必考',
    latexFormula: '\\Delta P_{0T} = \\frac{P_0}{1000},\\;\\Delta Q_{0T} = \\frac{I_0\\%}{100}S_N,\\;\\Delta P_{kT} = \\frac{P_k}{1000}\\frac{S^2}{S_N^2},\\;\\Delta Q_{kT} = \\frac{U_k\\%}{100}\\frac{S^2}{S_N}',
    description: '等效运算负荷：将变压器励磁空载损耗、负荷率的铜损、线路充电电容综合为节点运算负荷。',
    fields: [
      { id: 'P_L', label: '实际负荷有功 P_L', unit: 'kW', canToggleUnit: true },
      { id: 'Q_L', label: '实际负荷无功 Q_L', unit: 'kVar', canToggleUnit: true },
      { id: 'Qc', label: '充电功率 Qc', unit: 'kVar', canToggleUnit: true, hint: '接在负荷侧的电容充电功率（无则填0）' },
      { id: 'Sn', label: '额定容量 S_N', unit: 'MVA' },
      { id: 'Pk', label: '短路损耗 P_k', unit: 'kW' },
      { id: 'Uk', label: '短路电压 U_k%', unit: '%' },
      { id: 'P0', label: '空载损耗 P_0', unit: 'kW' },
      { id: 'I0', label: '空载电流 I_0%', unit: '%' },
    ],
    presets: [
      { name: '华电811：综合变损与充电电容', values: { P_L: 18000, Q_L: 13500, Qc: 1200, Sn: 25.0, Pk: 135, Uk: 10.5, P0: 25, I0: 0.95 } },
      { name: '轻载工况 (电容无功倒送)', values: { P_L: 4000, Q_L: 2000, Qc: 3500, Sn: 31.5, Pk: 180, Uk: 10.5, P0: 30, I0: 0.8 } },
      { name: '重载工况 (过载损耗加剧)', values: { P_L: 28000, Q_L: 21000, Qc: 1000, Sn: 25.0, Pk: 140, Uk: 10.5, P0: 28, I0: 0.9 } },
    ],
    calcFn: 'calcFormula20'
  },
  {
    id: 21,
    chapter: 'ch4',
    name: '阻抗支路首末端电压关系',
    badge: '核心高频',
    latexFormula: '\\dot{U}_1 = (U_2 + \\Delta U) + j\\delta U,\\quad U_1 = \\sqrt{(U_2+\\Delta U)^2 + (\\delta U)^2}',
    description: '已知一端电压和流过功率，严格求解对端电压的相量关系与数值。含正算和反算两种。',
    fields: [
      { id: 'U', label: '参考端电压', unit: 'kV' },
      { id: 'P_k', label: '有功功率 P', unit: 'kW', canToggleUnit: true },
      { id: 'Q_k', label: '无功功率 Q', unit: 'kVar', canToggleUnit: true },
      { id: 'R', label: '电阻 R', unit: 'Ω' },
      { id: 'X', label: '电抗 X', unit: 'Ω' },
    ],
    presets: [
      { name: '110kV 正算', values: { U: 110, P_k: 24000, Q_k: 18000, R: 12.5, X: 25.0 } },
    ],
    calcFn: 'calcFormula12' // Same calculation as formula 12
  },

  // ═══════════ 第五章：网络潮流分布 (公式 22-29) ═══════════
  {
    id: 22,
    chapter: 'ch5',
    name: '线路空载电压损耗',
    badge: '空载运行',
    latexFormula: '|\\Delta U| = \\frac{1}{2}BXU_2 = \\frac{1}{2}U_2 b_1 x_1 l^2',
    description: '线路空载时因对地电容充电电流流过电抗产生的电压升高。',
    fields: [
      { id: 'U2', label: '末端电压 U₂', unit: 'kV' },
      { id: 'b1', label: '单位电纳 b₁', unit: 'μS/km' },
      { id: 'x1', label: '单位电抗 x₁', unit: 'Ω/km' },
      { id: 'l', label: '线路长度 l', unit: 'km' },
    ],
    presets: [
      { name: '220kV 线路空载', values: { U2: 220, b1: 3.55, x1: 0.335, l: 200 } },
    ],
    calcFn: 'calcFormula22'
  },
  {
    id: 23,
    chapter: 'ch5',
    name: '功率损耗与充电功率',
    badge: '潮流计算必考',
    latexFormula: '\\Delta P = \\frac{P^2+Q^2}{U^2}R,\\quad \\Delta Q = \\frac{P^2+Q^2}{U^2}X,\\quad Q_c = \\frac{1}{2}U^2 B',
    description: '线路串联阻抗消耗的有功与无功损耗，以及对地电纳注入的容性充电功率。',
    fields: [
      { id: 'U', label: '工作电压 U', unit: 'kV' },
      { id: 'P_k', label: '有功 P', unit: 'kW', canToggleUnit: true },
      { id: 'Q_k', label: '无功 Q', unit: 'kVar', canToggleUnit: true },
      { id: 'R', label: '电阻 R', unit: 'Ω' },
      { id: 'X', label: '电抗 X', unit: 'Ω' },
      { id: 'B_u', label: '总电纳 B', unit: 'μS', hint: 'b1 × L' },
    ],
    presets: [
      { name: '陈珩例2-1：220kV损耗', values: { U: 220, P_k: 120000, Q_k: 60000, R: 8.5, X: 28.0, B_u: 58.4 } },
      { name: '110kV空载充电', values: { U: 110, P_k: 0, Q_k: 0, R: 10.2, X: 22.5, B_u: 45.0 } },
    ],
    calcFn: 'calcFormula23'
  },
  {
    id: 24,
    chapter: 'ch5',
    name: '环形网络功率分布',
    badge: '真题压轴手算',
    latexFormula: '\\dot{S}_A = \\frac{\\sum \\dot{S}_i Z_{iB}^*}{Z_\\Sigma^*},\\quad \\dot{S}_B = \\sum \\dot{S}_i - \\dot{S}_A',
    description: '两端供电环形电网解环计算自然功率分布，严格使用复数共轭 Z*。',
    isDynamicNodes: true,
    fields: [
      { id: 'R_sum', label: '环路总电阻 R_Σ', unit: 'Ω' },
      { id: 'X_sum', label: '环路总电抗 X_Σ', unit: 'Ω' },
    ],
    presets: [
      { name: '华电812：三负荷闭环网', values: { R_sum: 20.0, X_sum: 48.0, nodes: [
        { P: 15000, Q: 10000, R_iB: 12.0, X_iB: 28.0 },
        { P: 20000, Q: 15000, R_iB: 6.0, X_iB: 14.0 },
        { P: 10000, Q: 8000, R_iB: 2.0, X_iB: 5.0 },
      ] } },
      { name: '陈珩例3-3：两节点环网', values: { R_sum: 14.0, X_sum: 32.0, nodes: [
        { P: 25000, Q: 18000, R_iB: 8.0, X_iB: 18.0 },
        { P: 18000, Q: 12000, R_iB: 3.5, X_iB: 8.0 },
      ] } },
    ],
    calcFn: 'calcFormula24'
  },
  {
    id: 25,
    chapter: 'ch5',
    name: '循环功率',
    badge: '电网调控核心',
    latexFormula: '\\dot{S}_c = \\frac{\\dot{U}_A(\\dot{U}_A - \\dot{U}_B)^*}{Z_\\Sigma^*}',
    description: '两端电源存在电压幅值差或相角差时，在闭环线路中激发的循环潮流。',
    fields: [
      { id: 'Ua_mag', label: '|U_A|', unit: 'kV' },
      { id: 'Ua_deg', label: '∠U_A', unit: '°' },
      { id: 'Ub_mag', label: '|U_B|', unit: 'kV' },
      { id: 'Ub_deg', label: '∠U_B', unit: '°' },
      { id: 'R_sum', label: 'R_Σ', unit: 'Ω' },
      { id: 'X_sum', label: 'X_Σ', unit: 'Ω' },
    ],
    presets: [
      { name: '幅值差+相角差', values: { Ua_mag: 115, Ua_deg: 0, Ub_mag: 110, Ub_deg: -4.5, R_sum: 6.5, X_sum: 18.0 } },
      { name: '纯相角差', values: { Ua_mag: 110, Ua_deg: 0, Ub_mag: 110, Ub_deg: -6.0, R_sum: 5.0, X_sum: 15.0 } },
    ],
    calcFn: 'calcFormula25'
  },
  {
    id: 26,
    chapter: 'ch5',
    name: '潮流方程 (直角/极坐标)',
    badge: '理论公式',
    latexFormula: 'P_i = U_i\\sum_j U_j(G_{ij}\\cos\\delta_{ij} + B_{ij}\\sin\\delta_{ij}),\\; Q_i = U_i\\sum_j U_j(G_{ij}\\sin\\delta_{ij} - B_{ij}\\cos\\delta_{ij})',
    description: '潮流方程的两种坐标表示。极坐标形式在牛顿-拉夫逊法中更常用。此为理论参考公式。',
    fields: [],
    presets: [],
    calcFn: 'calcFormulaRef'
  },
  {
    id: 27,
    chapter: 'ch5',
    name: '牛拉法修正方程 (直角坐标)',
    badge: '理论公式',
    latexFormula: '\\begin{bmatrix}\\Delta P\\\\\\Delta Q\\\\\\Delta U^2\\end{bmatrix}=\\begin{bmatrix}H&N\\\\J&L\\\\R&S\\end{bmatrix}\\begin{bmatrix}\\Delta f\\\\\\Delta e\\end{bmatrix}',
    description: '牛顿-拉夫逊法直角坐标修正方程，雅可比矩阵元素为功率对电压分量的偏导数。',
    fields: [],
    presets: [],
    calcFn: 'calcFormulaRef'
  },
  {
    id: 28,
    chapter: 'ch5',
    name: '牛拉法修正方程 (极坐标)',
    badge: '理论公式',
    latexFormula: '\\begin{bmatrix}\\Delta P\\\\\\Delta Q\\end{bmatrix}=\\begin{bmatrix}H&N\\\\J&L\\end{bmatrix}\\begin{bmatrix}\\Delta\\delta\\\\\\Delta U/U\\end{bmatrix}',
    description: '牛顿-拉夫逊法极坐标修正方程，更常用于实际计算。',
    fields: [],
    presets: [],
    calcFn: 'calcFormulaRef'
  },
  {
    id: 29,
    chapter: 'ch5',
    name: 'PQ 分解法',
    badge: '理论公式',
    latexFormula: "\\Delta P/U = -B'U\\Delta\\delta,\\quad \\Delta Q/U = -B''\\Delta U",
    description: 'PQ 分解法将有功和无功解耦，大幅减少计算量，适用于高压电网。',
    fields: [],
    presets: [],
    calcFn: 'calcFormulaRef'
  },

  // ═══════════ 第六章：频率调节与功率分配 (公式 30-37) ═══════════
  {
    id: 30,
    chapter: 'ch6',
    name: '发电机单位调节功率',
    badge: '频率调节',
    latexFormula: 'K_G = -\\frac{\\Delta P}{\\Delta f},\\quad K_{G*} = K_G\\frac{f_N}{P_{GN}},\\quad \\sigma\\% = \\frac{1}{K_{G*}}',
    description: '发电机的单位调节功率及调差系数，反映调速器对频率偏差的响应能力。',
    fields: [
      { id: 'P_GN', label: '发电机额定功率 P_GN', unit: 'MW' },
      { id: 'sigma_pct', label: '调差系数 σ%', unit: '%', hint: '典型值 3~5%' },
      { id: 'f_N', label: '额定频率 f_N', unit: 'Hz', hint: '通常50Hz' },
    ],
    presets: [
      { name: '典型300MW机组', values: { P_GN: 300, sigma_pct: 4, f_N: 50 } },
    ],
    calcFn: 'calcFormula30'
  },
  {
    id: 31,
    chapter: 'ch6',
    name: '负荷单位调节功率',
    badge: '频率调节',
    latexFormula: 'K_L = \\frac{\\Delta P}{\\Delta f},\\quad K_{L*} = K_L\\frac{f_N}{P_{LN}}',
    description: '负荷的频率特性，负荷频率调节效应系数 K_L* 通常取 1~3。',
    fields: [
      { id: 'P_LN', label: '负荷额定功率 P_LN', unit: 'MW' },
      { id: 'K_Ls', label: '负荷调节系数 K_L*', unit: 'p.u.', hint: '标幺值，通常1~3' },
      { id: 'f_N', label: '额定频率 f_N', unit: 'Hz' },
    ],
    presets: [
      { name: '典型负荷', values: { P_LN: 500, K_Ls: 2, f_N: 50 } },
    ],
    calcFn: 'calcFormula31'
  },
  {
    id: 32,
    chapter: 'ch6',
    name: '系统单位调节功率',
    badge: '频率调节',
    latexFormula: 'K_S = K_G + K_L',
    description: '系统总的单位调节功率等于发电机和负荷单位调节功率之和。',
    fields: [
      { id: 'K_G', label: '发电机 K_G', unit: 'MW/Hz' },
      { id: 'K_L', label: '负荷 K_L', unit: 'MW/Hz' },
    ],
    presets: [
      { name: '典型系统', values: { K_G: 1500, K_L: 500 } },
    ],
    calcFn: 'calcFormula32'
  },
  {
    id: 33,
    chapter: 'ch6',
    name: '联合系统频率变化',
    badge: '频率调节',
    latexFormula: '\\Delta f = \\frac{(\\Delta P_{LA} - \\Delta P_{GA}) + (\\Delta P_{LB} - \\Delta P_{GB})}{K_A + K_B}',
    description: '两系统联合运行时，负荷突变引起的频率变化量。ΔP 大于零代表负荷增加。',
    fields: [
      { id: 'dPLA', label: '系统A负荷变化 ΔP_LA', unit: 'MW', hint: '正值=负荷增加' },
      { id: 'dPGA', label: '系统A出力变化 ΔP_GA', unit: 'MW' },
      { id: 'dPLB', label: '系统B负荷变化 ΔP_LB', unit: 'MW' },
      { id: 'dPGB', label: '系统B出力变化 ΔP_GB', unit: 'MW' },
      { id: 'K_A', label: '系统A单位调节功率 K_A', unit: 'MW/Hz' },
      { id: 'K_B', label: '系统B单位调节功率 K_B', unit: 'MW/Hz' },
    ],
    presets: [
      { name: '系统A突增负荷100MW', values: { dPLA: 100, dPGA: 0, dPLB: 0, dPGB: 0, K_A: 1500, K_B: 1000 } },
    ],
    calcFn: 'calcFormula33'
  },
  {
    id: 34,
    chapter: 'ch6',
    name: '联合系统联络线功率',
    badge: '频率调节',
    latexFormula: '\\Delta P_{AB} = \\frac{K_A(\\Delta P_{LB}-\\Delta P_{GB}) - K_B(\\Delta P_{LA}-\\Delta P_{GA})}{K_A+K_B}',
    description: '联络线上功率变化量，正值表示A向B送电增加。',
    fields: [
      { id: 'dPLA', label: 'ΔP_LA', unit: 'MW' },
      { id: 'dPGA', label: 'ΔP_GA', unit: 'MW' },
      { id: 'dPLB', label: 'ΔP_LB', unit: 'MW' },
      { id: 'dPGB', label: 'ΔP_GB', unit: 'MW' },
      { id: 'K_A', label: 'K_A', unit: 'MW/Hz' },
      { id: 'K_B', label: 'K_B', unit: 'MW/Hz' },
    ],
    presets: [
      { name: '系统A突增负荷100MW', values: { dPLA: 100, dPGA: 0, dPLB: 0, dPGB: 0, K_A: 1500, K_B: 1000 } },
    ],
    calcFn: 'calcFormula34'
  },
  {
    id: 35,
    chapter: 'ch6',
    name: '有功最优分配 (等耗量微增率)',
    badge: '经济调度',
    latexFormula: '\\frac{dF_i}{dP_{Gi}} \\cdot \\frac{1}{1-\\frac{\\partial\\Delta P_\\Sigma}{\\partial P_{Gi}}} = \\lambda',
    description: '有功功率负荷的最优经济分配原则：考虑网损时，各机组等耗量微增率相等。',
    fields: [],
    presets: [],
    calcFn: 'calcFormulaRef'
  },
  {
    id: 36,
    chapter: 'ch6',
    name: '水火电最优分配',
    badge: '经济调度',
    latexFormula: '\\frac{\\partial F}{\\partial P_{T1}} = \\gamma_2 \\frac{\\partial W_2}{\\partial P_{H2}},\\quad \\gamma_2 = \\frac{dF_1}{dW_2}',
    description: '水火电联合运行时，通过水煤换算系数 γ 建立统一的经济调度准则。',
    fields: [],
    presets: [],
    calcFn: 'calcFormulaRef'
  },
  {
    id: 37,
    chapter: 'ch6',
    name: '无功最优分布',
    badge: '经济调度',
    latexFormula: '\\frac{\\partial\\Delta P_\\Sigma}{\\partial Q_{Gi}}\\cdot\\frac{1}{1-\\frac{\\partial\\Delta Q_\\Sigma}{\\partial Q_{Gi}}} = \\lambda',
    description: '无功电源的最优分布原则：等网损微增率。',
    fields: [],
    presets: [],
    calcFn: 'calcFormulaRef'
  },

  // ═══════════ 第七章：调压与补偿 (公式 38) ═══════════
  {
    id: 38,
    chapter: 'ch7',
    name: '组合调压 · 补偿容量',
    badge: '调压计算',
    latexFormula: "Q_C = \\frac{k^2 U'_{i\\max}}{X}\\left(U'_{i\\max} - \\frac{U_{i\\max}}{k}\\right)",
    description: '变压器分接头与补偿设备联合调压。先确定变比 k，再求补偿容量 Qc。',
    fields: [
      { id: 'Ui_max_prime', label: "高压侧归算最大电压 U'_imax", unit: 'kV' },
      { id: 'Ui_min_prime', label: "高压侧归算最小电压 U'_imin", unit: 'kV' },
      { id: 'Ui_max', label: '实际最大电压 U_imax', unit: 'kV' },
      { id: 'Ui_min', label: '实际最小电压 U_imin', unit: 'kV' },
      { id: 'X_line', label: '线路电抗 X', unit: 'Ω' },
    ],
    presets: [
      { name: '典型调压算例', values: { Ui_max_prime: 118, Ui_min_prime: 112, Ui_max: 115, Ui_min: 105, X_line: 30 } },
    ],
    calcFn: 'calcFormula38'
  },

  // ═══════════ 第八章：短路计算 (公式 39-47) ═══════════
  {
    id: 39,
    chapter: 'ch8',
    name: '短路功率 (容量)',
    badge: '短路基础',
    latexFormula: 'S_k = \\sqrt{3} U_{av} I_k,\\quad S_{k*} = I_{k*}',
    description: '短路功率的有名值和标幺值。标幺值下短路功率等于短路电流标幺值。',
    fields: [
      { id: 'U_av', label: '平均电压 U_av', unit: 'kV', hint: '故障点所在电压级平均额定电压' },
      { id: 'I_k', label: '短路电流 I_k', unit: 'kA' },
    ],
    presets: [
      { name: '110kV母线短路', values: { U_av: 115, I_k: 12.5 } },
    ],
    calcFn: 'calcFormula39'
  },
  {
    id: 40,
    chapter: 'ch8',
    name: '冲击电流',
    badge: '短路基础',
    latexFormula: 'i_{sh} = \\sqrt{2} K_M I_k,\\quad I_{sh} = I_k\\sqrt{1+2(K_M-1)^2}',
    description: '冲击电流为短路后第一个半波最大瞬时值。K_M 为冲击系数，通常取 1.8。',
    fields: [
      { id: 'I_k', label: '短路电流有效值 I_k', unit: 'kA' },
      { id: 'K_M', label: '冲击系数 K_M', unit: '', hint: '通常取 1.8' },
    ],
    presets: [
      { name: '典型算例 (K_M=1.8)', values: { I_k: 12.5, K_M: 1.8 } },
    ],
    calcFn: 'calcFormula40'
  },
  {
    id: 41,
    chapter: 'ch8',
    name: '对称分量法变换矩阵',
    badge: '不对称短路',
    latexFormula: '\\begin{bmatrix}\\dot{F}_a\\\\\\dot{F}_b\\\\\\dot{F}_c\\end{bmatrix}=\\begin{bmatrix}1&1&1\\\\a^2&a&1\\\\a&a^2&1\\end{bmatrix}\\begin{bmatrix}\\dot{F}_{a(1)}\\\\\\dot{F}_{a(2)}\\\\\\dot{F}_{a(0)}\\end{bmatrix}',
    description: '对称分量法将不对称三相量分解为正序、负序、零序三组对称分量。a = e^(j120°)。',
    fields: [
      { id: 'Fa_mag', label: 'A相幅值', unit: 'kA或kV' },
      { id: 'Fa_deg', label: 'A相角度', unit: '°' },
      { id: 'Fb_mag', label: 'B相幅值', unit: 'kA或kV' },
      { id: 'Fb_deg', label: 'B相角度', unit: '°' },
      { id: 'Fc_mag', label: 'C相幅值', unit: 'kA或kV' },
      { id: 'Fc_deg', label: 'C相角度', unit: '°' },
    ],
    presets: [
      { name: 'A相接地示例', values: { Fa_mag: 0, Fa_deg: 0, Fb_mag: 1.0, Fb_deg: -120, Fc_mag: 1.0, Fc_deg: 120 } },
    ],
    calcFn: 'calcFormula41'
  },
  {
    id: 42,
    chapter: 'ch8',
    name: '不对称故障序网方程',
    badge: '不对称短路',
    latexFormula: '\\dot{U}_{f(1)}=E_{f|0|}-jx_{\\Sigma(1)}\\dot{I}_{f(1)},\\; \\dot{U}_{f(2)}=-jx_{\\Sigma(2)}\\dot{I}_{f(2)},\\; \\dot{U}_{f(0)}=-jx_{\\Sigma(0)}\\dot{I}_{f(0)}',
    description: '不对称故障点正序、负序、零序的电压与电流关系方程。',
    fields: [],
    presets: [],
    calcFn: 'calcFormulaRef'
  },
  {
    id: 43,
    chapter: 'ch8',
    name: 'A相接地短路 f⁽¹⁾',
    badge: '不对称短路',
    latexFormula: '\\dot{I}_{f(1)}=\\dot{I}_{f(2)}=\\dot{I}_{f(0)}=\\frac{E_{f|0|}}{j(x_{\\Sigma(1)}+x_{\\Sigma(2)}+x_{\\Sigma(0)})}',
    description: 'A相接地短路（单相短路）：三个序网串联。相边界：Ib=Ic=0, Ua=0。',
    fields: [
      { id: 'Ef0', label: '故障前电压 E_f|0|', unit: 'p.u.', hint: '标幺值，通常取1.0' },
      { id: 'x1', label: '正序电抗 x_Σ(1)', unit: 'p.u.' },
      { id: 'x2', label: '负序电抗 x_Σ(2)', unit: 'p.u.' },
      { id: 'x0', label: '零序电抗 x_Σ(0)', unit: 'p.u.' },
    ],
    presets: [
      { name: '典型单相接地', values: { Ef0: 1.0, x1: 0.2, x2: 0.2, x0: 0.1 } },
    ],
    calcFn: 'calcFormula43'
  },
  {
    id: 44,
    chapter: 'ch8',
    name: 'BC相短路 f⁽²⁾',
    badge: '不对称短路',
    latexFormula: '\\dot{I}_{f(1)} = -\\dot{I}_{f(2)} = \\frac{E_{f|0|}}{j(x_{\\Sigma(1)}+x_{\\Sigma(2)})}',
    description: '两相短路（相间短路）：正序和负序串联。Ia=0, Ib=-Ic, Ub=Uc。',
    fields: [
      { id: 'Ef0', label: 'E_f|0|', unit: 'p.u.' },
      { id: 'x1', label: 'x_Σ(1)', unit: 'p.u.' },
      { id: 'x2', label: 'x_Σ(2)', unit: 'p.u.' },
    ],
    presets: [
      { name: '典型两相短路', values: { Ef0: 1.0, x1: 0.2, x2: 0.2 } },
    ],
    calcFn: 'calcFormula44'
  },
  {
    id: 45,
    chapter: 'ch8',
    name: 'BC相接地短路 f⁽¹·¹⁾',
    badge: '不对称短路',
    latexFormula: '\\dot{I}_{f(1)}+\\dot{I}_{f(2)}+\\dot{I}_{f(0)}=0,\\quad \\dot{U}_{f(1)}=\\dot{U}_{f(2)}=\\dot{U}_{f(0)}',
    description: '两相接地短路：负序和零序并联后再与正序串联。Ia=0, Ub=Uc=0。',
    fields: [
      { id: 'Ef0', label: 'E_f|0|', unit: 'p.u.' },
      { id: 'x1', label: 'x_Σ(1)', unit: 'p.u.' },
      { id: 'x2', label: 'x_Σ(2)', unit: 'p.u.' },
      { id: 'x0', label: 'x_Σ(0)', unit: 'p.u.' },
    ],
    presets: [
      { name: '典型两相接地', values: { Ef0: 1.0, x1: 0.2, x2: 0.2, x0: 0.1 } },
    ],
    calcFn: 'calcFormula45'
  },
  {
    id: 46,
    chapter: 'ch8',
    name: '变压器序分量相位变换',
    badge: '不对称短路',
    latexFormula: '\\dot{U}_{a1}=\\dot{U}_{A1}e^{-jN30°},\\quad \\dot{U}_{a2}=\\dot{U}_{A2}e^{jN30°}',
    description: 'Yy-N 或 Yd-N 联结组变压器中，正序量落后 N×30°，负序量超前 N×30°。',
    fields: [
      { id: 'UA1_mag', label: '高压侧正序幅值', unit: 'kV或kA' },
      { id: 'UA1_deg', label: '高压侧正序相角', unit: '°' },
      { id: 'N_group', label: '联结组号 N', unit: '', hint: '如 Yd11 则 N=11' },
    ],
    presets: [
      { name: 'Yd11 变压器', values: { UA1_mag: 1.0, UA1_deg: 0, N_group: 11 } },
    ],
    calcFn: 'calcFormula46'
  },
  {
    id: 47,
    chapter: 'ch8',
    name: '正序等效定则',
    badge: '综合短路',
    latexFormula: 'I_f = M\\frac{E_{f|0|}}{x_{\\Sigma(1)}+x_\\Delta}',
    description: '将各种不对称短路统一为"正序等效定则"的形式。不同故障类型有不同的 xΔ 和 M 值。',
    fields: [
      { id: 'Ef0', label: '故障前电压 E_f|0|', unit: 'p.u.' },
      { id: 'x1', label: '正序电抗 x_Σ(1)', unit: 'p.u.' },
      { id: 'x2', label: '负序电抗 x_Σ(2)', unit: 'p.u.' },
      { id: 'x0', label: '零序电抗 x_Σ(0)', unit: 'p.u.' },
      { id: 'zf', label: '故障点过渡阻抗 z_f', unit: 'p.u.', hint: '金属性短路填0' },
      { id: 'fault_type', label: '故障类型', type: 'select', options: [
        { value: 'f3', text: 'f⁽³⁾ 三相短路' },
        { value: 'f1', text: 'f⁽¹⁾ 单相接地' },
        { value: 'f2', text: 'f⁽²⁾ 两相短路' },
        { value: 'f11', text: 'f⁽¹·¹⁾ 两相接地' },
      ] },
    ],
    presets: [
      { name: '三相短路', values: { Ef0: 1.0, x1: 0.2, x2: 0.2, x0: 0.1, zf: 0, fault_type: 'f3' } },
      { name: '单相接地短路', values: { Ef0: 1.0, x1: 0.2, x2: 0.2, x0: 0.1, zf: 0, fault_type: 'f1' } },
      { name: '两相短路', values: { Ef0: 1.0, x1: 0.2, x2: 0.2, x0: 0.1, zf: 0, fault_type: 'f2' } },
      { name: '两相接地短路', values: { Ef0: 1.0, x1: 0.2, x2: 0.2, x0: 0.1, zf: 0, fault_type: 'f11' } },
    ],
    calcFn: 'calcFormula47'
  },
];
