(function (App) {
  /**
   * sidebar에서 클릭한 메뉴의 화면을 띄운다.
   * @param {string} menu 
   * @returns 
   */
  function openMenu(menu) {
    if (!App.constants.MENU_CONFIG[menu]) return;

    App.state.set('currentMenu', menu);
    
    switch (menu) {
      case 'timetable':
        App.ui.renderer.showTimetable();
        break;

      case 'calendar':
        App.ui.renderer.showCalendar();
        break;

      case 'diary':
        App.ui.renderer.showDiary();
        break;

      case 'db':
        App.ui.renderer.showDB();
        break;
    }
  }

  /**
   * 상단 localbar에서 클릭한 탭의 화면을 띄운다.
   * @param {number} tab 
   * @returns 
   */
  function openGroupTab(tab = App.state.currentTab) {
    if (App.state.currentGroupId == null) return;
    if (!App.utils.constants.TAB_CONFIG[tab]) return;

    const area = document.getElementById("tabContent");
    App.state.currentTab = tab;

    // global bar에 탭 이름 추가
    document.getElementById("selected-tab").innerText = 
    `/ ${App.utils.constants.TAB_CONFIG[App.state.currentTab].label}`;

    // render view
    switch (tab) {
      case 'info':
        App.ui.group.renderGroupInfoTab(area);
        break;

      case 'plans':
        planUI.renderPlanTab(area);
        break;

      case 'scores':
        break;

      case 'message':
        break;

      case 'consult':
        break;
    }
  }

  App.ui.navigation = {
    openMenu,
    openGroupTab,
  };
})(window.App);
