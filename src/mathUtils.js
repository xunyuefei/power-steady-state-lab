/**
 * 电力系统稳态分析 - 复数与数学核心库
 * 包含针对电力系统考研手算量纲转换、共轭运算、向量相角处理
 */

export class Complex {
  constructor(re = 0, im = 0) {
    this.re = Number(re) || 0;
    this.im = Number(im) || 0;
  }

  static fromRect(re, im) {
    return new Complex(re, im);
  }

  static fromPolar(r, thetaDeg) {
    const rad = (thetaDeg * Math.PI) / 180;
    return new Complex(r * Math.cos(rad), r * Math.sin(rad));
  }

  add(other) {
    return new Complex(this.re + other.re, this.im + other.im);
  }

  sub(other) {
    return new Complex(this.re - other.re, this.im - other.im);
  }

  mul(other) {
    return new Complex(
      this.re * other.re - this.im * other.im,
      this.re * other.im + this.im * other.re
    );
  }

  mulScalar(scalar) {
    return new Complex(this.re * scalar, this.im * scalar);
  }

  div(other) {
    const denom = other.re * other.re + other.im * other.im;
    if (denom === 0) {
      throw new Error("除零错误：分母阻抗模长为0");
    }
    return new Complex(
      (this.re * other.re + this.im * other.im) / denom,
      (this.im * other.re - this.re * other.im) / denom
    );
  }

  // 共轭复数 Z*
  conj() {
    return new Complex(this.re, -this.im);
  }

  // 模长
  mag() {
    return Math.hypot(this.re, this.im);
  }

  // 相角 (角度制 deg)
  deg() {
    return (Math.atan2(this.im, this.re) * 180) / Math.PI;
  }

  // 格式化输出 a + j b 或 a - j b
  toString(digits = 4) {
    const sign = this.im >= 0 ? "+" : "-";
    return `${this.re.toFixed(digits)} ${sign} j${Math.abs(this.im).toFixed(digits)}`;
  }

  // 极坐标形式输出 r ∠ θ°
  toPolarString(digits = 4) {
    return `${this.mag().toFixed(digits)} ∠ ${this.deg().toFixed(digits)}°`;
  }
}

/**
 * 格式化辅助
 */
export function round(val, digits = 4) {
  if (isNaN(val) || val === null || val === undefined) return "0.0000";
  return Number(val).toFixed(digits);
}

/**
 * 安全解析浮点数
 */
export function parseF(val, defaultVal = 0) {
  const n = parseFloat(val);
  return isNaN(n) ? defaultVal : n;
}
