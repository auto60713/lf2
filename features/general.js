
// 換動作判斷
lf2.variousChangesFrame = (setting, frame, type, thing) => {

  var effect = lf2.collisionDetection(setting, frame, type, thing);
  var skill = lf2.skill(setting, frame, type, thing);

  // 長壓保持動作
  if (frame.hitHold && !setting.keypress[setting.hitHold]) {
    lf2.gotoFrame(thing, setting, type, 999);
  }
  // 自然換動作
  else if (setting.nowwait <= 0) {
    lf2.gotoFrame(thing, setting, type, frame.next);
  }
  // 被打偵測
  else if (effect) {
    // 不同的打擊效果 會有不同的特效
    lf2.strikeEffect(type, thing, setting, effect);
  }
  // 技能換動作
  else if (skill) {
    lf2.gotoFrame(thing, setting, type, skill);
  }
  // 循環到期換動作 (通常為衍生物)
  else if (setting.timeToGo[1] && setting.timeToGo[0] <= 0) {
    lf2.gotoFrame(thing, setting, type, setting.timeToGo[1]);
    setting.timeToGo[1] = null;
  }
  // 被抓換動作
  else if (setting.catching) {
    var enemy = lf2.findScenesIndex(setting.catching);
    var enemyFrame = enemy.frame[enemy.setting.nowframe];
    lf2.gotoFrame(thing, setting, type, enemyFrame.cpoint.frame);
  }

}

// 技能
lf2.skill = (setting, frame, type, thing) => {
  if (!lf2.passOnly(['battleMode', 'shaoguanMode'], ['character'], type)) return;

  if (frame.hit) {
    var hit = Object.keys(frame.hit);
    try {
      hit.forEach(btName => {
        var skillName = frame.hit[btName];
        var nextFrame = lf2.theFrame(type, thing, setting, skillName);

        // 確認技能是否存在 (可能還沒被做出來 但先有按法)
        if (nextFrame) {
          // 正在按
          if (setting.keypress[btName]) {
            if (nextFrame.hitHold) setting.hitHold = btName;
            throw skillName;
          }
          // 檢視按鍵反應序
          if (setting.keyReaction.length >= 2) {
            for (let y = 0; y < setting.keyReaction.length - 1; y++) {
              // 目前只支援到雙鍵
              var key1 = setting.keyReaction[y][0];
              var key2 = setting.keyReaction[y + 1][0];
              // 在裡面有打出
              if (key1 + key2 == btName) {
                if (nextFrame.hitHold) setting.hitHold = key2;
                if (setting.keypress[key2] || !nextFrame.hitHold) {
                  throw skillName;
                }
              }
            }
          }
        }
      });
    } catch (skillName) { return skillName; }
  }
}

// 物件換影格
lf2.gotoFrame = (thing, setting, type, next) => {

  // next翻轉
  if (next < 0) {
    setting.mirror = !setting.mirror;
    next = next * -1;
  }

  if (next == 999) {
    if (type == 'character' && setting.nowHP <= 0) next = 'lyingDown';
    else if (type == 'character' && setting.inSky) next = 'jumping';
    else next = 'standing';
    setting.hitHold = '-';

    // 副本敵人死亡消失
    if (lf2.state == 'shaoguanMode' && setting.nowHP <= 0 && setting.nowframe == 'lyingDown') {
      setting.destroy = true;
      lf2.enemyClear++;
    }
  }
  else if (next == 1000) {
    setting.destroy = true;
    next = 'standing';
  }

  var nextFrame = lf2.theFrame(type, thing, setting, next);

  setting.nowframe = next;
  setting.nowwait = nextFrame.wait * lf2.waitMagnification;

  lf2.sound(nextFrame.sound);
  lf2.produceDerivative(setting, nextFrame, type);
}

// 計算器
lf2.counter = (setting, frame, type, thing) => {

  // 幀等待
  setting.nowwait--;

  if (lf2.state == 'shaoguanMode') {
    if (lf2.enemyClear == lf2.enemyClearGoal) {
      lf2.enemyBorn();
    }
  }

  // 循環動作
  if (setting.timeToGo[0] > 0) setting.timeToGo[0]--;

  if (frame.timeToGo && !setting.timeToGo[1]) {
    setting.timeToGo = frame.timeToGo;
  }

  if (type == 'character') {

    // 按鍵反應表
    setting.keyReaction.forEach((k, i, o) => {
      k[1]--;
      if (k[1] <= 0) o.splice(i, 1);
    });

    // 被打等待
    Object.keys(setting.strikeCD).forEach(k => {
      setting.strikeCD[k]--;
    });

    // 翻轉允許
    if (frame.flip) {
      if (setting.keypress['R']) setting.mirror = false;
      else if (setting.keypress['L']) setting.mirror = true;
    }
  }

}

// 物件位置
lf2.location = (setting, frame, type, thing) => {

  // 固定在畫面某處 (通常為UI)
  if (setting.fixedPosition) {
    lf2.updateLocation(setting, type, [lf2.cameraPos[0] + setting.fixedPosition[0], lf2.cameraPos[1] + setting.fixedPosition[1]], true)
  }
  // 如果使用瞬間移動
  else if (frame.teleport) {
    var m = setting.mirror ? -1 : 1;
    lf2.updateLocation(setting, type, [lf2.findEnemyX(setting) - (100 * m), setting.y = lf2.mapLimit.y], true)
  }
  // 根據目前速度移動物件
  else {
    lf2.updateLocation(setting, type, [setting.xSpeed, setting.ySpeed], false)
  }

  if (lf2.passOnly(['battleMode', 'shaoguanMode'], ['character'], 'character'))
    if (setting.y > lf2.mapLimit.y) setting.y = lf2.mapLimit.y;
}

