const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

var scenesIndex = 0;
// ===========================================================
// 加入場景
// ===========================================================

// 地圖
adjunction('map', 'de', {
});

// 主角(即第一個加入的角色)
adjunction('character', 'rock', {
  x: 100,
  y: 340,
  team: 0,
});

// 另一個角色
adjunction('character', 'rock', {
  x: 600,
  y: 340,
  team: 1,
  mirror: true,
});

const mainMap = window.scenes.map[0].Setting;
const mainCharacter = window.scenes.character[0].Setting;

// ===========================================================
// 每幀動畫
// ===========================================================

function animate() {
  // 清空畫布
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 畫地圖
  draw('map');
  // 畫角色
  draw('character');
  // 畫衍生物
  draw('derivative');

  // FPS60
  setTimeout(animate, 1000 / 60);
};

// 繪製項目
function draw(type) {

  // 每個對象
  window.scenes[type].forEach((dada, index, object) => {

    if (!dada.Setting.destroy) {

      let theElement;
      switch (type) {
        case 'map':
          theElement = dada.arrange;
          break;
        case 'character':
        case 'derivative':
          theElement = [dada.Setting];
          break;
      }

      // 當中的每個元件 (其實就只有地圖是一對象多元件)
      theElement.forEach(Setting => {

        var frame = type === 'map' ? dada.component[Setting.component].frame[Setting.nowframe] : dada.frame[Setting.nowframe];

        // 衍生物檢測
        produceDerivative(Setting, frame);

        // 被打偵測
        if (amIBeingBeaten(Setting, frame, dada)) {
          nextframe(dada, Setting, type, 20);
        }
        // 自然換幀
        else if (Setting.nowwait <= 0) {
          nextframe(dada, Setting, type, frame.next);
          skillll(Setting, frame, type, 'hitHold', dada);
        }
        // 技能換幀
        else {
          skillll(Setting, frame, type, 'hit', dada);
        }

        // 物理行為
        physical(Setting, frame, type, dada);

        // 呈現
        show(Setting, frame, type, dada);

        // 計時器
        counter(Setting, frame, type);
      });

    } else {
      // 從群組中移除
      object.splice(index, 1);
    }
  });


}


function nextframe(dada, Setting, type, next) {
  if (type !== 'map') {
    if (next == 999) {
      if (Setting.jumping) next = 8;
      else next = 0;
    }
    Setting.nowframe = next;
    Setting.nowwait = dada.frame[Setting.nowframe].wait * 10;
    Setting.alreadyProduced = false;
  }
}

// ===========================================================
// 計時器
// ===========================================================

function counter(Setting, frame) {
  // 幀等待
  Setting.nowwait--;
  // 被打等待
  if (Setting.hitCD) Object.keys(Setting.hitCD).forEach(oo => {
    Setting.hitCD[oo]--;
  });

  if (frame.pertain == 'idle') {
    if (Setting.keypress.right) {
      Setting.mirror = false;
    }
    else if (Setting.keypress.left) {
      Setting.mirror = true;
    }
  }
}

// ===========================================================
// 技能
// ===========================================================

function skillll(Setting, frame, type, hhhh, dada) {

  // 跳出換幀(技能)
  var breakFlag2 = false;

  if (frame[hhhh]) {
    var hit = Object.keys(frame[hhhh]);
    if (hit.length > 0) {
      hit.forEach(key => {

        if (Setting.keypress[key] && !breakFlag2) {
          nextframe(dada, Setting, type, frame[hhhh][key]);
          breakFlag2 = true;
        }

      });
    }
  }

}

// ===========================================================
// 畫
// ===========================================================

function show(Setting, frame, type, dada) {

  var file = dada.Setting.file[frame.pic[0]];
  var name = dada.Setting.name.toLowerCase();
  var image = window.imageCenter[name + '_' + frame.pic[0]];
  var sx = frame.pic[1] * file.w;
  var sy = frame.pic[2] * file.h;
  var sWidth = file.w;
  var sHeight = file.h;
  var dx = Setting.x;
  var dy = Setting.y;
  var dWidth = sWidth;
  var dHeight = sHeight;
  var ct = frame.center;
  var scale = dada.Setting.scale;

  var m = Setting.mirror ? -1 : 1;
  // if (Setting.scenesIndex == 1) console.log(m, Setting.nowframe);
  ctx.save();
  ctx.scale(m * scale, 1 * scale);
  ctx.drawImage(image, sx, sy, sWidth, sHeight, ((dx - ct[0]) * m) / scale, (dy - ct[1]) / scale, dWidth * m, dHeight);
  ctx.restore();
}


// ===========================================================
// 衍生物
// ===========================================================

