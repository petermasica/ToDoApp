(function() {
	var taskArray = [];
	var id = 0;

	function Task(completeByDateObj) {
		this.id = id++,
		this.content = taskInput.value,
		this.completeBy = completeByDateObj,
		this.created = new Date(),
		this.modified = ""
	}

	// Cache DOM
	var listNameOption = document.getElementById("listNameOption");
	var listNameInput = listNameOption.querySelector("#listNameInput");

	var appCore = document.getElementById("appCore");
	var taskInput = appCore.querySelector("#taskInput");
	var completeByInput = appCore.querySelector("#completeByInput");
	var addButton = appCore.querySelector("#addButton");
	var switchListButton = appCore.querySelector("#switchListButton");
	var toDoList = appCore.querySelector("#toDoList");

	// Bind events
	addButton.addEventListener("click", validateInputs);
	switchListButton.addEventListener("click", switchList);

	taskInput.addEventListener("keyup", validateInputs);
	taskInput.addEventListener("blur", validateInputs);

	completeByInput.addEventListener("keyup", dateSlasher);
	completeByInput.addEventListener("keyup", validateInputs);
	completeByInput.addEventListener("blur", validateInputs);

	// Functions
	function addTask() {
		var taskObj = new Task(dateInputToDateObj(completeByInput.value));

		taskArray.push(taskObj);
		sortByDeadline();
		render();

		saveTasks();
	}

	// Render
	function render() {
		while (toDoList.firstChild)
			toDoList.removeChild(toDoList.firstChild);

		for (var i = 0; i < taskArray.length; i++)
			appendTask(taskArray[i]);
	}

	function appendTask(taskObj) {
		var task = document.createElement("li");
		task.setAttribute("data-id", taskObj.id);

		task.appendChild(createReadingView(taskObj));
		task.appendChild(createEditingView(taskObj));

		toDoList.appendChild(task);
	}

	// Views creation
	function createReadingView(taskObj) {
		var readingView = document.createElement("div");
		readingView.className = "readingView";

		readingView.appendChild(createTaskCompleteByField(taskObj.completeBy));
		readingView.appendChild(createTaskControls());
		readingView.appendChild(createTaskContentField(taskObj.content));
		readingView.appendChild(createTaskDateOfCreationField(taskObj.created));
		readingView.appendChild(createTaskModifiedField(taskObj.modified));

		return readingView;
	}

	function createEditingView(taskObj) {
		var editingView = document.createElement("div");
		editingView.className = "editingView";
		editingView.classList.add("hidden");

		var contentField = document.createElement("div");
		contentField.className = "content";
		contentField.innerHTML = "<span class=\"taskInputError\"></span>";
		contentField.innerHTML += "Your Task: <input type=\"text\">";
		var contentFieldInput = contentField.querySelector("input");
		contentFieldInput.className = "taskInput";
		contentFieldInput.value = taskObj.content;


		var completeByField = document.createElement("div");
		completeByField.className = "completeBy";
		completeByField.innerHTML = "<span class=\"completeByInputError\"></span>";
		completeByField.innerHTML += "Complete by: <input type=\"text\">";
		var completeByFieldInput = completeByField.querySelector("input");
		completeByFieldInput.className = "completeByInput";
		completeByFieldInput.size = "10";
		completeByFieldInput.maxLength = "10";
		completeByFieldInput.placeholder = "dd/mm/yyyy";
		completeByFieldInput.value = toDdMmYyyyFormat(taskObj.completeBy);

		var controlsField = document.createElement("div");
		controlsField.className = "controls";

		var updateButton = document.createElement("a");
		updateButton.className = "updateButton";
		updateButton.href = "#";
		var updateButtonFAIcon = '<i class="icon-ok"></i>';
		updateButton.innerHTML = updateButtonFAIcon;
		controlsField.appendChild(updateButton);

		editingView.appendChild(controlsField);
		editingView.appendChild(contentField);
		editingView.appendChild(completeByField);

		// Bind events
		contentFieldInput.addEventListener("keyup", validateInputs);
		contentFieldInput.addEventListener("blur", validateInputs);

		completeByFieldInput.addEventListener("keyup", dateSlasher);
		completeByFieldInput.addEventListener("keyup", validateInputs);
		completeByFieldInput.addEventListener("blur", validateInputs);

		updateButton.addEventListener("click", validateInputs); 

		return editingView;
	}

	// Task fields creation
	function createTaskCompleteByField(time) {
		var completeByField = document.createElement("div");
		completeByField.className = "completeBy";
		var completeByFieldContent = "Complete by: <span class=\"timestamp\"></span>";
		completeByField.innerHTML = completeByFieldContent;

		var timestamp = completeByField.querySelector(".timestamp");
		timestamp.appendChild(document.createTextNode(toDdMmYyyyFormat(time)));

		return completeByField;
	}
	
	function createTaskControls() {
		var controls = document.createElement("div");
		controls.className = "controls";

		var editButton = document.createElement("a")
		editButton.className = "edit";
		editButton.href = "#";
		var editButtonFAIcon = '<i class="icon-pencil"></i>';
		editButton.innerHTML = editButtonFAIcon;

		var deleteButton = document.createElement("a");
		deleteButton.className = "delete"
		deleteButton.href = "#";
		var deleteButtonFAIcon = '<i class="icon-trash-empty"></i>';
		deleteButton.innerHTML = deleteButtonFAIcon;

		controls.appendChild(editButton);
		controls.appendChild(deleteButton);

		// Bind events for freshly created buttons
		editButton.addEventListener("click", edit);
		deleteButton.addEventListener("click", removeTask)

		return controls;
	}
	
	function createTaskContentField(content) {
		var contentField = document.createElement("div");
		contentField.className = "content"
		content = document.createTextNode(content);
		contentField.appendChild(content);

		return contentField;
	}

	function createTaskDateOfCreationField(time) {
		var dateOfCreationField = document.createElement("div");
		dateOfCreationField.className = "created";
		var dateOfCreationFieldContent = "Created: <span class=\"timestamp\"></span";
		dateOfCreationField.innerHTML = dateOfCreationFieldContent;

		var timestamp = dateOfCreationField.querySelector(".timestamp");
		timestamp.appendChild(document.createTextNode(toDdMmYyyyFormat(time, true)));

		return dateOfCreationField;
	}

	function createTaskModifiedField(loaded) {
		var modifiedField = document.createElement("div");
		modifiedField.className = "modified hidden";

		var modifiedFieldContent = "Modified: <span class=\"timestamp\"></span>";
		modifiedField.innerHTML = modifiedFieldContent;

		if (loaded) {
			modifiedField.classList.remove("hidden");
			var timestamp = modifiedField.querySelector(".timestamp");
			timestamp.innerHTML = toDdMmYyyyFormat(loaded, true);
		}

		return modifiedField;
	}

	// Task editing
	function edit(e) {
		e.preventDefault();

		var readingView = this.parentElement.parentElement;
		var editingView = readingView.nextElementSibling;

		readingView.classList.add("hidden");
		editingView.classList.remove("hidden");

		editingView.querySelector(".content input").focus();
	}

	function update(currentTaskEditingView) {
		var editingView = currentTaskEditingView;
		var contentInput = editingView.querySelector(".content input");
		var completeByInput = editingView.querySelector(".completeBy input");
		
		// Retrieving updated data
		var updatedContent = contentInput.value;
		var updatedCompleteByDateObj = dateInputToDateObj(completeByInput.value);

		// Retrieving original data
		var objId = parseInt(editingView.parentElement.getAttribute("data-id"));
		var objIndex = findObject(objId);
		var originalContent = taskArray[objIndex].content;
		var originalCompleteByDateObj = taskArray[objIndex].completeBy;

		var readingView = editingView.previousSibling;
			
		if (updatedContent === originalContent && updatedCompleteByDateObj.getTime() === originalCompleteByDateObj.getTime()) {
			editingView.classList.add("hidden");
			readingView.classList.remove("hidden");
			return;
		}

		// Updating content field
		if (updatedContent !== originalContent) {
			var readingViewContentTextNode = readingView.querySelector(".content").childNodes[0];
			readingViewContentTextNode.nodeValue = updatedContent;
		}

		// Updating completeBy field
		if (updatedCompleteByDateObj.getTime() !== originalCompleteByDateObj.getTime()) {
			var readingViewCompleteByField = readingView.querySelector(".completeBy span").childNodes[0];
			readingViewCompleteByField.nodeValue = completeByInput.value;

			var sortAndRenderNeeded = true;
		}

		// Updating modified field
		var modifiedField = readingView.querySelector(".modified");
		modifiedField.classList.remove("hidden");
		var updatedTime = new Date();
		var timestamp = modifiedField.querySelector(".timestamp");
		timestamp.innerHTML = toDdMmYyyyFormat(updatedTime, true);

		editingView.classList.add("hidden");
		readingView.classList.remove("hidden");

		// Updating object
		taskArray[objIndex].content = updatedContent;
		taskArray[objIndex].modified = updatedTime;
		taskArray[objIndex].completeBy = updatedCompleteByDateObj;

		if (sortAndRenderNeeded) {
			sortByDeadline();
			render();
		}

		saveTasks();
	}

	// Find the object
	function findObject(id) {
		for (var i = 0; i < taskArray.length; i++) {
			if (taskArray[i].id === id)
				return i;
		}
	}

	// Task removal
	function removeTask(e) {
		e.preventDefault();

		var task = this.parentElement.parentElement.parentElement;
		var id = parseInt(task.getAttribute("data-id"), 10);

		task.remove();
		deleteTaskObj(id);

		saveTasks();
	}

	function deleteTaskObj(id) {
		taskArray.splice(findObject(id), 1);
	}

	// Date functions 
	function dateInputToDateObj(dateInput) {
		/* dateInput formate: dd/mm/yyyy */
		var date = dateInput.split("/");
		var day = parseInt(date[0], 10);
		var month = parseInt(date[1], 10) - 1;
		var year = parseInt(date[2], 10);
		var hour = 24;

		var convertedInput = new Date(year, month, day, 23, 59, 59, 999);

		return convertedInput;
	}

	function toDdMmYyyyFormat(dateObj, hms) { // hms = hours minutes seconds
		var date = dateObj.getDate() <= 9 ? "0" + dateObj.getDate() : dateObj.getDate();
		var month = (dateObj.getMonth() + 1) <= 9 ? "0" + (dateObj.getMonth() + 1) : (dateObj.getMonth() + 1);
		var year = dateObj.getFullYear() <= 9 ? "0" + dateObj.getFullYear() : dateObj.getFullYear();

		if (hms) {
			var hours = dateObj.getHours() <= 9 ? "0" + dateObj.getHours() : dateObj.getHours();
			var minutes = dateObj.getMinutes() <= 9 ? "0" + dateObj.getMinutes() : dateObj.getMinutes();
			var seconds = dateObj.getSeconds() <= 9 ? "0" + dateObj.getSeconds() : dateObj.getSeconds();

			return date + "/" + month + "/" + year + ", " + hours + ":" + minutes + ":" + seconds;
		}

		return date + "/" + month + "/" + year;
	}

	// Function for date slash insertion
	function dateSlasher() {
		var dateValue = this.value;

		var pattern1 = /^\d\d$/;
		var pattern2 = /^\d\d\/\d\d$/;


		if (pattern1.test(dateValue) || pattern2.test(dateValue))
			this.value += "/";
	}

	// Input validation
	function checkInput(input) {
		var errorField = input.previousElementSibling;

		if (input.id === "completeByInput")
				errorField = input.previousElementSibling.previousElementSibling;

		if (input.value === "") {
			errorField.innerHTML = "Field required";
			return false;
		}
		else {
			var errorMessage = "";

			if (input.id === "completeByInput" || input.className === "completeByInput") {
				var datePattern = /^(((0[1-9]|[12]\d|3[01])\/(0[13578]|1[02])\/((19|[2-9]\d)\d{2}))|((0[1-9]|[12]\d|30)\/(0[13456789]|1[012])\/((19|[2-9]\d)\d{2}))|((0[1-9]|1\d|2[0-8])\/02\/((19|[2-9]\d)\d{2}))|(29\/02\/((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))))$/g;


				if (!datePattern.test(input.value))
					errorMessage = "Requires dd/mm/yyyy format";
			}

			errorField.innerHTML = errorMessage;

			if (errorMessage !== "")
				return false;
		}

		return true;
	}

	function validateInputs(e) {
		e.preventDefault();

		if (e.type === "blur") {
			checkInput(this);
		}
		else if (e.which === 13 || e.type === "click") {
			var container = this.parentElement.parentElement;

			if (e.type === "click") {
				if (this.id === "addButton")
					container = this.parentElement;
				else
					container = this.parentElement.parentElement;
			}

			var containerId = container.getAttribute("id");
			var inputs = container.querySelectorAll("input");
			var valid = true;

			for (var i = 0; i < inputs.length; i++) {
				if (checkInput(inputs[i]) === false) {
					valid = false;
				}
			}

			if (containerId) {
				if (valid) {
					addTask();
					completeByInput.removeEventListener("blur", validateInputs);
					clearInputs();
					completeByInput.addEventListener("blur", validateInputs);
				}
			}
			else if (valid) {
				var editView = this.parentElement.parentElement;
				update(editView);
			}

			function clearInputs() {
				for (var i = 0; i < inputs.length; i++) {
					inputs[i].value = "";
					inputs[i].blur();
				}
			}
		}
	}

	// sortByDeadline
	function sortByDeadline() {
		if (taskArray.length > 1) {
			taskArray.sort(function(task1, task2) {
				return task1.completeBy.getTime() - task2.completeBy.getTime();
			});
		}
	}

	// Storage
	function saveTasks() {
		var toBeStored = JSON.stringify(taskArray);
		localStorage.setItem(listName + "NextTaskId", id);
		localStorage.setItem(listName, toBeStored);
	}

	function loadSavedTasks() {
		var jsonTasks = localStorage.getItem(listName);
		taskArray = JSON.parse(jsonTasks);
		
		if 	(taskArray.length === 0)
			id = 0;
		else {
			id = localStorage.getItem(listName + "NextTaskId");

			// Revive Date objects after parsing JSON
			for (var i = 0; i < taskArray.length; i++) {
				var task = taskArray[i];
				task.completeBy = new Date(task.completeBy);
				task.created = new Date(task.created);
				if (task.modified)
					task.modified = new Date(task.modified);
			}		
		}
		render();
	}

	// Switch list
	function switchList(e) {
		e.preventDefault();

		appCore.classList.add("hidden");
		listNameOption.classList.remove("hidden");
		listNameInput.focus();
	}

	// Exposing loadSavedTasks function
	window.loadSavedTasks = loadSavedTasks;
})();