// Spline curve for atmospheric Isp values
// Uses a Hermite cubic spline
var atmosphereCurve = function (points) {

  this.x = [];
  this.y = [];
  for (var i=0; i < points.length; i++) {
    this.x.push(points[i][0]);
    this.y.push(points[i][1]);
  }
  this.num = points.length;
  
  // Compute tangents
  var last = this.num-1;
  this.m = [];
  for (var i=0; i < this.num; i++) {
    if (i == 0) {
      this.m.push((this.y[1]-this.y[0])/(this.x[1]-this.x[0]));
    } else if (i == last) {
      this.m.push((this.y[last]-this.y[last-1])/(this.x[last]-this.x[last-1]));
    } else {
      this.m.push(0.5*((this.y[i+1]-this.y[i])/(this.x[i+1]-this.x[i])+(this.y[i]-this.y[i-1])/(this.x[i]-this.x[i-1])));
    }
  }
  
  // Evaluate the curve for some value x
  this.evaluate = function (x) {
    // Determine the segment
    var last = this.num-1;
    var k;
    if (x < this.x[0]) {
      k = 0;
    } else if (x > this.x[last]) {
      k = last-1;
    } else {
      for (var i=0; i < last; i++) {   // linear search at the moment
        if ((x >= this.x[i]) && (x <= this.x[i+1])) {
          k = i;
          break;
        }
      }
    }
    // Evaluate the Hermite spline
    var t = (x-this.x[k])/(this.x[k+1]-this.x[k]);
    return (2*t*t*t-3*t*t+1)*this.y[k] + (t*t*t-2*t*t+t)*(this.x[k+1]-this.x[k])*this.m[k] + (-2*t*t*t+3*t*t)*this.y[k+1] + (t*t*t-t*t)*(this.x[k+1]-this.x[k])*this.m[k+1];
  };
};
