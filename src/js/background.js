const webext = browser || chrome;

webext.runtime.onMessage.addListener(function(mes, sender, respond) {
  // log
  console.log("Received message");
  // handle
  if(mes.method === "save" && mes.username) {
    saveCookie(mes.username)
      .then(respond);
    // saveCookie is asynchronous
    return true;
  }else if(mes.method === "list") {
    listUsers()
      .then(respond);
    // listUsers is asynchronous
    return true;
  }else if(mes.method === "login" && mes.username) {
    loginAs(mes.username)
      .then(respond);
    // loginAs is asynchronous
    return true;
  }
  // Command not found
  console.log("Command not found");
  return;
});

async function saveCookie(username) {
  // log
  console.log(`saveCookie(${ username })`);
  // collect Data
  const current_sid = await webext.cookies.get({
    name: "scratchsessionsid",
    url: "https://scratch.mit.edu/",
  });
  const current_csrf = await webext.cookies.get({
    name: "scratchcsrftoken",
    url: "https://scratch.mit.edu/",
  });
  const current_permission = await webext.cookies.get({
    name: "permissions",
    url: "https://scratch.mit.edu/",
  });
  if(current_sid && current_csrf && current_permission) {
    // Sign-ined
    await webext.storage.local.set({
      [`@${ username }`]: {
        sid: current_sid,
        csrf: current_csrf,
        permission: current_permission,
      }
    });
    return ({
      mes: "saved",
    });
  }else return ({
      mes: "error",
  });
}

async function listUsers() {
  // log
  console.log("listUsers()");
  // Get all stored data
  const stored = await webext.storage.local.get(null);
  const userList = [];

  for(const entry in stored) {
    // only add if "entry" is a user session entry
    if(entry.startsWith("@")) userList.push(entry);
  }
  return ({
    mes: "listed",
    data: userList,
  });
}

async function loginAs(username) {
  // log
  console.log(`loginAs(${ username })`);
  // Main
  const session = (await webext.storage.local.get(username))[username];
  if(session.sid && session.csrf && session.permission) {
    await webext.cookies.set({
      url: "https://scratch.mit.edu/",
      // These 3 props won't change
      name: "scratchsessionsid",
      domain: ".scratch.mit.edu",
      httpOnly: true,
      // Copy other properties from the storage
      expirationDate: session.sid.expirationDate,
      path: session.sid.path,
      secure: session.sid.secure,
      value: session.sid.value,
    });
    await webext.cookies.set({
      url: "https://scratch.mit.edu/",
      // These 3 props won't change
      name: "scratchcsrftoken",
      domain: ".scratch.mit.edu",
      httpOnly: false,
      // Copy other properties from the storage
      expirationDate: session.csrf.expirationDate,
      path: session.csrf.path,
      secure: session.csrf.secure,
      value: session.csrf.value,
    });
    await webext.cookies.set({
      url: "https://scratch.mit.edu/",
      // These 3 props won't change
      name: "permission",
      httpOnly: false,
      sameSite: "lax",
      // Copy other properties from the storage
      expirationDate: session.permission.expirationDate,
      path: session.permission.path,
      secure: session.permission.secure,
      value: session.permission.value,
    });
    return {
      mes: "login",
    };
  }else {
    return {
      mes: "failed login",
    };
  }
}
