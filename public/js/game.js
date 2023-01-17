let bow;
let stocks = [];
let target = [];
let arrows = [];
let arrowCoords = [];
let showDragging = false;
let arrowIsReleased = false;
let playerOneTurn = true;
let game_over = false;
let ready = true;
let arrow_img, bow_img, bg_img;
let restart_btn;
let point = "";
let score = 0;
let font = 0;
let opac = 1;
let width = 720;
let height = 500;
let totalTime = 300;
let timer = totalTime;

function Bow(p, x, y) {
   this.p = p;
   this.angle = Math.PI / 2;
   this.x = x;
   this.y = y;
   this.w = 240;
   this.h = 200;
   this.len = 10;
   this.xrad = (Math.cos(this.angle + Math.PI / 2) * -this.w) / 3 + this.x;
   this.yrad = (Math.sin(this.angle + Math.PI / 2) * -this.w) / 3 + this.y;
   this.xrad2 = (Math.cos(this.angle - Math.PI / 2) * -this.w) / 3 + this.x;
   this.yrad2 = (Math.sin(this.angle - Math.PI / 2) * -this.w) / 3 + this.y;
   this.show = function () {
      this.p.push();
      this.p.translate(this.x, this.y);
      this.p.rotate(this.angle);
      this.p.imageMode(this.p.CENTER);
      this.p.image(bow_img, 0, 0, this.w, this.h);
      this.p.pop();
      this.p.fill(30);
      this.p.stroke(30);
      this.p.strokeWeight(1);
      if (!showDragging) {
         this.p.line(this.xrad, this.yrad, this.xrad2, this.yrad2);
         this.p.ellipse(this.xrad, this.yrad, 5, 6);
         this.p.ellipse(this.xrad2, this.yrad2, 5, 6);
      }
      if (showDragging && arrowCoords.length === 2) {
         this.p.push();
         this.p.translate(this.x, this.y);
         this.p.rotate(this.angle + Math.PI);
         this.p.image(arrow_img, -this.len, -8, 100, 12);
         this.p.line(0, 80, -this.len, 0);
         this.p.line(0, -80, -this.len, 0);
         this.p.ellipse(0, 80, 5, 6);
         this.p.ellipse(0, -80, 5, 6);
         this.p.pop();
      }
   };
   this.adjust = function () {
      if (arrowCoords.length == 2) {
         this.len = dist(arrowCoords[1].x, arrowCoords[1].y, this.x, this.y);
         this.len = this.len <= 60 ? this.len : 60;
         this.xrad = (Math.cos(this.angle + Math.PI / 2) * -this.w) / 3 + this.x;
         this.yrad = (Math.sin(this.angle + Math.PI / 2) * -this.w) / 3 + this.y;
         this.xrad2 = (Math.cos(this.angle - Math.PI / 2) * -this.w) / 3 + this.x;
         this.yrad2 = (Math.sin(this.angle - Math.PI / 2) * -this.w) / 3 + this.y;
      }
   };
}

function Arrow(p, coords, bow) {
   this.p = p;
   this.w = 100;
   this.h = 12;
   this.bow = bow;
   this.pos = this.p.createVector(this.bow.x, this.bow.y);
   this.acc = this.p.createVector();
   this.vel = this.p.createVector();
   this.mag = coords.length === 2 ? dist(coords[0].x, coords[0].y, coords[1].x, coords[1].y) : 1;

   this.landed = false;
   this.show = function () {
      this.p.push();
      this.p.translate(this.pos.x, this.pos.y);
      this.p.rotate(this.vel.heading());
      this.p.imageMode(this.p.CENTER);
      this.p.image(arrow_img, 0, 0, this.w, this.h);
      this.p.pop();
   };

   this.update = function () {
      if (!this.landed) {
         this.vel.add(this.acc);
         this.pos.add(this.vel);
         this.acc.mult(0);
      }
   };

   this.shoot = function (f, d) {
      f.mult(this.mag);
      f.limit(d);
      this.applyForce(f);
   };

   this.edges = function () {
      if (this.pos.y > height - this.r / 2) {
         this.landed = true;
      }
   };

   this.applyForce = function (f) {
      this.acc.add(f);
   };
}

