window.planUI = (function () {
  /**
   * 수업 계획 표를 만들어 area 객체 내에 넣는다.
   * @param {HTMLElement} area 
   */
  function renderPlanTab(area) {
    /** @type {Plan[]} */
    const plans = DB.getPlansByGroup(App.state.currentGroupId);
    
    // 계획 추가 버튼
    const addBtn = document.createElement("button");
    addBtn.innerText = "스케줄 추가";
    addBtn.addEventListener("click", () => addPlan());

    area.innerHTML = '';
    area.append(objectListToTable(plans, {
      title: "계획",
      columns: ["date", "lesson", "homework", "exam", "notice", "memo"],
      editable: true,
      tableName: "plans",
      button: addBtn,
    }));
  }

  function addPlan() {
    DB.addPlan(App.state.currentGroupId);
    DB.saveDB();
    openGroupTab(App.state.currentTab); // 갱신
    
  }

  return {
    renderPlanTab,
  };
})();