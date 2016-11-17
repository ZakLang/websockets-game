var Color = require('./color');
var Physics = require('physicsjs');

// Constructor
function Projectile(player, x, y) {
  this.activeColor = new Color(200, 130, 0);
  this.deactiveColor = new Color(128, 128, 128);
  this.body = Physics.body('projectile', {
    x: player.body.state.pos.x,
    y: player.body.state.pos.y
  });
}

// Instance methods
Projectile.prototype.accelerate = function(x, y) {
  this.body.accelerate(Physics.vector(x, y).vsub(this.body.state.pos).normalize().mult(1));
};
Projectile.prototype.toState = function() {
  return {
    color: (this.body.active) ? this.activeColor.string() : this.deactiveColor.string(),
    radius: this.body.radius,
    position: {x: this.body.state.pos.x, y: this.body.state.pos.y}
  };
};

// Class methods
Projectile.extension = function() {
  Physics.body('projectile', 'circle', function(parent) {
    return {
      init: function(options) {
        Physics.util.extend(options, {
          radius: 10,
          restitution: 0.6,
          maxSpeed: 1.5,
          active: false,
          killSpeed: 0.3
        });
        parent.init.call(this, options);
      }
    }
  });
};

// Export class
module.exports = Projectile;