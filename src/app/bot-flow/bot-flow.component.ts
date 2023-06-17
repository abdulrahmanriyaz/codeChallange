import { AfterViewInit, Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-bot-flow',
  templateUrl: './bot-flow.component.html',
  styleUrls: ['./bot-flow.component.scss']
})
export class BotFlowComponent implements OnDestroy, AfterViewInit {
  @Output("addTask") addTask: EventEmitter<any> = new EventEmitter();
  //variables that have selected in their name contain elements the user clicked on
  //variables that the bot automatically selected will have botselected in their name
  panelOpenState = false;
  isLinear = true;
  allAddButtons: any = [];
  allSelectedInputs: any = [];
  allSelectedTasks: any = [];
  botSelectedInputs: any = [];
  botSelectedButtons: any = [];
  allInputs: Array<HTMLElement> = [];
  noOptionSelected = true;
  selectedAddButtons: Array<HTMLElement> = [];
  @ViewChild("stepper") stepper: any;
  globalInstance: any;
  _eventHandlers: any = {};
  allTasks: Array<HTMLElement> = [];
  botSelectedTasks: any = [];
  selectedDeleteButton: any = [];
  allDeleteButtons: any = [];
  botSelectedDeleteButtons: any = [];
  inputTextString: string = ""
  inputClicked = false;

  constructor() { }

  ngAfterViewInit() {
    this.allAddButtons = document.querySelectorAll(".btn-add");//store all add task buttons
  }

  ngOnDestroy(): void {
  }


  disableAddButtons() {//disable or enable all buttons depending on the panelOpenState
    this.panelOpenState = !this.panelOpenState;
    if (this.panelOpenState) {
      this.allAddButtons.forEach((element: any) => {
        element.classList.remove("active");
      });
      this.allDeleteButtons.forEach((element: any) => {
        element.classList.add("disableDeleteButton", "disablePointerEvents");
      })
    } else {
      this.allAddButtons.forEach((element: any) => {
        element.classList.add("active");
      });
      this.allDeleteButtons.forEach((element: any) => {
        element.classList.remove("disableDeleteButton", "disablePointerEvents");
      });
      this.allInputs.forEach((element: any) => {
        this.removeAllEvents(element, 'click')
      });
      this.allInputs = []
      this.allSelectedInputs = [];
      this.botSelectedInputs = []
    }
  }

  panelOpened() {//if panel has opened disable all add buttons
    this.stepper.reset();
    this.allInputs = Array.from(document.querySelectorAll('.input-todo'));
    this.allInputs.forEach((element: any) => {//add event listner to allInputs so we can highlight them upon selection
      this.addEvent(element, 'click', (event: Event) => {
        this.selectInput(element);
      }, false);
    });
    this.allDeleteButtons = document.querySelectorAll(".delete");//store all add task buttons
    this.allTasks = Array.from(document.querySelectorAll('.todo-list > li'));
    this.allTasks.forEach((element: any) => {
      element.childNodes.forEach((item: any) => {
        this.addEvent(item, 'click', (event: Event) => {
          if (!item.classList.contains('delete')) {
            event.stopPropagation();
            this.selectTasks(event);
          }
        }, true);
      })
    })
    this.disableAddButtons();
  }

  selectInput(event: any) {//add a green border when an input field is selected
    if (this.panelOpenState) {
      const index = this.allSelectedInputs.findIndex((item: any) => item.value == event.value);
      if (index === -1) {//dont allow adding the same input field twice
        this.allSelectedInputs.push(event);
        event.parentElement.classList.add("userSelectedBorder");
      }
      if (this.allSelectedInputs.length === 2) {//if at least 2 input fields are selected change the text and select the rest automatically
        this.gotoAction("input");
      }
    }
  }

  selectTasks(event: any) {//add a green border when
    if (this.panelOpenState) {
      if (!event.target.classList.contains("userSelectedBorder"))
        this.allSelectedTasks.push(event.target);
      event.target.parentElement.classList.add("userSelectedBorder");
    }
    if (this.allSelectedTasks.length === 2) {//if at least 2 input fields are selected change the text and select the rest automatically
      this.gotoAction("tasks");
    }
  }

  gotoAction(mode: string) {//select the rest of input fields automatically
    if (mode == 'tasks') {
      this.allTasks.forEach(((item: any) => {
        if (!item.classList.contains('userSelectedBorder')) {
          item.classList.add("botSelectedBorder");
          this.botSelectedTasks.push(item.childNodes[0]);
        }
      }));
    } else {
      if (this.allSelectedInputs.length < this.allInputs.length) {
        this.botSelectedInputs = this.allInputs.filter((ar: any) => !this.allSelectedInputs.find((rm: any) => (rm.value === ar.value)))
        this.botSelectedInputs.forEach((item: any) => {//add the blue border class to the auto selected input fields
          item.parentElement.classList.add("botSelectedBorder");
        })
      }
    }
  }


