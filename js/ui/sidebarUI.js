window.sidebarUI = (function () {
  function loadGroups() {
    const list = document.getElementById("groupList");
    list.innerHTML = "";

    /** @type {[[Group, Schedule[], number]]} */
    const groupsWithSchedules = DB.getGroupsWithSchedules();

    groupsWithSchedules.forEach(row => {
      const [group, schedules, number] = row;

      const groupBlock = document.createElement("div");
      groupBlock.className = "sidebar-block";
      groupBlock.onclick = () => groupUI.selectGroup(group.id, group.name);

      let scheduleText = "";
      if (schedules.length > 0) {
        scheduleText = schedules
          .map(s => `${dayToText(s.day)}`).join(" / ");
      }

      if (group.id === currentGroupId) {
        groupBlock.classList.add("active");
      }

      groupBlock.innerHTML = `
        <div class="sidebar-block-title">${group.name}</div>
        <div class="sidebar-block-subtitle">
          <div>${scheduleText}</div>
          <div class="student-number">${number}</div>
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

    console.log(TAB_CONFIG);

    Object.entries(TAB_CONFIG).forEach(([key, value]) => {
      console.log(key, value);
      const tabElem = document.createElement("div");
      tabElem.className = "localbar-tab";
      tabElem.addEventListener('click', () => openTab(key));
      tabElem.innerText = value.label;
      localbar.appendChild(tabElem);
    });
  }

  return {
    loadGroups,
    loadLocalbar,
  };

})();