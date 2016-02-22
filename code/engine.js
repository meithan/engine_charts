// Engine class
var Engine = function (name, nickname, mass, vac_thrust, Isp_points, alpha) {
  this.name = name;
  this.nickname = nickname;
  if (name == "DawnSP") {
    this.fullname = '"Dawn" + panels';
  } else {
    this.fullname = name + ' "' + nickname + '"';    
  }
  this.mass = mass;       // t
  this.vac_thrust = vac_thrust;   // max vacuum thrust, kN
  this.Isp_curve = new atmosphereCurve(Isp_points);   // Isp in s, P in atm
  this.vac_Isp = this.Isp_curve.evaluate(0);
  this.alpha = alpha;        // propellant-to-dry mass ratio
  this.thrust = this.vac_thrust;
  this.Isp = this.vac_Isp;
  this.TWR = this.vac_thrust/(this.mass*g0);
  this.color = [255,255,255];
  this.show = false;
  this.update = function (pressure, glocal) {
    this.Isp = this.Isp_curve.evaluate(pressure);
    this.thrust = this.vac_thrust*this.Isp/this.vac_Isp;
    this.TWR = this.thrust/(this.mass*glocal);
  };
};
