(function (App) {
  function selectGroup(id, name) {
    App.state.currentGroupId = id;
    document.getElementById("selected-group").textContent = name;

    App.ui.sidebar.loadGroups(); // sidebar 선택된 그룹 표시
    App.ui.navigation.openGroupTab(); // 메인 화면 띄우기
  }

  /**
   * 
   * @param {*} groupId 
   * @returns {{
   *   group: Group,
   *   teacherSchedules: {teacher: Teacher, schedules: Schedule[]}[]
   * }}
   */
  function getGroupDetailByGroup(groupId) {
    /** @type {Group} */
    const group = App.db.getGroup(groupId);
    if (!group) return [];

    /** @type {Schedule[]} */
    const schedules = App.db.getSchedulesByGroup(groupId);
    const teachers = App.db.getTeachersByGroup(groupId);

    /** @type {{teacher: Teacher, schedules: Schedule[]}[]} */
    const teacherSchedules = [];

    // 담임, 부담임 순서 유지하기 위해 [id] = {...} 방식 대신 push & find
    teachers.forEach(t => {
      teacherSchedules.push({ ...t, schedules: [] });
    });

    schedules.forEach(s => {
      teacherSchedules.find(ts => ts.teacher_id === s.schedule_teacher_id)
      .schedules.push(s);
    });

    return [ group, teacherSchedules ];
  }

  App.service.group = {
    selectGroup,
    getGroupDetailByGroup,
  };
})(window.App);
