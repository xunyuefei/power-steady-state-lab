/**
 * 9大模块配置元数据、考研经典真题多算例库与严格 LaTeX 公式
 */

export const MODULES = [
  {
    id: 1,
    name: "模块1：电压降落与损耗",
    shortName: "电压降落",
    icon: "⚡",
    badge: "基础高频",
    latexFormula: "\\Delta U = \\frac{PR + QX}{U}, \\quad \\delta U = \\frac{PX - QR}{U}, \\quad \\dot{U}_1 = (U_2 + \\Delta U) + j\\delta U",
    description: "针对已知一端电压与流过功率，精确求解电压降落纵分量、横分量、相角偏移及对端实际综合电压。",
    presets: [
      {
        name: "华电 811 真题：110kV 重负荷单回线路",
        values: { U: 110, P_k: 24000, Q_k: 18000, R: 12.5, X: 25.0 }
      },
      {
        name: "陈珩《电力系统稳态分析》例 2-2：已知末端求首端电压",
        values: { U: 110, P_k: 16000, Q_k: 12000, R: 8.4, X: 16.8 }
      },
      {
        name: "特高压 500kV 远距离输电大潮流算例",
        values: { U: 500, P_k: 650000, Q_k: 220000, R: 7.2, X: 45.0 }
      }
    ],
    fields: [
      { id: "U", label: "参考端基准电压", unit: "kV", hint: "常为首端或末端已知母线额定/实际电压" },
      { id: "P_k", label: "流过有功功率 P", unit: "kW", canToggleUnit: true, hint: "输电断面有功负荷（支持一键切换 kW/MW）" },
      { id: "Q_k", label: "流过无功功率 Q", unit: "kVar", canToggleUnit: true, hint: "输电断面感性无功（支持一键切换 kVar/MVar）" },
      { id: "R", label: "线路阻抗实部 R", unit: "Ω", hint: "电阻全值 R = r1 × L" },
      { id: "X", label: "线路阻抗虚部 X", unit: "Ω", hint: "感抗全值 X = x1 × L" }
    ]
  },
  {
    id: 2,
    name: "模块2：线路损耗与充电功率",
    shortName: "功率损耗与充电",
    icon: "🔥",
    badge: "潮流计算必考",
    latexFormula: "\\Delta P = \\frac{P^2 + Q^2}{U^2} R, \\quad \\Delta Q = \\frac{P^2 + Q^2}{U^2} X, \\quad Q_c = \\frac{1}{2} U^2 B",
    description: "计算高压输电线路串联阻抗消耗的有功与感性无功，以及线路对地电纳向系统注入的容性充电功率。",
    presets: [
      {
        name: "陈珩《电力系统稳态分析》例 2-1：220kV 输电线路损耗",
        values: { U: 220, P_k: 120000, Q_k: 60000, R: 8.5, X: 28.0, B_u: 58.4 }
      },
      {
        name: "华电期末考试题：110kV 架空线路空载充电功率",
        values: { U: 110, P_k: 0, Q_k: 0, R: 10.2, X: 22.5, B_u: 45.0 }
      },
      {
        name: "轻负荷线路超发充电无功（电压抬升考题）",
        values: { U: 220, P_k: 30000, Q_k: 10000, R: 12.0, X: 35.0, B_u: 82.0 }
      }
    ],
    fields: [
      { id: "U", label: "节点工作电压 U", unit: "kV", hint: "该计算断面对应的实际工作电压" },
      { id: "P_k", label: "流过断面有功 P", unit: "kW", canToggleUnit: true, hint: "流过阻抗支路的有功" },
      { id: "Q_k", label: "流过断面无功 Q", unit: "kVar", canToggleUnit: true, hint: "流过阻抗支路的无功" },
      { id: "R", label: "线路总电阻 R", unit: "Ω", hint: "线路全长串联电阻" },
      { id: "X", label: "线路总电抗 X", unit: "Ω", hint: "线路全长串联电抗" },
      { id: "B_u", label: "线路对地总电纳 B", unit: "μS", hint: "微西门子 μS = b1 × L" }
    ]
  },
  {
    id: 3,
    name: "模块3：多节点环网功率分布与分界点",
    shortName: "环网潮流分布",
    icon: "🔄",
    badge: "真题压轴手算",
    latexFormula: "\\dot{S}_A = \\frac{\\sum_{i=1}^n \\dot{S}_i \\cdot Z_{iB}^*}{Z_{\\Sigma}^*}, \\quad \\dot{S}_B = \\sum \\dot{S}_i - \\dot{S}_A",
    description: "两端供电环形电网解环计算自然功率分布。底层严格调用复数共轭 Z*，自动推演逐段潮流并智能锁定【有功/无功分界点】。",
    isDynamicNodes: true,
    presets: [
      {
        name: "华电 812 考研真题：三负荷两端供电经典闭环网",
        values: {
          R_sum: 20.0,
          X_sum: 48.0,
          nodes: [
            { P: 15000, Q: 10000, R_iB: 12.0, X_iB: 28.0 },
            { P: 20000, Q: 15000, R_iB: 6.0, X_iB: 14.0 },
            { P: 10000, Q: 8000, R_iB: 2.0, X_iB: 5.0 }
          ]
        }
      },
      {
        name: "陈珩教材例题 3-3：两节点简单环网功率分界",
        values: {
          R_sum: 14.0,
          X_sum: 32.0,
          nodes: [
            { P: 25000, Q: 18000, R_iB: 8.0, X_iB: 18.0 },
            { P: 18000, Q: 12000, R_iB: 3.5, X_iB: 8.0 }
          ]
        }
      },
      {
        name: "大容量四负荷环网极限考查例题",
        values: {
          R_sum: 28.0,
          X_sum: 64.0,
          nodes: [
            { P: 12000, Q: 8000, R_iB: 21.0, X_iB: 48.0 },
            { P: 18000, Q: 12000, R_iB: 14.0, X_iB: 32.0 },
            { P: 24000, Q: 16000, R_iB: 7.0, X_iB: 16.0 },
            { P: 15000, Q: 10000, R_iB: 2.0, X_iB: 4.5 }
          ]
        }
      }
    ],
    fields: [
      { id: "R_sum", label: "环路全网总电阻 R_Σ", unit: "Ω", hint: "环形回路中所有线路电阻之和" },
      { id: "X_sum", label: "环路全网总电抗 X_Σ", unit: "Ω", hint: "环形回路中所有线路电抗之和" }
    ]
  },
  {
    id: 4,
    name: "模块4：两端供电循环功率",
    shortName: "循环功率",
    icon: "🔀",
    badge: "电网调控核心",
    latexFormula: "\\dot{S}_c = \\frac{\\dot{U}_A (\\dot{U}_A - \\dot{U}_B)^*}{Z_{\\Sigma}^*}",
    description: "当两端电源存在电压幅值差或相角差时，在闭环线路中激发的循环潮流分析与流向判别。",
    presets: [
      {
        name: "稳态课后经典题：幅值差 5kV 伴随 4.5° 相角差",
        values: { Ua_mag: 115, Ua_deg: 0, Ub_mag: 110, Ub_deg: -4.5, R_sum: 6.5, X_sum: 18.0 }
      },
      {
        name: "同幅值不同相角（纯相角差引发有功循环）",
        values: { Ua_mag: 110, Ua_deg: 0, Ub_mag: 110, Ub_deg: -6.0, R_sum: 5.0, X_sum: 15.0 }
      },
      {
        name: "同相角不同幅值（纯幅值差引发无功循环）",
        values: { Ua_mag: 118, Ua_deg: 0, Ub_mag: 110, Ub_deg: 0, R_sum: 4.0, X_sum: 16.0 }
      }
    ],
    fields: [
      { id: "Ua_mag", label: "A端电压幅值 |Ua|", unit: "kV", hint: "母线A实际电压" },
      { id: "Ua_deg", label: "A端电压相角 ∠Ua", unit: "°", hint: "参考相角（通常设为 0°）" },
      { id: "Ub_mag", label: "B端电压幅值 |Ub|", unit: "kV", hint: "母线B实际电压" },
      { id: "Ub_deg", label: "B端电压相角 ∠Ub", unit: "°", hint: "相角提前为正，滞后为负" },
      { id: "R_sum", label: "回路总电阻 R_Σ", unit: "Ω", hint: "阻抗回路电阻" },
      { id: "X_sum", label: "回路总电抗 X_Σ", unit: "Ω", hint: "阻抗回路电抗" }
    ]
  },
  {
    id: 5,
    name: "模块5：自然功率与波阻抗",
    shortName: "自然功率",
    icon: "🌊",
    badge: "超高压理论",
    latexFormula: "S_n = \\frac{U^2}{Z_c^*}, \\quad Z_c = \\sqrt{\\frac{z_1}{y_1}}",
    description: "超高压/特高压交流长线路的波阻抗特性与自然功率，判定线路处于发容性还是感性无功状态。",
    presets: [
      {
        name: "500kV 线路标准算例 (Zc = 400Ω)",
        values: { U: 500, Rc: 400, Xc: 0 }
      },
      {
        name: "220kV 架空单导线线路 (Zc = 380Ω)",
        values: { U: 220, Rc: 380, Xc: 0 }
      },
      {
        name: "电缆线路算例 (低波阻抗特性 Zc = 50Ω)",
        values: { U: 110, Rc: 50, Xc: 0 }
      }
    ],
    fields: [
      { id: "U", label: "线路额定电压 U", unit: "kV", hint: "500kV / 220kV 等" },
      { id: "Rc", label: "波阻抗实部 Rc", unit: "Ω", hint: "通常架空线约为 250~400 Ω" },
      { id: "Xc", label: "波阻抗虚部 Xc", unit: "Ω", hint: "架空线路无损耗近似时通常填 0" }
    ]
  },
  {
    id: 6,
    name: "模块6：双绕组变压器铭牌参数",
    shortName: "双绕组变压器",
    icon: "⚙️",
    badge: "设备建模必考",
    latexFormula: "R_T = \\frac{P_k U_N^2}{1000 S_N^2}, \\quad X_T = \\frac{U_k\\% U_N^2}{100 S_N}, \\quad G_T = \\frac{P_0}{1000 U_N^2}, \\quad B_T = \\frac{I_0\\% S_N}{100 U_N^2}",
    description: "依据制造厂出厂短路试验（Pk, Uk%）与空载试验（P0, I0%）铭牌，求取归算至指定电压侧的等效阻抗与励磁导纳。",
    presets: [
      {
        name: "华电期末经典：SFL1-31500/110 双绕组主变",
        values: { Sn: 31.5, Un: 110, Pk: 180, Uk: 10.5, P0: 32, I0: 0.8 }
      },
      {
        name: "大型发电厂主变：SFP-240000/220",
        values: { Sn: 240, Un: 242, Pk: 650, Uk: 14.0, P0: 160, I0: 0.45 }
      },
      {
        name: "配电网典型变压器：S11-1000/10",
        values: { Sn: 1.0, Un: 10, Pk: 10.3, Uk: 4.5, P0: 1.15, I0: 1.1 }
      }
    ],
    fields: [
      { id: "Sn", label: "变压器额定容量 Sn", unit: "MVA", hint: "如 31.5 MVA" },
      { id: "Un", label: "待归算侧额定电压 Un", unit: "kV", hint: "如归算至高压侧填 110 或 121" },
      { id: "Pk", label: "铭牌短路损耗 Pk", unit: "kW", hint: "铜耗" },
      { id: "Uk", label: "短路电压百分比 Uk%", unit: "%", hint: "如 10.5%" },
      { id: "P0", label: "铭牌空载损耗 P0", unit: "kW", hint: "铁耗" },
      { id: "I0", label: "空载电流百分比 I0%", unit: "%", hint: "励磁电流百分比 如 0.8%" }
    ]
  },
  {
    id: 7,
    name: "模块7：等效运算负荷",
    shortName: "等效运算负荷",
    icon: "📊",
    badge: "潮流前置核心",
    latexFormula: "\\dot{S}' = (P_L + \\Delta P_0 + \\Delta P_k \\beta^2) + j(Q_L + \\Delta Q_0 + \\Delta Q_k \\beta^2 - Q_c)",
    description: "将变电站出线实际用电负荷、变压器励磁空载损耗、负荷率平方换算的铜损，以及线路对地充电电容综合归算为节点运算负荷。",
    presets: [
      {
        name: "华电 811 考研真题：综合变损与对地充电电容",
        values: { P_L: 18000, Q_L: 13500, Qc: 1200, Sn: 25.0, Pk: 135, Uk: 10.5, P0: 25, I0: 0.95 }
      },
      {
        name: "轻载工况运算负荷（电容无功倒送校验）",
        values: { P_L: 4000, Q_L: 2000, Qc: 3500, Sn: 31.5, Pk: 180, Uk: 10.5, P0: 30, I0: 0.8 }
      },
      {
        name: "重载工况运算负荷（变压器过载损耗加剧）",
        values: { P_L: 28000, Q_L: 21000, Qc: 1000, Sn: 25.0, Pk: 140, Uk: 10.5, P0: 28, I0: 0.9 }
      }
    ],
    fields: [
      { id: "P_L", label: "实际负荷有功 P_L", unit: "kW", canToggleUnit: true, hint: "末端负载有功" },
      { id: "Q_L", label: "实际负荷无功 Q_L", unit: "kVar", canToggleUnit: true, hint: "末端负载感性无功" },
      { id: "Qc", label: "单侧对地充电功率 Qc", unit: "kVar", canToggleUnit: true, hint: "接在负荷侧的电容充电功率（无则填 0）" },
      { id: "Sn", label: "变压器额定容量 Sn", unit: "MVA", hint: "主变额定容量" },
      { id: "Pk", label: "铭牌短路损耗 Pk", unit: "kW", hint: "额定负载下铜耗" },
      { id: "Uk", label: "铭牌短路电压 Uk%", unit: "%", hint: "额定短路电压百分比" },
      { id: "P0", label: "铭牌空载损耗 P0", unit: "kW", hint: "额定电压下铁耗" },
      { id: "I0", label: "铭牌空载电流 I0%", unit: "%", hint: "励磁电流百分比" }
    ]
  },
  {
    id: 8,
    name: "模块8：三绕组变压器参数计算",
    shortName: "三绕组变压器",
    icon: "🔺",
    badge: "考研高难度压轴",
    latexFormula: "P_{k,ij}' = P_{k,ij} \\left(\\frac{S_N}{S_{test,ij}}\\right)^2, \\quad P_{k1} = \\frac{1}{2}(P_{k12}' + P_{k13}' - P_{k23}'), \\quad R_1 = \\frac{P_{k1} U_N^2}{1000 S_N^2}",
    description: "严格实现容量比非 100/100/100 时的铜耗平方归算，短路电压换算，星形等效解耦，以及对负电抗物理本质的提示。",
    presets: [
      {
        name: "华电 811 经典真题：容量比 100/100/50 变压器",
        values: {
          Sn: 120, Un: 220, uk_flag: "0",
          S_12: 120, Pk12: 520, Uk12: 14.5,
          S_13: 60,  Pk13: 280, Uk13: 24.0,
          S_23: 60,  Pk23: 220, Uk23: 8.5
        }
      },
      {
        name: "经典负电抗考题：容量比 100/50/100 (中间绕组 X2 < 0)",
        values: {
          Sn: 90, Un: 220, uk_flag: "0",
          S_12: 45, Pk12: 360, Uk12: 10.5,
          S_13: 90, Pk13: 450, Uk13: 18.0,
          S_23: 45, Pk23: 210, Uk23: 6.5
        }
      },
      {
        name: "全额定容量三绕组：容量比 100/100/100",
        values: {
          Sn: 63, Un: 110, uk_flag: "0",
          S_12: 63, Pk12: 310, Uk12: 10.5,
          S_13: 63, Pk13: 340, Uk13: 17.5,
          S_23: 63, Pk23: 290, Uk23: 6.5
        }
      }
    ],
    fields: [
      { id: "Sn", label: "变压器基准额定容量 Sn", unit: "MVA", hint: "通常为最大绕组额定容量（如 120 MVA）" },
      { id: "Un", label: "计算侧额定电压 Un", unit: "kV", hint: "归算侧电压，如高压侧 220 kV" },
      {
        id: "uk_flag",
        label: "Uk(%) 是否需要按容量归算？",
        type: "select",
        options: [
          { value: "0", text: "已按规定归算至额定容量 Sn (国标/真题最常见)" },
          { value: "1", text: "未归算，需要乘以 (Sn / S_test) 归算" }
        ],
        hint: "按题目明确说明选择"
      },
      { id: "S_12", label: "1-2 绕组试验容量 S12", unit: "MVA", hint: "一般等于 min(S1, S2)" },
      { id: "Pk12", label: "1-2 绕组短路损耗 Pk12", unit: "kW", hint: "1-2 短路损耗" },
      { id: "Uk12", label: "1-2 绕组短路电压 Uk12", unit: "%", hint: "短路百分比" },

      { id: "S_13", label: "1-3 绕组试验容量 S13", unit: "MVA", hint: "一般等于 min(S1, S3)" },
      { id: "Pk13", label: "1-3 绕组短路损耗 Pk13", unit: "kW", hint: "1-3 短路损耗" },
      { id: "Uk13", label: "1-3 绕组短路电压 Uk13", unit: "%", hint: "短路百分比" },

      { id: "S_23", label: "2-3 绕组试验容量 S23", unit: "MVA", hint: "一般等于 min(S2, S3)" },
      { id: "Pk23", label: "2-3 绕组短路损耗 Pk23", unit: "kW", hint: "2-3 短路损耗" },
      { id: "Uk23", label: "2-3 绕组短路电压 Uk23", unit: "%", hint: "短路百分比" }
    ]
  },
  {
    id: 9,
    name: "模块9：输电线路参数与等效电路",
    shortName: "线路参数与π模型",
    icon: "📐",
    badge: "几何尺寸推导",
    latexFormula: "x_1 = 0.1445 \\lg\\left(\\frac{D_{eq}}{r_{eq}}\\right) + \\frac{0.0157}{n}, \\quad b_1 = \\frac{7.58}{\\lg(D_{eq}/r_{eq})}",
    description: "提供已知单位长度参数直接集中化，或已知几何均距 Deq、导线半径与分裂间距推导 x1 与 b1 的双重解算模式。",
    subModes: [
      { id: "1", title: "模式 1：已知单位长度参数 (r1, x1, b1) 求集中 π 型" },
      { id: "2", title: "模式 2：已知几何尺寸 (Deq, r, n, d) 理论推导 x1, b1" }
    ],
    presets: [
      {
        name: "500kV 4分裂 LGJ-400 导线参数计算",
        submode: "2",
        valuesMode2: { Deq: 10.5, r: 13.5, n: 4, d: 450 },
        valuesMode1: { L: 120, r1: 0.038, x1: 0.285, b1: 4.12, g1: 0 }
      },
      {
        name: "220kV 2分裂导线典型工程算例",
        submode: "2",
        valuesMode2: { Deq: 7.0, r: 10.8, n: 2, d: 400 },
        valuesMode1: { L: 80, r1: 0.082, x1: 0.335, b1: 3.55, g1: 0 }
      },
      {
        name: "110kV 单导线架空线路集中 π 型计算",
        submode: "1",
        valuesMode1: { L: 60, r1: 0.17, x1: 0.40, b1: 2.75, g1: 0 },
        valuesMode2: { Deq: 4.5, r: 8.5, n: 1, d: 0 }
      }
    ],
    fieldsMode1: [
      { id: "L", label: "线路全长 L", unit: "km", hint: "线路几何总长度" },
      { id: "r1", label: "单位电阻 r1", unit: "Ω/km", hint: "常温直流/交流单位电阻" },
      { id: "x1", label: "单位电抗 x1", unit: "Ω/km", hint: "每公里正序电抗" },
      { id: "b1", label: "单位电纳 b1", unit: "μS/km", hint: "每公里正序电纳" },
      { id: "g1", label: "单位电导 g1", unit: "μS/km", hint: "电晕损耗导纳（无则填 0）" }
    ],
    fieldsMode2: [
      { id: "Deq", label: "相间几何均距 Deq", unit: "m", hint: "三相水平或三角排列均距 ³√(Dab·Dbc·Dca) (单位: 米)" },
      { id: "r", label: "单根导线实际外半径 r", unit: "mm", hint: "外径一半 (单位: 毫米)" },
      { id: "n", label: "每相分裂导线根数 n", unit: "根", hint: "单导线填 1，2分裂填 2，4分裂填 4" },
      { id: "d", label: "分裂导线间距 d", unit: "mm", hint: "若单导线填 0，分裂导线如 400~500mm" }
    ]
  }
];