function Target(p) {
   this.p = p;
   this.x = this.p.random(250, width - 50);
   this.y = this.p.random(100, 250);
   this.r = 30;

   this.show = function () {
      this.p.stroke(0);
      this.p.strokeWeight(0.5);
      this.p.fill("yellow");
      this.p.arc(this.x, this.y, this.r * 3, this.r * 3, this.p.PI + this.p.HALF_PI, this.p.PI - this.p.HALF_PI);
      this.p.fill("orange");
      this.p.arc(this.x, this.y, this.r * 2, this.r * 2, this.p.PI + this.p.HALF_PI, this.p.PI - this.p.HALF_PI);
      this.p.fill("red");
      this.p.arc(this.x, this.y, this.r, this.r, this.p.PI + this.p.HALF_PI, this.p.PI - this.p.HALF_PI);
   };
}

function Stock(p, x, y) {
   this.p = p;
   this.x = x;
   this.y = y;
   this.w = 60;
   this.h = 10;
   this.show = function () {
      this.p.image(arrow_img, this.x, this.y, this.w, this.h);
   };
}

function ang(p1, p2) {
   return Math.atan2(p1.y - p2.y, p1.x - p2.x);
}

function dist(x2, y2, x1, y1) {
   let x = y2 - y1;
   let y = x2 - x1;
   return Math.sqrt(x * x + y * y);
}

function collision(a, b, r) {
   return dist(a.pos.x, a.pos.y, b.x, b.y) <= r && a.pos.x >= b.x;
}

function formatTime(second) {
   let min = Math.floor(second / 60);
   let sec = second % 60;
   if (!min) return sec;
   return min + ":" + sec;
}

async function updateScore(score, time) {
   const endpoint = window.location.origin;
   const token = document.querySelector('meta[name="csrf-token"]').getAttribute("content");
   $.ajax({
      method: "post",
      contentType: "application/json",
      url: endpoint + "/update_score",
      headers: { "CSRF-Token": token },
      data: JSON.stringify({ score, time }),
      success: async (data, status, jqXHR) => {
         console.log(data.message);
         return true;
      },
      error: async (jqXHR, status, error) => {
         console.log(jqXHR.responseJSON.message || error);
         return false;
      },
   });
}

