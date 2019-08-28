window.lf2 = {

  // 背景數據
  scenesIndex: 0,

  imageOnload: 0,
  imageNum: 0,
  imageCenter: {},

  cameraPos: [0, 0],

  state: '',
  gameOver: null,
  backgroundColor: {
    'entrance': '#102463',
    'modeSelection': '#102463',
    'roleSelection': '#102463',
    'mapSelection': '#102463',
    'battleMode': '',
    'shaoguanMode': '',
  },

  UI: {},
  map: {},
  character: {},
  derivative: {},
  shaoguan: {},

  scenes: {
    map: [],
    character: [],
    derivative: [],
    UI: [],
  },

  // 設定有意思的值

  // wait等於幾幀
  waitMagnification: 3,
  // 重力
  gravity: 0.33,
  // 落下最大速度
  maxFallingSpeed: 10.5,

};

window.onload = () => { lf2.loader() };