// 更新物件位置
lf2.updateLocation = (setting, type, speed, absolute) => {

  if (absolute) {
    setting.x = speed[0];
    setting.y = speed[1];
  } else {
    // 邊界偵測
    if (!lf2.mapDetection(setting, type)) setting.x += speed[0];
    setting.y += speed[1];
  }

}

// 邊界偵測
lf2.mapDetection = (setting, type) => {
  var limit = false;
  if (type == 'derivative') {
    if (setting.x < -200 || setting.x > lf2.mapLimit.x + 200) setting.destroy = true;
  }
  else if (type == 'character') {
    if ((setting.x <= 0 && setting.xSpeed < 0) || (setting.x >= lf2.mapLimit.x && setting.xSpeed > 0)) limit = true;
  }

  return limit;
}



// 製造衍生物
lf2.produceDerivative = (setting, frame, type) => {
  if (!lf2.passOnly(['battleMode', 'shaoguanMode'], ['character', 'derivative'], type)) return;

  if (frame.opoint) {

    var rect = lf2.whereAmI(setting, frame.center, frame.opoint);

    lf2.adjunction('derivative', setting.name, {
      x: rect.x,
      y: rect.y,
      team: setting.team,
      mirror: setting.mirror,
      nowframe: frame.opoint.frame,
      nowwait: lf2.derivative[setting.name].frame[frame.opoint.frame].wait * lf2.waitMagnification,
    });
  }
}


// 一些會跟隨角色的視覺
lf2.SomeThingsFollowTheRole = (setting, frame, type, thing) => {
  if (!lf2.passOnly(['battleMode', 'shaoguanMode'], ['character', 'derivative'], type)) return;

  // 影子
  if (!frame.shadowHide) {
    lf2.paintedAtFoot(setting.x, 0, 'shadow');
  }

  if (type == 'character') {

    // 主角
    if (setting.scenesIndex == 1) {
      // 身份
      lf2.paintedAtFoot(setting.x, 10, 'p1');

      // 血條
      var pp = setting.nowHP / setting.HP;
      if (pp <= 0) pp = -1;
      lf2.mainHpbar2.file['protagHPbarVal'].w = 820 * pp;
    }

    // 其他人
    else {
      // 在畫面外提示
      var xxx;
      if (setting.x > lf2.cameraPos[0] + 800) xxx = lf2.cameraPos[0] + 800 - 20;
      else if (setting.x < lf2.cameraPos[0]) xxx = lf2.cameraPos[0] + 20;
      else xxx = setting.x;
      // 身份
      lf2.paintedAtFoot(xxx, 10, 'p2');

      // 血條
      var pp = setting.nowHP / setting.HP;
      if (pp <= 0) pp = -1;

      lf2.paintedAtFoot(setting.x, 20, 'otherHPbar');
      lf2.paintedAtFoot(setting.x, 20, 'otherHPbar', 'standing2', 70 * pp);
    }

    switch (lf2.state) {
      case 'battleMode':
        // 遊戲結束
        if (setting.nowHP <= 0 && lf2.gameOver == null) {
          lf2.adjunction('UI', 'ko');
          lf2.gameOver = 180;
        }
        break;
      case 'shaoguanMode':
        // if (setting.nowHP <= 0 && lf2.gameOver == null) {
        //   setting.destroy = true;
        // }
        break;
    }


  }

}
// 畫一些東西在腳邊
lf2.paintedAtFoot = (x, y, name, f = 'standing', w) => {

  var template = JSON.parse(JSON.stringify(lf2['UI'][name]));

  var setting = template.setting;
  var frame = template.frame[f];
  setting.name = name;
  setting.x = x;
  setting.y = lf2.mapLimit.y + y;

  // 血條特規
  if (w) setting.file['otherHPbarVal'].w = w;

  lf2.draw(setting, frame, 'UI');
}






// 我到底在哪
lf2.whereAmI = (setting, center, item) => {
  var m = setting.mirror ? -1 : 1;
  var anchorPoint = setting.mirror ? (item.w || 0) : 0;
  return {
    x: setting.x - (center[0] * m) + (item.x * m) - anchorPoint,
    y: setting.y - center[1] + item.y,
    w: item.w,
    h: item.h,
  };
}

// 找第一個敵人座標
lf2.findEnemyX = (setting) => {
  var someone = lf2.scenes['character'];
  for (let i = 0; i < someone.length; i++)
    if (someone[i].setting.team != setting.team) return someone[i].setting.x;
}

// 序號找人
lf2.findScenesIndex = (index) => {
  var someone = lf2.scenes['character'];
  for (let i = 0; i < someone.length; i++)
    if (someone[i].setting.scenesIndex == index) return someone[i];
}

// 找frame
lf2.theFrame = (type, thing, setting, frameName) => {
  return type === 'map' ? thing.component[setting.component][frameName] : thing.frame[frameName];
}

// 限制模式與種類
lf2.passOnly = (modeList, typeList, type) => {
  try {
    modeList.forEach(name => {
      // 如果是允許的模式
      if (lf2.state === name || name === 'all') throw false;
    });
  } catch (e) {
    // 接著檢查
    try {
      typeList.forEach(name => {
        // 如果是允許的類型
        if (type === name || name === 'all') throw false;
      });
    } catch (e) { return true; }
  }
  return false;
}