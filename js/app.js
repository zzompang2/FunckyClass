/**
 * app.js
 * 
 * 프로그램 실행 도중에 계속 사용되는 함수.
 */

/**
 * sidebar에서 클릭한 메뉴의 화면을 띄운다.
 * @param {string} menu 
 * @returns 
 */
function openMenu(menu) {
  if (!MENU_CONFIG[menu]) return;
  if (menu == "timetable") {
    return;
  }

  if (menu == "calender") {
    return;
  }

  if (menu == "diary") {
    return;
  }

  if (menu == "db") {
    return;
  }
}

/**
 * 상단 localbar에서 클릭한 탭의 화면을 띄운다.
 * @param {number} tab 
 * @returns 
 */
function openTab(tab = currentTab) {
  if (currentGroupId == null) return;
  if (!TAB_CONFIG[tab]) return;

  const area = document.getElementById("tabContent");
  currentTab = tab;

  // global bar에 탭 이름 추가
  document.getElementById("selected-tab").innerText = 
    `/ ${TAB_CONFIG[currentTab].label}`;

  // render view
  if (tab === "info") {
    groupUI.renderGroupInfoTab(area);
    return;
  }

  if (tab === "students") {
    return;
  }

  if (tab === "plans") {
    return;
  }

  if (tab === "scores") {
    return;
  }

  if (tab === "message") {
    return;
  }

  if (tab === "consult") {
    return;
  }
}