class Hexagon {
  constructor(x, y, radius) {
    this.centerX = x;
    this.centerY = y;
    this.radius = radius;
  }

  draw(context) {
    for (var i = 0; i < 6; i ++) {
      const startAngle = i * Math.PI / 3;
      const endAngle = (i + 1) * Math.PI / 3;

      const startX = this.centerX + Math.cos(startAngle) * this.radius;
      const startY = this.centerY + Math.sin(startAngle) * this.radius;
      const endX = this.centerX + Math.cos(endAngle) * this.radius;
      const endY = this.centerY + Math.sin(endAngle) * this.radius;

      context.moveTo(startX, startY);
      context.lineTo(endX, endY);
      context.stroke();
    }
  }
}