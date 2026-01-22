(function (App) {
  /**
   * 반 정보, 수정내역, 학생 명단을 만들어 area 객체 내에 넣는다.
   * @param {HTMLElement} area 
   */
  function renderGroupInfoTab(area) {
    area.innerHTML = '';

    /** @type {[Group, Schedule[]]} */
    const [group, teacherSchedules] = App.service.group.getGroupDetailByGroup(App.state.currentGroupId);
    
    const groupTable = App.ui.tableEditor.objectListToTable([group]);
    area.append(groupTable);

    //     <button onclick="App.ui.group.addSchedule(${App.state.currentGroupId})">시간 추가</button>
    // onclick="openScheduleEditor(this)"
    const scheduleTable = App.ui.tableEditor.objectListToTable(teacherSchedules);
    area.append(scheduleTable);

    // 수정 내역(update_logs) 테이블
    const updateLogs = App.db.getUpdateLogsByGroup(App.state.currentGroupId);
    const logTable = App.ui.tableEditor.objectListToTable(updateLogs, {
      title: "수정 내역",
      closed: true,
      editable: false,
    });
    area.append(logTable);

    const students = App.db.getStudentsByGroup(App.state.currentGroupId);
    const studentTable = App.ui.tableEditor.objectListToTable(students);
    area.append(studentTable);
    
    // // 학생 명단
    // const students = DB.getStudentsByGroup(App.state.currentGroupId);
    // const studentCols = ["name", "school", "year", "phone", "parent", "parent_phone", "memo"];
    // const addStudentBtn = document.createElement("button");
    // addStudentBtn.innerText = "학생 추가";
    // addStudentBtn.addEventListener("click", () => addStudent());
    
    // const studentTable = objectListToTable(students, {
    //   title: "학생 목록",
    //   columns: studentCols,
    //   button: addStudentBtn,
    //   editable: true,
    //   tableName: "students",
    // });
    
    // document.getElementById("groupInfoCtn").append(historyTable);
    // area.append(studentTable);
  }

  /**
   * student 데이터를 DB에 추가하고 reload
   */
  function addStudent() {
    DB.addStudent(App.state.currentGroupId);
    DB.saveDB();
    openGroupTab("info"); // 갱신
  }

  function addSchedule() {
    DB.addSchedule(App.state.currentGroupId);
    openGroupTab("info"); // 갱신
  }

  function deleteSchedule(id) {
    DB.deleteSchedule(id);
    openGroupTab("info"); // 갱신
  }

  function updateSchedule(schedule) {
    DB.update(
      "group_schedules", schedule.id,
      Object.keys(schedule), Object.values(schedule)
    );
    openGroupTab("info"); // 갱신
  }

  App.ui.group = {
    renderGroupInfoTab,
    addStudent,
    addSchedule,
    deleteSchedule,
    updateSchedule,
  };
})(window.App);