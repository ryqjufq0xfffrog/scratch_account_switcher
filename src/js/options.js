const webext = browser || chrome;

addEventListener('load', async () =>{
  // Get all stored data
  const stored = await webext.storage.local.get(null);
  const accUL = document.getElementById("accUL");

  for(const entry in stored) {
    if(!entry.startsWith("@")) continue;
    // Generate <li>...</li>
    const li = document.createElement("li");
    const div = document.createElement("div");
    div.className = "username";
    div.textContent = entry;
    const ebtn = document.createElement("button");
    ebtn.className = "detailsBtn";
    ebtn.textContent = "Edit";
    ebtn.title = "Edit session details";
    const sbtn = document.createElement("button");
    sbtn.className = "detailsBtn hidden";
    sbtn.textContent = "Save";
    sbtn.title = "Save edited session details";
    const ubtn = document.createElement("button");
    ubtn.className = "detailsBtn";
    ubtn.textContent = "Use";
    ubtn.title = `Login as ${ entry }`;
    const del = document.createElement("a");
    del.href = "#";
    del.className = "delBtn";
    del.title = "Forget this session";
    const details = document.createElement("textarea");
    details.className = "details";
    details.value = JSON.stringify(stored[entry]);
    // add elements to the <LI>
    li.appendChild(div);
    li.appendChild(ebtn);
    li.appendChild(sbtn);
    li.appendChild(ubtn);
    li.appendChild(del);
    li.appendChild(details);
    // add the <LI> to the <UL>
    accUL.appendChild(li);
    // onClick handlers
    ebtn.addEventListener('click', () =>{
      ebtn.className = "detailsBtn hidden";
      sbtn.className = "detailsbtn";
      details.className = "details shown";
    });
    sbtn.addEventListener('click', async () =>{
      try {
        const edited = JSON.parse(details.value);
        await webext.storage.local.set({
          [entry]: edited,
        });
        alert("saved");
      }catch {alert("JSON invalid")}
    });
    del.addEventListener('click', async () =>{
      await webext.storage.local.remove(entry);
      accUL.removeChild(li);
    });
    ubtn.addEventListener('click', async () =>{
      if((await webext.runtime.sendMessage({
            method: "login",
            username: entry,
          })).mes === "login") {
        alert(`Successfully logined as ${ entry }`);
      }
    });
  }
  // Save to/Load from file
  document.getElementById("saveBtn").addEventListener("click", () =>{
    const dl = document.createElement("a");
    dl.href = `data:text/plain;charset=utf-8,${ encodeURIComponent(JSON.stringify(stored)) }`;
    dl.download = "sc_acc_switcher.json";
    dl.style.display = "none";
    document.body.appendChild(dl);
    dl.click();
    document.body.removeChild(dl);
  });
  document.getElementById("loadBtn").addEventListener("click", () =>{
    const up = document.createElement("input");
    up.type = "file";
    up.style.display = "none";
    document.body.appendChild(up);
    up.addEventListener("change", async () =>{
      const file = up.files[0];
      if(!file) {
        alert("no file provided");
        return;
      }
      try {
        const raw = await readTextFile(file);
        const readData = JSON.parse(raw);
        await webext.storage.local.clear();
        await webext.storage.local.set(readData);
        // Reload page
        location.reload();
      }catch(e) {alert(`error loading: ${e.toString()}`)}
      document.body.removeChild(up);
    });
    up.click();
  });
});

function readTextFile(file) {
  return new Promise(resolv =>{
    const reader = new FileReader();
    reader.addEventListener('load', () =>{
      resolv(reader.result);
    });
    reader.readAsText(file);
  });
}
