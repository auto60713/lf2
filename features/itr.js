
// 被打偵測
lf2.amIBeingBeaten = (setting, frame, type, thing) => {
  var effect = null;
  if (frame.bdy) {
    try {
      ['character', 'derivative'].forEach(dettype => {
        lf2.scenes[dettype].forEach(det => {
          var detFrame = det.frame[det.setting.nowframe];

          if (detFrame.itr && (!det.setting.hitCD[setting.scenesIndex] || det.setting.hitCD[setting.scenesIndex] <= 0)) {
            // 不同隊 而且 物件不是打同隊
            if ((setting.team !== det.setting.team && detFrame.itr.team != 'my')
              // 同隊 但是 物件打同隊
              || (setting.team === det.setting.team && detFrame.itr.team == 'my')) {

              // 我四邊
              var SL = setting.x + frame.bdy.x;
              var SR = setting.x + frame.bdy.x + frame.bdy.w;
              var ST = setting.y + frame.bdy.y;
              var SB = setting.y + frame.bdy.y + frame.bdy.h;

              // 敵四邊
              var DL = det.setting.x + detFrame.itr.x;
              var DR = det.setting.x + detFrame.itr.x + detFrame.itr.w
              var DT = det.setting.y + detFrame.itr.y
              var DB = det.setting.y + detFrame.itr.y + detFrame.itr.h
              // https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
              var rect1 = {
                x: setting.x + frame.bdy.x, 
                y: 5, 
                width: 50, 
                height: 50
              }
              var rect2 = {
                x: 20, 
                y: 10, 
                width: 10, 
                height: 10
              }

              if (rect1.x < rect2.x + rect2.width &&
                rect1.x + rect1.width > rect2.x &&
                rect1.y < rect2.y + rect2.height &&
                rect1.y + rect1.height > rect2.y) {
                // collision detected!
              // }
              // if (((SL >= DL && SL <= DR) || (SR >= DL && SR <= DR)) && ((ST >= DT && ST <= DB) || (SB >= DT && SB <= DB))) {

                // 被打的中間
                var sc = setting.x + frame.bdy.x + (frame.bdy.w / 2);
                // 打人的中間
                var dc = det.setting.x + detFrame.itr.x + (detFrame.itr.w / 2);
                // 下次打我多久後
                // FIXME: vrest arest未來要做出區分
                var cd = detFrame.itr.vrest || detFrame.itr.arest;
                det.setting.hitCD[setting.scenesIndex] = cd;
                // 打擊換動作
                if (detFrame.itr.next) lf2.gotoFrame(det, det.setting, dettype, detFrame.itr.next);
                // 抓攻擊
                if (type == 'character' && detFrame.itr.catching) setting.catching = det.setting.scenesIndex;
                // 一般攻擊
                else {

                  let m = det.setting.mirror ? -1 : 1;;
                  if (detFrame.itr.symmetry && sc * m < dc * m) m = m * -1

                  if (type == 'character') {
                    effect = detFrame.itr.effect;
                    lf2.asdasdasd(setting, detFrame.itr.move, m);
                  }
                  else effect = 'falling';

                }
                setting.nowHP -= detFrame.itr.injury;
                if (setting.nowHP > setting.HP) setting.nowHP = setting.HP;
                throw false;
              }

            }
          }
        });
      });
    } catch (e) { }
  }
  return effect;
}


// 打擊效果
lf2.strikeEffect = (type, thing, setting, effect) => {
  var sound = null, gotoFrame = null, UI = null;

  switch (effect) {
    case 'injured':
      sound = '001.wav';
      gotoFrame = 'injured';
      UI = 'hit';
      break;
    case 'falling':
      sound = '006.wav';
      gotoFrame = 'falling';
      UI = 'hit';
      break;
    case 'heal':
      sound = '049.wav';
      break;

  }

  if (sound) lf2.sound({}, { sound: sound });
  if (gotoFrame) lf2.gotoFrame(thing, setting, type, gotoFrame);
  if (UI) lf2.adjunction('UI', UI, {
    x: setting.x,
    y: setting.y,
  });
}


// 血量系統
lf2.HPsystem = (setting, frame, type) => {
  if (lf2.state != 'battleMode' && lf2.state != 'shaoguanMode') return;
  if (type != 'character') return;

  if (setting.scenesIndex == 1) {
    var pp = setting.nowHP / setting.HP;
    if (pp <= 0) pp = -1;
    lf2.mainHpbar2.file['hpbar2'].w = 820 * pp;
  }
  else if (setting.scenesIndex == 2) {
    var pp = setting.nowHP / setting.HP;
    if (pp <= 0) pp = -1;
    lf2.ElefollowsCharacter(lf2.otherhpbar, setting, 20);
    lf2.ElefollowsCharacter(lf2.otherhpbar2, setting, 20);
    lf2.otherhpbar2.file['otherhpbar2'].w = 70 * pp;
  }


  if (setting.nowHP <= 0 && lf2.gameOver == null) {
    lf2.adjunction('UI', 'ko');
    lf2.gameOver = 180;
  }

}