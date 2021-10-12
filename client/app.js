App = {
  contracts: {},
  init: async () => {
    console.log("Loaded");
    await App.loadEthereum();
    await App.loadAccount();
    await App.loadContracts();
    await App.render();
    await App.renderTask();
  },

  loadEthereum: async () => {
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      await window.ethereum.request({ method: "eth_requestAccounts" });
    } else if (window.web3) {
      // Metamask ya no requiere que tengamos instalado web3.
      new Web3(window.web3.currentProvider);
    } else {
      console.log("Try Installing Metamask");
    }
  },

  loadAccount: async () => {
    const account = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    App.account = account[0];
    console.log(App.account);
  },

  loadContracts: async () => {
    const res = await fetch("TasksContract.json");
    const taskContractJSON = await res.json();

    App.contracts.tasksContract = TruffleContract(taskContractJSON);

    App.contracts.tasksContract.setProvider(App.web3Provider);

    App.tasksContract = await App.contracts.tasksContract.deployed();
  },

  render: () => {
    console.log(App.account);
    document.getElementById("account").innerText = App.account;
  },

  renderTask: async () => {
    const taskCounter = await App.tasksContract.taskCounter();
    const taskCounterNumber = taskCounter.toNumber();

    let html = "";

    for (let i = 1; i <= taskCounterNumber; i++) {
      const task = await App.tasksContract.tasks(i);
      const taskId = task[0];
      const taskTitle = task[1];
      const taskDescription = task[2];
      const taskDone = task[3];
      const taskCreated = task[4];

      let taskElement = `
          <div class="card bg-dark rounded-0 mb-2">
              <div class="card-header d-flex justify-content-between aling-item-center"> 
              <span>${taskTitle}</span>
              <div class="form-check form-switch"> 
                <input class="form-check-input" data-id="${taskId}" type="checkbox" ${taskDone && "checked"} onChange="App.toggleDone(this)"/>
              </div>
              </div>
              <div class="card-body">
                <span> ${taskDescription} </span>
                  <p class="text-muted">Task was created ${new Date(taskCreated * 1000).toLocaleString()} </p>
              </div>
          </div>
          `;
      html += taskElement;
    }
    document.querySelector("#taskList").innerHTML = html;
  },

  createTask: async (title, description) => {
    const result = await App.tasksContract.createTask(title, description, {
      from: App.account,
    });
    console.log(result.logs[0].args);
  },

  toggleDone: async(element)=> {
        const taskId = element.dataset.id

        await App.tasksContract.toggleDone(taskId, {
          from: App.account
        })

        window.location.reloaded
  }
};
