/**
 * Top5ListController.js
 * 
 * This file provides responses for all user interface interactions.
 * 
 * @author McKilla Gorilla
 * @author ?
 */
export default class Top5Controller {
    constructor() {

    }

    setModel(initModel) {
        this.model = initModel;
        this.initHandlers();
    }

    //mabe doesnt' belong here but lol
    allowDrop(ev) {
        ev.preventDefault();
    }

    drag(ev, item) {
        if(item.innerHTML.length != 0){
            ev.dataTransfer.setData(item, ev.target.id);
        }
    }

    drop(ev, item) {
        if(item.innerHTML.length != 0){
            ev.preventDefault();
            var data = ev.dataTransfer.getData(item);
            if(data[5]!=item.id[5]){
                this.dropItem(this.model.currentList, data[5],item.id[5]);
            }
 //       this.model.addChangeItemTransaction(i-1, this.model.currentList.getItemAt(i)); //
            this.model.sortLists();
            this.model.loadList(this.model.currentList.id);
        }
    }
    dropItem(arr, dropper, replaced){
        arr.moveItem(dropper-1,replaced-1);
        this.model.saveLists();
    }
    getCurrentList(){
        return this.model.currentList;
    }
    //yea

    initHandlers() {
        // SETUP THE TOOLBAR BUTTON HANDLERS
        document.getElementById("add-list-button").onmousedown = (event) => {
            if(document.getElementById("item-1").innerHTML.length == 0){
                let newList = this.model.addNewList("Untitled", ["?","?","?","?","?"]);            
                this.model.loadList(newList.id);
                this.model.saveLists();
            }
        }
        document.getElementById("undo-button").onmousedown = (event) => {
            this.model.undo();
        }
        document.getElementById("redo-button").onmousedown = (event) => {
            this.model.redo();
        }
        document.getElementById("close-button").onmousedown = (event) => {
            this.model.close();
        }

        // SETUP THE ITEM HANDLERS
        for (let i = 1; i <= 5; i++) {
            let item = document.getElementById("item-" + i);
            
            item.ondrop = (event) => {
                this.drop(event, item)
            }
            item.ondragover = (event) => {
                this.allowDrop(event);
            }
            item.draggable = (event) => {
                item.setAttribute("true");
            }
            item.ondragstart = (event) => {
                this.drag(event, item);
            }

            // AND FOR TEXT EDITING
            item.ondblclick = (ev) => {
                if (this.model.hasCurrentList()) {
                    // CLEAR THE TEXT
                    item.innerHTML = "";

                    // ADD A TEXT FIELD
                    let textInput = document.createElement("input");
                    textInput.setAttribute("type", "text");
                    textInput.setAttribute("id", "item-text-input-" + i);
                    textInput.setAttribute("value", this.model.currentList.getItemAt(i-1));

                    setTimeout(function(){
                        textInput.focus();
                    }, 0);
                    item.appendChild(textInput);
                    
                    //didnt write this but not sure what this does
                    textInput.ondblclick = (event) => {
                        this.ignoreParentClick(event);
                    }

                    textInput.onkeydown = (event) => {
                        if (event.key === 'Enter') {
                            this.model.addChangeItemTransaction(i-1, event.target.value);
                        }
                    }
                    textInput.onblur = (event) => {
                        //added start
                        this.model.addChangeItemTransaction(i-1, event.target.value);
                        //added end
                        this.model.restoreList();
                    }
                }
            }
        }
    }

    registerListSelectHandlers(id) {
        // FOR SELECTING THE LIST
        document.getElementById("top5-list-" + id).onmousedown = (event) => {
            this.model.unselectAll();

            // GET THE SELECTED LIST
            this.model.loadList(id);
        }
        // FOR DELETING THE LIST
        document.getElementById("delete-list-" + id).onmousedown = (event) => {
            this.ignoreParentClick(event);
            // VERIFY THAT THE USER REALLY WANTS TO DELETE THE LIST
            let modal = document.getElementById("delete-modal");
            this.listToDeleteIndex = id;
            let listName = this.model.getList(id).getName();
            let deleteSpan = document.getElementById("delete-list-span");
            deleteSpan.innerHTML = "";
            deleteSpan.appendChild(document.createTextNode(listName));
            modal.classList.add("is-visible");
            //added start
            let deleteButton = document.getElementById("dialog-confirm-button");
            deleteButton.onclick = (event) => {
                this.model.deleteList(id);
                document.getElementById('delete-modal').classList.remove('is-visible');
            }
            //added end
            
        }
        document.getElementById("top5-list-" + id).ondblclick = (ev) => {
            // CLEAR THE TEXT
            document.getElementById("top5-list-" + id).innerHTML = "";

            // ADD A TEXT FIELD
            let textInput = document.createElement("input");
            textInput.setAttribute("type", "text");
            textInput.setAttribute("id", "list-text-input-" + id);
            textInput.setAttribute("value", this.model.getList(id).getName());
            
            setTimeout(function(){
                textInput.focus();
            }, 0);

            document.getElementById("top5-list-" + id).appendChild(textInput);
            
            //didnt write this but not sure what this does
            textInput.ondblclick = (event) => {
                this.ignoreParentClick(event);
            }

            textInput.onkeydown = (event) => {
                if (event.key === 'Enter') {
                    if(event.target.value==""){
                        event.target.value="Untitled";
                    }
                    this.model.getList(id).setName(event.target.value);
                    this.model.loadList(id);
                    this.model.sortLists();
                    this.model.saveLists();
                }
            }
            textInput.onblur = (event) => {
                if(event.target.value==""){
                    event.target.value="Untitled";
                }
                this.model.getList(id).setName(event.target.value);
                this.model.loadList(id);
                this.model.sortLists();
                this.model.saveLists(); 
            }
        }
    }

    ignoreParentClick(event) {
        event.cancelBubble = true;
        if (event.stopPropagation) event.stopPropagation();
    }
}