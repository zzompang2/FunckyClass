window.sidebarUI = (function () {
  function loadGroups() {
    const list = document.getElementById("groupList");
    list.innerHTML = "";

    /** @type {[[Group, Schedule[], number]]} */
    const groupsWithSchedules = DB.getGroupsWithSchedules();

    groupsWithSchedules.forEach(row => {
      const [group, schedules, number] = row;
      console.log(group, schedules);

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

  return {
    loadGroups
  };

})();