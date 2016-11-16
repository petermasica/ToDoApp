(function() {
	// Cache DOM
	var appCore = document.getElementById("appCore");
	var listNameField = appCore.querySelector("#listName");

	var listNameInput = document.getElementById("listNameInput");
	var newOpenButton = document.getElementById("newOpenButton");
	
	// Bind events
	newOpenButton.addEventListener("click", newOpenList);


	function newOpenList(e) {
		e.preventDefault();

		var listName = listNameInput.value;

		if (!listName) {
			alert("List name required");
			return;
		}

		var isListStored = localStorage.getItem(listName);

		if (!isListStored)
			localStorage.setItem(listName, JSON.stringify([]))

		// Exposing listName for use by loadSavedTasks() from the listNameOptionModule
		window.listName = listName;

		listNameField.innerText = window.listName;
		loadSavedTasks();

		listNameInput.value = "";

		listNameInput.parentElement.className = "hidden";
		appCore.classList.remove("hidden");
	}
}())