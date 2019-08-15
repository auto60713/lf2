const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

var scenesIndex = 0;
// ===========================================================
// 加入場景
// ===========================================================

// 準備入口畫面的東西
function appppEntrance() {

  adjunction('UI', 'startgame', {
    x: 290,
    y: 400,
  });

  adjunction('UI', 'logo', {
    x: 50,
    y: 100,
  });

}

// 準備選角畫面
function apppSelectedRoledee() {

  Object.keys(window.character).forEach(character => {
    adjunction('UI', window.character[character].Setting.name + 'face', {
      x: 100,
      y: 100,
      scale: 0.5,
    });
  });

  adjunction('UI', 'point', {
    x: 110,
    y: 130,
  });

}


// 準備格鬥模式的東西
function appppbattle() {
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


  window.mainMap = window.scenes.map[0].Setting;
  window.mainCharacter = window.scenes.character[0].Setting;
}



// ===========================================================
// 每幀動畫
// ===========================================================

function eachFrame() {
  // 清空畫布
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 場景切換
  if (stateChange) {
    Clearance();
    // 準備該場景需要的東西
    switch (window.state) {
      // 入口畫面
      case 'Entrance':
        appppEntrance();
        break;
      // 選擇模式
      case 'SelectionMode':

        break;
      // 選擇角色
      case 'SelectedRole':
        apppSelectedRoledee();
        break;
      // 格鬥模式
      case 'battle':
        appppbattle()
        break;
      // 闖關模式
      case 'Shaoguan':

        break;
    }
    stateChange = false;
    QPRESS = false;
  }

  // 每個模式要跑的畫面
  switch (window.state) {
    // 入口畫面
    case 'Entrance':
      Entrance();
      break;
    // 選擇模式
    case 'SelectionMode':

      break;
    // 選擇角色
    case 'SelectedRole':
      SelectedRole();
      break;
    // 格鬥模式
    case 'battle':
      battle();
      break;
    // 闖關模式
    case 'Shaoguan':

      break;
  }

  // FPS60
  setTimeout(eachFrame, 1000 / 60);
};

// ===========================================================
// 入口畫面
// ===========================================================

function SelectedRole() {
  // 畫地圖
  draw2('UI');

  if (QPRESS) {
    stateChange = true;
    window.state = 'battle';
  }
}

function Entrance() {
  // 畫地圖
  draw2('UI');

  if (QPRESS) {
    stateChange = true;
    window.state = 'SelectedRole';
  }
}


function draw2(type) {

  // 每個對象
  window.scenes[type].forEach((thing, index, object) => {

    if (!thing.Setting.destroy) {

      let series;
      switch (type) {
        case 'UI':
          series = [thing.Setting];
          break;
      }

      // 當中的每個元件
      series.forEach(Setting => {

        var frame = thing.frame[Setting.nowframe];

        // 自然換幀
        if (Setting.nowwait <= 0) {
          nextframe(thing, Setting, type, frame.next);
        }

        // 呈現
        show(Setting, frame, type, thing);

        // 計時器
        counter(Setting, frame, type);

      });

    } else {
      // 從群組中移除
      object.splice(index, 1);
    }
  });


}
// ===========================================================
// 格鬥
// ===========================================================
function battle() {
  // 畫地圖
  draw('map');
  // 畫角色
  draw('character');
  // 畫衍生物
  draw('derivative');
}



// 繪製項目
function draw(type) {

  // 每個對象
  window.scenes[type].forEach((thing, index, object) => {

    if (!thing.Setting.destroy) {

      let series;
      switch (type) {
        case 'map':
          series = thing.arrange;
          break;
        case 'character':
        case 'derivative':
          series = [thing.Setting];
          break;
      }

      // 當中的每個元件 (其實就只有地圖是一對象多元件)
      series.forEach(Setting => {

        var frame = type === 'map' ? thing.component[Setting.component].frame[Setting.nowframe] : thing.frame[Setting.nowframe];

        // 衍生物檢測
        produceDerivative(Setting, frame);

        // 被打偵測
        if (amIBeingBeaten(Setting, frame, thing)) {
          nextframe(thing, Setting, type, 20);
        }
        // 自然換幀
        else if (Setting.nowwait <= 0) {
          nextframe(thing, Setting, type, frame.next);
          skillll(Setting, frame, type, 'hitHold', thing);
        }
        // 技能換幀
        else {
          skillll(Setting, frame, type, 'hit', thing);
        }

        // 物理行為
        physical(Setting, frame, type, thing);

        // 呈現
        show(Setting, frame, type, thing);

        // 計時器
        counter(Setting, frame, type);

        // 攝影機
        camera();
      });

    } else {
      // 從群組中移除
      object.splice(index, 1);
    }
  });


}


function nextframe(thing, Setting, type, next) {
  if (type !== 'map') {
    if (next == 999) {
      if (Setting.inSky) next = 8;
      else next = 0;
    }
    Setting.nowframe = next;
    Setting.nowwait = thing.frame[Setting.nowframe].wait * window.waitMagnification;
    Setting.alreadyProduced = false;
  }
}

// ===========================================================
// 計時器
// ===========================================================

