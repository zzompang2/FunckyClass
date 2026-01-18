/**
 * main.js
 * 
 * 시작점.
 * - DOM 로딩 후 UI 초기화
 * - 이벤트 연결 시작
 * 
 */

(function (App) {
  async function init() {
    App.utils.logger.info("main/init: 앱 시작");
    
    await App.db.initDB();
    
    App.utils.logger.info("main/init: db 준비 완료");
    App.ui.tableEditor.bind();

    App.ui.sidebar.loadGroups();
    // sidebarUI.loadLocalbar();
    // createContextMenu();
  }

  // 앱 실행 시 자동으로 init 함수 실행
  document.addEventListener('DOMContentLoaded', init);
})(window.App);
