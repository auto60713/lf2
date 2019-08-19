
// 被打偵測
lf2.amIBeingBeaten = (setting, frame, type, thing) => {
  var isHit = false;
  if (frame.bdy) {
    lf2.scenes[type].forEach(det => {
      var detFrame = det.frame[det.setting.nowframe];
      if (detFrame.itr && (!det.setting.hitCD[setting.scenesIndex] || det.setting.hitCD[setting.scenesIndex] <= 0)) {
        if (setting.team !== det.setting.team) {
          if (setting.x + frame.bdy.x + frame.bdy.w >= det.setting.x + detFrame.itr.x
            && setting.x + frame.bdy.x < det.setting.x + detFrame.itr.x + detFrame.itr.w
            && setting.y + frame.bdy.y + frame.bdy.h >= det.setting.y + detFrame.itr.y
            && setting.y + frame.bdy.y < det.setting.y + detFrame.itr.y + detFrame.itr.h) {
            // 下次打我多久後
            det.setting.hitCD[setting.scenesIndex] = detFrame.itr.cd;
            const m = det.setting.mirror ? -1 : 1;
            const m2 = setting.mirror ? -1 : 1;
            setting.nowHP -= detFrame.itr.injury;
            thing.frame['falling'].move = [detFrame.itr.move[0] * m * m2, detFrame.itr.move[1]];
            isHit = true;
          }
        }
      }
    });
  }
  return isHit;
}

// 技能
lf2.skill = (setting, frame, type, hitset, thing) => {
  if (frame[hitset]) {
    // 技能組
    var hit = Object.keys(frame[hitset]);

    for (let i = 0; i < hit.length; i++) {
      if (setting.keypress[hit[i]]) {
        lf2.nextframe(thing, setting, type, frame[hitset][hit[i]], hit[i]);
        i = hit.length;
      }
    }
  }
}

// 物件換影格
lf2.nextframe = (thing, setting, type, next, hitHold) => {

  if (next == 999) {
    if (type == 'character' && setting.nowHP <= 0) next = 'lyingDown';
    else if (setting.inSky) next = 'jumping';
    else next = 'standing';

    setting.hitHold = '-';
  }
  else if (next == 1000) {
    setting.destroy = true;
    next = 'standing';
  }

  var nextFrame = type === 'map' ? thing.component[setting.component][next] : thing.frame[next];

  setting.nowframe = next;
  setting.nowwait = nextFrame.wait * lf2.waitMagnification;
  setting.alreadyProduced = false;

  if (nextFrame.hitHold && hitHold) {
    setting.hitHold = hitHold;
  }
}

// 血量系統
lf2.HPsystem = (setting, frame, type) => {
  if (lf2.mainCharacter) {
    var pp = lf2.mainCharacter.nowHP / lf2.mainCharacter.HP;
    if (pp <= 0) pp = -1;
    lf2.mainHpbar2.file['hpbar2'].w = 820 * pp;
  }
  else {

  }

  if (setting.nowHP <= 0 && lf2.gameOver == null) {

    lf2.adjunction('UI', 'ko',
      {
        fixedPosition: [400, 300],
      }
    );
    lf2.gameOver = 180;
  }

}

// 計算器
lf2.counter = (setting, frame, type, thing) => {

  // 幀等待
  setting.nowwait--;

  if (type == 'character') {
    if (setting.runwait[0] > 0) setting.runwait[0]--;
    if (setting.runwait[1] > 0) setting.runwait[1]--;


  }




  // 被打等待
  if (setting.hitCD) Object.keys(setting.hitCD).forEach(k => {
    setting.hitCD[k]--;
  });

  // 翻轉允許
  if (frame.flip) {
    if (setting.keypress.right) setting.mirror = false;
    else if (setting.keypress.left) setting.mirror = true;
  }

  // 衍生物離場銷毀
  if (type == 'derivative' && (setting.x < -200 || setting.x > lf2.mainMap.limit.x + 200)) setting.destroy = true;
}

// 製造衍生物
lf2.produceDerivative = (setting, frame) => {
  if (frame.produce && !setting.alreadyProduced) {

    var direction = setting.mirror ? -1 : 1;

    lf2.adjunction('derivative', frame.produce.name, {
      x: setting.x + (frame.produce.x * direction),
      y: setting.y + frame.produce.y,
      team: setting.team,
      mirror: setting.mirror,
    });

    setting.alreadyProduced = true;
  }
}
