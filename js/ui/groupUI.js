window.groupUI = (function () {
  function selectGroup(id, name) {
    currentGroupId = id;
    document.getElementById("selected-group").textContent = name;

    sidebarUI.loadGroups(); // 선택된 그룹 표시
    openTab();
  }

  return {
    selectGroup
  };
})();