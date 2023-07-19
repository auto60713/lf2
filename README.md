# Little Fighter Web

  本作品的初衷雖然是想要復刻一個網頁版的LF2。
  但在作品即將完成之際，我臨時決定這個遊戲想要以全新的原創作品出現。
  所有美術圖將不使用LF2的資源。
  參數名稱暫時不會重新命名，但細部設定將不再比照原版LF2，而是考慮任何有趣的設計可能 走出原創的定位。
  由於不再比照LF2，角色以及地圖將刪減，日後將製作全新角色及地圖。

## Beta版本還缺的功能 

- 圖片先全轉png

- 設計原創角色
- 設計原創地圖

- 選圖畫面設計
- 選角畫面設計
- 入口畫面設計
- 結算畫面設計

- 笛子新屬性
- 遊戲結束有bug

- 除了角色 其他物件frame不該綁 站立 或是其他人類名稱

- deep刀波 如果 有打到人 要取消 goto
- 2P選角
- 機器人

- 修正角色協調性
- 衍生物速度是被製造時設定 (射箭會需要)

- 區塊視覺化 有攝影機跑版

## 改版小提醒

如果你之前有改版過LF2的經驗 在此網頁重製板有一些注意事項

- 圖片的切格子大小 都是原版+1 並且不會忽略格線
- wait的時間與原版有些微差異 (網頁版60FPS, 1wait = 3幀)
- 走路 跑步 跳躍 都視為技能 使用hit切換 並且速度在frame中設定 不再另設角色能力係數
  網頁版的能力速度換算成網頁版的move大約1/2 
  例如跳躍jump_height -16.299999, jump_distance 10.000000
  在網頁版相當於 move: [5, -8]
- 由於物理引擎不一樣, 所有的速度運動都與原版有些微不同 
- 其他詳細事項請查閱改版說明書

## 作者的話

與原作不同我們改變了一些核心玩法
在慎重考慮下 移除了原作的Z軸 讓玩法更傾向 二維橫向動作 如洛克人 快打旋風 任天堂大亂鬥
(闖關模式..)

在網頁重製板中並沒有想要改變角色太多設定 包括改變原有技能或是新技能之類的
完全比照原作設定

腳本方面 盡量重現了原作的計算方式 讓具有原版改版經驗的人可以馬上適應
並且改良原本改版不人性的地方 例如 原版要經常計算 pic:的序列 網頁版改成座標制, 原版next是序號制 在網頁版感成了keyword制 讓排序上更靈活


## 改版說明書

整理所有特殊標籤 與新功能

## 未來功能

- 角色登場動畫
- 要不要加入背部被打的動作
- combo 系統 (艾爾)
- 打擊反彈球

- 防禦

- 大地圖
    - 小平台
    - 垂直攝影機

- 按鍵可設定

- 缺少屬性debug工具 例如少了vrest