function counter(Setting, frame, type) {
  // 幀等待
  Setting.nowwait--;
  // 被打等待
  if (Setting.hitCD) Object.keys(Setting.hitCD).forEach(k => {
    Setting.hitCD[k]--;
  });

  // 翻轉允許
  if (frame.flip) {
    if (Setting.keypress.right) {
      Setting.mirror = false;
    }
    else if (Setting.keypress.left) {
      Setting.mirror = true;
    }
  }



  // 銷毀偵測
  if (type == 'derivative' && (Setting.x < -200 || Setting.x > mainMap.limit.x + 200)) Setting.destroy = true;
}


// ===========================================================
// 攝影機
// ===========================================================

function camera() {

  // 右邊拖動攝影機
  var rightDistance = 550;
  // 左邊拖動攝影機
  var leftDistance = 170;
  var mx = mainCharacter.x;
  var cx = window.cameraPos[0];

  if (mx - cx >= rightDistance && mx < mainMap.limit.x - (730 - rightDistance)) {
    window.cameraPos[0] = mx - rightDistance;
  }
  if (mx - cx < leftDistance && mx > leftDistance) {
    window.cameraPos[0] = mx - leftDistance;
  }

}

// ===========================================================
// 技能
// ===========================================================

function skillll(Setting, frame, type, hhhh, thing) {

  // 跳出換幀(技能)
  var breakFlag2 = false;

  if (frame[hhhh]) {
    var hit = Object.keys(frame[hhhh]);
    if (hit.length > 0) {
      hit.forEach(key => {

        if (Setting.keypress[key] && !breakFlag2) {
          nextframe(thing, Setting, type, frame[hhhh][key]);
          breakFlag2 = true;
        }

      });
    }
  }

}

// ===========================================================
// 畫
// ===========================================================

function show(Setting, frame, type, thing) {
  var file = thing.Setting.file[frame.pic[0]];
  var name = thing.Setting.name.toLowerCase();
  var image = window.imageCenter[name + '_' + frame.pic[0]];
  var sx = frame.pic[1] * file.w;
  var sy = frame.pic[2] * file.h;
  var sWidth = file.w;
  var sHeight = file.h;
  var dx = Setting.x - cameraPos[0];
  var dy = Setting.y - cameraPos[1];
  var dWidth = sWidth;
  var dHeight = sHeight;
  var ct = frame.center;
  var scale = thing.Setting.scale;

  var m = Setting.mirror ? -1 : 1;

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
  name = name.toLowerCase();
  var template = JSON.parse(JSON.stringify(window[type][name]));
  template.Setting.scenesIndex = scenesIndex;
  scenesIndex++;

  Object.keys(data).forEach(key => {
    template.Setting[key] = data[key];
  });

  window.scenes[type].push(template);
}


function Clearance() {
  window.scenes = {
    map: [],
    character: [],
    derivative: [],
    UI: [],
  };
}

// ===========================================================
// 物理行為
// ===========================================================

function physical(Setting, frame, type, thing) {

  // 地上無慣性 / 空中有慣性
  if (!Setting.inSky) Setting.xSpeed = 0;

  move(Setting, frame, type);
  walk(Setting, frame, type);

  if (type == 'derivative') Setting.x += Setting.xSpeed;
  if (type == 'character') {
    // 邊界
    if ((Setting.x >= 0 && Setting.xSpeed < 0) || (Setting.x < mainMap.limit.x && Setting.xSpeed > 0)) {
      Setting.x += Setting.xSpeed;
    }
  }

  // 重力影響與落地
  if (type == 'character') {

    // 滯空偵測
    if (Setting.ySpeed < 0) Setting.inSky = true;

    // 自由落體
    Setting.y += Setting.ySpeed;
    // 重力加速度
    if (Setting.ySpeed < window.ySpeedMax && Setting.inSky) Setting.ySpeed += window.gravity;

    // 落地偵測
    if (Setting.y > mainMap.limit.y && Setting.inSky) {
      Setting.ySpeed = 0;
      Setting.xSpeed = 0;
      Setting.inSky = false;
      nextframe(thing, Setting, type, 0)
    }
  }
}


// move移動
function move(Setting, frame, type) {
  if (frame.move) {
    var m = Setting.mirror ? -1 : 1;
    // 邊界消速度
    if ((type == 'character' && Setting.x >= 0 || Setting.x < mainMap.limit.x) || type == 'derivative') {
      Setting.xSpeed = frame.move[0] * m;
    }

    Setting.ySpeed = frame.move[1];
  }
}

// 走路移動
function walk(Setting, frame, type) {
  if (frame.walk) {
    if (Setting.keypress.right) {
      Setting.xSpeed = Setting.walkingSpeed;
    }
    else if (Setting.keypress.left) {
      Setting.xSpeed = Setting.walkingSpeed * -1;
    }
  }
}


// ===========================================================
// 被打偵測
// ===========================================================

function amIBeingBeaten(Setting, frame, thing) {
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
            thing.frame[20].move = [detFrame.itr.move[0] * m, detFrame.itr.move[1]];
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

var llll = false;

function logKey(e) {
  const event = window.event ? window.event : e;
  const pressing = event.type === 'keydown';

  if (mainCharacter) mainCharacter.keypress[keymap[event.keyCode]] = pressing;

  // 給UI的溫馨案件觸發
  if (pressing && keymap[event.keyCode] == 'Q' && !llll) {
    QPRESS = true;
    llll = true;
  }
  else if (!pressing && keymap[event.keyCode] == 'Q') llll = false;

}

