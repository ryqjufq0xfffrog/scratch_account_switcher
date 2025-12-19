const webext = browser || chrome;
webext.log = function log(text, ...args) {
  console.log(`%cScratch account switcher%c ${ text }`,"background:#fea;padding:0px 0.2em;box-shadow:inset 0px 0px 1px 1px #88f", "", ...args);
}

// Check every 2s until current user name is retrieved. 
const intv = setInterval((async function(){
  // log
  webext.log("Loaded successfully.");
  // Get username
  const currentUser = ((document.querySelector(".user-name") || document.querySelector(".profile-name")) || {} ).textContent;
  // username found?
  if(!currentUser) {
    // login button found?
    if(document.querySelector("li.login-item") || document.getElementById("login")) {
      // You aren't logged in.
      clearInterval(intv);
      webext.log("Exit. You are not logged in. ");
    }
    return;
  }
  else {
    clearInterval(intv);
    webext.log(`Your current user name is @${ currentUser }`);
  }
  // update stored cookie
  await webext.runtime.sendMessage({
    method: "save",
    username: currentUser,
  });
  // Retrieve stored sessions
  const userListResponse = await webext.runtime.sendMessage({
    method: "list",
  });
  if(!userListResponse) return;
  const userList = userListResponse.data;
  // Add dropdown menu button
  const dropmenu = document.querySelector(".dropdown-menu>.user-nav") || document.querySelector(".account-nav>.dropdown");
  const logout_button = dropmenu.lastChild;
  for(let entry of userList) {
    const menuItem = document.createElement("li");
    const button = document.createElement("a");
    button.href="#";
    button.textContent = `Login as ${ entry }`;
    button.addEventListener('click', async () =>{
      if((await webext.runtime.sendMessage({
            method: "login",
            username: entry,
          })).mes === "login") {
        // then reload all.
        location.reload();
      }
    });
    menuItem.appendChild(button);
    dropmenu.insertBefore(menuItem, logout_button);
  }
}), 2000);