  buttonFunctionClicked() {//select button option is clicked then change text and add event listener so we can select the buttons
    if (this.allSelectedTasks.length) {
      this.allDeleteButtons.forEach((element: any) => {
        // this.addButtonsClone.push(element.cloneNode(true));
        element.classList.remove("disablePointerEvents");
        this.addEvent(element, 'click', (event: Event) => {
          event.stopPropagation();
          this.selectButtonClicked(event);
        }, true);
      });
      // this.selectRestButtons("delete")
    } else {
      this.allAddButtons.forEach((element: any) => {
        // this.addButtonsClone.push(element.cloneNode(true));
        element.classList.add("enablePointerEvents");

        this.addEvent(element, 'click', (event: Event) => {
          // this.renderer.listen(element, 'click', (event: any) => this.selectButton(event));
          event.stopPropagation();
          this.selectButtonClicked(event);
        }, true);
      });
      // this.selectRestButtons("add")
    }
    //   element.addEventListener("click", (event: any) => this.selectButton(event), true);

    this.stepper.next();
  }

  selectButtonClicked(event: any): any {
    if (event.target.classList.contains("delete")) {
      event.target.classList.add("selectButtonUser");
      this.selectedDeleteButton.push(event.target)
      this.selectRestButtons("delete")
    } else {
      event.target.classList.add("selectButtonUser");
      this.selectedAddButtons.push(event.target)
      this.selectRestButtons("add");
    }
  }

  inputText() {
    if (this.allSelectedInputs.length) {
      this.inputClicked = true;
    }
  }

  inputTextChange($event: any) {
    this.allInputs.forEach((input: any) => {
      input.value = $event;
    })
  }


  selectRestButtons(mode: string) {
    if (mode == "add") {
      this.allAddButtons.forEach(((item: any) => {
        if (!item.classList.contains('selectButtonUser')) {
          this.botSelectedButtons.push(item);
        }
      }));
      this.botSelectedButtons.forEach((item: any) => {//add the blue border class to the auto selected buttons fields
        item.classList.add("selectButtonBot");
      });

    } else {
      this.allDeleteButtons.forEach(((item: any) => {
        if (!item.classList.contains('selectButtonUser')) {
          this.botSelectedDeleteButtons.push(item);
        }
      }));
      this.botSelectedDeleteButtons.forEach((item: any) => {//add the blue border class to the auto selected buttons fields
        item.classList.add("selectButtonBot");
      });
    }
  }

  runBot() {
    if (this.selectedAddButtons.length) {//if add button is selected and run is clicked
      let buttons = [...this.selectedAddButtons, ...this.botSelectedButtons];
      this.allAddButtons.forEach((element: any) => {
        element.classList.add("active")
      })
      buttons.forEach((element: any) => {
        this.removeAllEvents(element, "click");
        element.classList.remove("enablePointerEvents", "selectButtonBot", "selectButtonUser");
        if (this.inputClicked) {
          this.addTask.emit(this.inputTextString);
        } else {
          element.click();
        }
      });
      if (this.inputClicked) {
        this.allTasks = Array.from(document.querySelectorAll('.todo-list > li'));
        this.inputClicked = false;
      }
      this.allInputs.forEach((input: any) => {
        input.parentElement.classList.remove("userSelectedBorder", "botSelectedBorder");
      });
      this.selectedAddButtons = [];
      this.botSelectedButtons = [];
    }

    if (this.selectedDeleteButton.length) {//if delete button is selected and run is clicked remove tasks
      let buttons = [...this.selectedDeleteButton, ...this.botSelectedDeleteButtons];
      this.allDeleteButtons.forEach((element: any) => {
        element.classList.remove("disableDeleteButton")
      })
      buttons.forEach((element: any) => {
        this.removeAllEvents(element, "click");
        element.click();
      });
      this.selectedDeleteButton = [];
      this.botSelectedDeleteButtons = [];
    }

    if (this.allSelectedTasks.length && !this.selectedDeleteButton.length) {//if mark all elements is selected
      let buttons = [...this.allSelectedTasks, ...this.botSelectedTasks];
      this.allDeleteButtons.forEach((element: any) => {
        element.classList.remove("disableDeleteButton")
      })
      buttons.forEach((element: any) => {
        this.removeAllEvents(element, "click");
        element.click();
      });
    }
    this.allSelectedTasks = [];
    this.botSelectedTasks = [];
    this.allTasks.forEach(item => {
      item.classList.remove("userSelectedBorder", "botSelectedBorder");
    })
  }



  //Anonymous functions in event listners cant be removed so we collect them in an object
  addEvent(node: any, event: any, handler: any, capture: any) {
    if (!(node in this._eventHandlers)) {
      // _eventHandlers stores references to nodes
      this._eventHandlers[node] = {};
    }
    if (!(event in this._eventHandlers[node])) {
      // each entry contains another entry for each event type
      this._eventHandlers[node][event] = [];
    }
    // capture reference
    this._eventHandlers[node][event].push([handler, capture]);
    node.addEventListener(event, handler, capture);
  }


  //then we remove them all when we no longer need them
  removeAllEvents(node: any, event: any) {
    if (node in this._eventHandlers) {
      var handlers = this._eventHandlers[node];
      if (event in handlers) {
        var eventHandlers = handlers[event];
        for (var i = eventHandlers.length; i--;) {
          var handler = eventHandlers[i];
          node.removeEventListener(event, handler[0], handler[1]);
        }
      }
    }
  }

}


