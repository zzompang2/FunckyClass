(function (App) {
  function loadGroups() {
    const list = document.getElementById("groupList");
    list.innerHTML = "";

    /* 선생님 선택창 */
    const select = document.getElementById('teacherSelect');
    select.innerHTML = '';

    const teachers = App.db.getAllTeachers();
    teachers.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = t.name;
      select.appendChild(opt);
    });

    select.onchange = () => {
      App.state.teacher.currentTeacherId = Number(select.value);
      App.ui.sidebar.loadGroups();
    };
  
    /* 선택된 선생님 없으면 그룹 로딩하지 않음 */
    if (!App.state.currentTeacherId) {
      App.utils.logger.debug("loadGroups: 선택된 선생님이 없음");
      return;
    }

    const currentTeacherId = App.state.currentTeacherId;
    
    // 디폴트 선택 값 설정
    select.value = currentTeacherId;
    
    const teacher = App.db.getTeacher(currentTeacherId); // 선택된 선생님 정보
    
    App.utils.logger.debug("loadGroups: 선택된 선생님", teacher.id, teacher.name);
    
    /** @type {{ group: Group, schedules: Schedule[], number: number }[]} */
    const groupDetails = App.db.getGroupDetailsByTeacher(currentTeacherId); // 선택된 선생님의 모든 스케줄

    App.utils.logger.debug("loadGroups: groupDetails", groupDetails);
    
    groupDetails.forEach(row => {
      const groupBlock = document.createElement("div");
      groupBlock.className = "sidebar-block";
      groupBlock.onclick = () => groupUI.selectGroup(row.group.id, row.group.name);

      let scheduleText = "";
      if (row.schedules.length > 0) {
        scheduleText = row.schedules
          .map(s => `${App.utils.date.dayToText(s.day)}`).join(" / ");
      }

      if (row.group.id === App.state.currentGroupId) {
        groupBlock.classList.add("active");
      }

      groupBlock.innerHTML = `
        <div class="sidebar-block-title">${row.group.name}</div>
        <div class="sidebar-block-subtitle">
          <div>${scheduleText}</div>
          <div class="student-number">${row.number}</div>
        </div>
      `;

      list.appendChild(groupBlock);
    });
  }

  /**
   * TAB_CONFIG를 참고하여 localbar에 탭들을 추가
   */
  function loadLocalbar() {
    const localbar = document.getElementById("localbar");

    Object.entries(TAB_CONFIG).forEach(([key, value]) => {
      const tabElem = document.createElement("div");
      tabElem.className = "localbar-tab";
      tabElem.addEventListener('click', () => openGroupTab(key));
      tabElem.innerText = value.label;
      localbar.appendChild(tabElem);
    });
  }

  App.ui.sidebar = {
    loadGroups,
    loadLocalbar,
  };
})(window.App);