let sketch = function (p) {
   p.restart = function () {
      restart_btn.hide();
      arrows.splice(arrows.length - 1, 1);
      game_over = false;
      timer = totalTime;
      font = 0;
      opac = 1;
      score = 0;
      ready = true;
      target = [];
      bow = new Bow(p, 100, height - 150);
      target.push(new Target(p));
      for (let i = 0; i < 5; i++) {
         stocks.push(new Stock(p, 10, i * 15 + 15));
      }
      p.cursor("grab");
      p.frameRate(200);
   };

   p.preload = function () {
      arrow_img = p.loadImage("../images/arrow-bow-PNG12.png");
      bow_img = p.loadImage("../images/recurve-bow-silhouette-6.png");
      bg_img = p.loadImage("../images/14031728.jpg");
   };

   p.setup = function () {
      let loader = p.select("#loaderbox");
      loader.hide();

      p.createCanvas(width, height);
      p.background(0);
      p.colorMode(p.HSB);
      p.cursor("grab");

      restart_btn = p
         .createButton("Restart")
         .position(width / 2 - 50, height / 2 + 40)
         .mouseClicked(() => p.restart())
         .hide();

      bow = new Bow(p, 100, height - 150);
      target.push(new Target(p));
      for (let i = 0; i < 5; i++) {
         stocks.push(new Stock(p, 10, i * 15 + 15));
      }
   };

   p.draw = function () {
      p.background("lightblue");
      p.image(bg_img, 0, 0, width, height);
      if (!game_over) {
         p.textAlign(p.CENTER);
         p.textSize(30);
         p.fill("yellow");
         p.stroke("orange");
         p.strokeWeight(5);
         p.text("⭐" + score, width / 2, 40);
         p.text("🕤" + formatTime(timer), width - 60, 40);
         if (font > 80) {
            font = 0;
            opac = 1;
         }
         if (font > 0) {
            font += 2;
            opac -= 0.02;
            p.textSize(font);
            p.fill(225, 225, 50, opac);
            p.strokeWeight(0);
            p.text(point, width / 2, 120);
         }

         for (let s of stocks) {
            s.show();
         }
         bow.show();

         for (let o of target) {
            o.show();
         }

         let gravity = p.createVector(0, 0.2);

         if (arrows.length > 10) {
            arrows.splice(0, 1);
         }

         if (arrowIsReleased) {
            for (let arrow of arrows) {
               arrow.applyForce(gravity);
               arrow.update();
               arrow.edges();
               arrow.show();
            }
         }
      }

      for (let i = 0; i < arrows.length; i++) {
         for (let j = 0; j < target.length; j++) {
            if (collision(arrows[i], target[j], target[j].r / 2)) {
               font = 10;
               point = "3";
               score += 3;
               target.splice(j, 1);
               arrows.splice(i, 1);
               target.push(new Target(p));
               ready = true;
            } else if (collision(arrows[i], target[j], target[j].r)) {
               font = 10;
               point = "2";
               score += 2;
               target.splice(j, 1);
               arrows.splice(i, 1);
               target.push(new Target(p));
               ready = true;
            } else if (collision(arrows[i], target[j], target[j].r * 2)) {
               font = 10;
               point = "1";
               score += 1;
               target.splice(j, 1);
               arrows.splice(i, 1);
               target.push(new Target(p));
               ready = true;
            }
         }
      }

      for (let i = 0; i < arrows.length; i++) {
         if (arrows[i].pos.y > height - 20 || arrows[i].pos.x < 0 || arrows[i].pos.x > width) {
            stocks.splice(stocks.length - 1, 1);
            arrows.splice(i, 1);
            ready = true;
         }
      }

      if (p.frameCount % 60 == 0 && timer > 0) {
         timer--;
      }

      if (stocks.length == 0 || timer <= 0) {
         game_over = true;
         let time = totalTime - timer;
         updateScore(score, time);
         p.background("lightblue");
         p.cursor("default");
         p.image(bg_img, 0, 0, width, height);
         p.fill(255);
         p.strokeWeight(2);
         p.textAlign(p.CENTER);
         p.fill("yellow");
         p.stroke("orange");
         p.textSize(25);
         p.strokeWeight(5);
         p.text("⭐" + score, width / 2, height / 2 - 100);
         p.text("🕤" + formatTime(timer), width / 2, height / 2 - 50);
         p.textSize(30);
         p.fill(255);
         p.text("Game Over !", width / 2, height / 2);
         p.frameRate(0);
         restart_btn.show();
      }
   };

   p.mousePressed = function () {
      if (ready) {
         if (p.mouseY < height - 100 && p.mouseY > height - 300 && p.mouseX < 100 + 40 && p.mouseX > 100 - 40) {
            showDragging = true;
            arrowCoords[0] = { x: bow.x, y: bow.y };
            let angle = ang(arrowCoords[0], bow);
            bow.angle = angle;
            bow.adjust();
            p.cursor("grabbing");
         }
      }
   };

   p.mouseDragged = function () {
      if (ready) {
         if (showDragging) {
            let coords = { x: p.mouseX, y: p.mouseY };
            arrowCoords[1] = coords;
            let angle = ang(coords, bow);
            bow.angle = angle;
            bow.adjust();
         }
      }
   };

   p.mouseReleased = function () {
      if (ready) {
         if (arrowCoords.length == 2) {
            if (arrowCoords[0].y < height - 100) {
               let arrow = new Arrow(p, arrowCoords, bow);
               let angle = arrowCoords.length === 2 ? ang(arrowCoords[0], arrowCoords[1]) : 0;
               let vFromAngle = p5.Vector.fromAngle(angle);
               let dists = dist(bow.x, bow.y, arrowCoords[1].x, arrowCoords[1].y);
               dists = dists <= 60 ? dists : 60;
               arrow.shoot(vFromAngle, dists / 4);
               arrows.push(arrow);
               showDragging = false;
            }
            arrowIsReleased = true;
            arrowCoords = [];
            ready = false;
            p.cursor("grab");
         }
      }
   };
};

new p5(sketch, "game_canvas");
