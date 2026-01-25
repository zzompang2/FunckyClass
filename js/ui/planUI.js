(function (App) {
  /**
   * 수업 계획 표를 만들어 area 객체 내에 넣는다.
   * @param {HTMLElement} area 
   */
  function renderPlanTab(area) {
    /** @type {Plan[]} */
    const plans = App.db.getPlansByGroup(App.state.currentGroupId);

    // 계획 추가 버튼
    const addBtn = document.createElement("button");
    addBtn.innerText = "스케줄 추가";
    addBtn.addEventListener("click", () => addPlan());

    area.innerHTML = '';
    area.append(App.ui.tableEditor.objectListToTable(plans, {
      title: "계획",
      editable: true,
      button: addBtn,
    }));
  }

  function addPlan() {
    App.db.addPlan(App.state.currentGroupId);
    App.db.saveDB();
    App.ui.navigation.openGroupTab(App.state.currentTab); // 갱신
  }

  App.ui.plan = {
    renderPlanTab,
  };
})(window.App);