function produceDerivative(Setting, frame) {
  if (frame.produce && !Setting.alreadyProduced) {

    var direction = Setting.mirror ? -1 : 1;

    adjunction('derivative', frame.produce.name,
      {
        x: Setting.x + (frame.produce.x * direction),
        y: Setting.y + frame.produce.y,
        team: Setting.team,
        mirror: Setting.mirror,
      }
    );

    Setting.alreadyProduced = true;
  }
}

// ===========================================================
// 加到場景中
// ===========================================================

function adjunction(type, name, data) {
  var wwww = JSON.parse(JSON.stringify(window[type][name]));
  wwww.Setting.scenesIndex = scenesIndex;
  scenesIndex++;

  Object.keys(data).forEach(key => {
    wwww.Setting[key] = data[key];
  });

  window.scenes[type].push(wwww);
}

// ===========================================================
// 物理行為
// ===========================================================

function physical(Setting, frame, type, dada) {

  if (!Setting.jumping) Setting.moveSpeed = 0;

  move(Setting, frame, type);
  walk(Setting, frame, type);

  if (type == 'derivative') Setting.x += Setting.moveSpeed;
  if (type == 'character' && (frame.pertain == 'idle' || Setting.jumping)) {
    // 邊界
    if ((Setting.x >= 0 && Setting.moveSpeed < 0) || (Setting.x < mainMap.limit.x && Setting.moveSpeed > 0)) {
      Setting.x += Setting.moveSpeed;
    }
  }



  if (type == 'character') {

    // 落下速度
    Setting.y += Setting.fallingSpeed;
    // 重力加速度
    if (Setting.fallingSpeed < window.fallingSpeedMax && Setting.jumping) Setting.fallingSpeed += window.gravity;

    // 落地
    if (Setting.y > mainMap.limit.y && Setting.jumping) {
      Setting.fallingSpeed = 0;
      Setting.moveSpeed = 0;
      Setting.jumping = false;
      nextframe(dada, Setting, type, 0)
    }
  }
}


// 物體移動
function move(Setting, frame, type) {
  if (frame.move) {
    var direction = Setting.mirror ? -1 : 1;
    if ((type == 'character' && Setting.x >= 0 || Setting.x < mainMap.limit.x) || type == 'derivative') {
      Setting.moveSpeed = frame.move[0] * direction;
    }
    if (type == 'derivative' && Setting.x < -200 || Setting.x > mainMap.limit.x + 200) Setting.destroy = true;

    if (type == 'character' && frame.move[1] < 0) Setting.jumping = true;
    Setting.fallingSpeed = frame.move[1];
  }
}

// 角色走路移動
function walk(Setting, frame, type) {
  if (type == 'character') {
    if (frame.pertain == 'jump' || !Setting.jumping) {
      if (Setting.keypress.right) {
        Setting.moveSpeed = Setting.walkingSpeed;
      }
      else if (Setting.keypress.left) {
        Setting.moveSpeed = Setting.walkingSpeed * -1;
      }
    }
  }
}


// ===========================================================
// 被打偵測
// ===========================================================

function amIBeingBeaten(Setting, frame, dada) {
  var isHit = false;
  if (frame.bdy) {
    // 問全部的衍生物
    window.scenes.derivative.forEach(det => {
      var detFrame = det.frame[det.Setting.nowframe];
      if (detFrame.itr && (!det.Setting.hitCD[Setting.scenesIndex] || det.Setting.hitCD[Setting.scenesIndex] <= 0)) {
        if (Setting.team !== det.Setting.team) {
          if (Setting.x + frame.bdy.x + frame.bdy.w >= det.Setting.x + detFrame.itr.x
            && Setting.x + frame.bdy.x < det.Setting.x + detFrame.itr.x + detFrame.itr.w
            && Setting.y + frame.bdy.y + frame.bdy.h >= det.Setting.y + detFrame.itr.y
            && Setting.y + frame.bdy.y < det.Setting.y + detFrame.itr.y + detFrame.itr.h) {
            // 這個衍生物下次打我多久後
            det.Setting.hitCD[Setting.scenesIndex] = detFrame.itr.cd;
            const m = Setting.mirror ? -1 : 1;
            dada.frame[20].move = [detFrame.itr.move[0] * m, detFrame.itr.move[1]];
            isHit = true;
          }
        }

      }
    });
  }
  return isHit;
}
// ===========================================================
// 鍵盤控制
// ===========================================================

document.addEventListener('keyup', logKey);
document.addEventListener('keydown', logKey);

const keymap = {
  39: 'right',
  37: 'left',
  38: 'up',
  81: 'Q',
  87: 'W',
  69: 'E',
  82: 'R',
}

function logKey(e) {
  const event = window.event ? window.event : e;
  const pressing = event.type === 'keydown';

  mainCharacter.keypress[keymap[event.keyCode]] = pressing;
}

