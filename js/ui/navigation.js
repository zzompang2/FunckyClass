(function (App) {
  /**
   * sidebar에서 클릭한 메뉴의 화면을 띄운다.
   * @param {string} menu 
   * @returns 
   */
  function openMenu(menu) {
    if (!App.utils.constants.MENU_CONFIG[menu]) return;

    const area = document.getElementById("tabContent");
    App.state.currentMenu = menu;
    
    switch (menu) {
      case 'timetable':
        App.ui.timetable.renderMenu(area);
        break;

      case 'calendar':
        App.ui.calendar.renderMenu(area);
        break;

      case 'diary':
        App.ui.diary.renderMenu(area);
        break;

      case 'db':
        App.ui.db.renderMenu(area);
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
        App.ui.plan.renderPlanTab(area);
        break;

      case 'scores':
        App.ui.score.renderScoreTab(area);
        break;

      case 'messages':
        App.ui.message.renderTab(area);
        break;

      case 'consults':
        App.ui.consult.renderTab(area);
        break;
    }
  }

  App.ui.navigation = {
    openMenu,
    openGroupTab,
  };
})(window.App);
