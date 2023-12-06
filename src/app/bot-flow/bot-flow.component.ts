import { Component, ElementRef, EventEmitter, HostListener, Output, Renderer2, ViewChild } from '@angular/core';

@Component({
  selector: 'app-bot-flow',
  templateUrl: './bot-flow.component.html',
  styleUrls: ['./bot-flow.component.scss']
})
export class BotFlowComponent {
  @Output("addTask") addTask: EventEmitter<any> = new EventEmitter();
  @ViewChild("stepper") stepper: any;
  //variables that have selected in their name contain elements the user clicked on
  //variables that the bot automatically selected will have botselected in their name
  isLinear = true;
  activeSelections: any = [];
  botActiveSelections: any = [];
  botSelectedButtons: any = [];
  _eventHandlers: any = {};
  inputTextString: string = "";
  inputClicked = false;
  hoveredElements: Array<HTMLElement> = [];
  highlightedElement: HTMLElement | null = null;
  selectionActive: boolean = false; //whether selection is active or not
  allSelectedInputs: any[] = [];
  stepperLabel: any;


  constructor(private renderer: Renderer2, private el: ElementRef) { }




  panelOpened() {//if panel is opened reset the stepper
    this.resetStepper()
  }

  enterInputText() {// input text child action is selected
    this.stepperLabel = 'Select the input fields';
    this.removeHighlight();
    this.inputClicked = true;
    this.selectionActive = true;
    this.activeSelections = [];
    this.botActiveSelections = [];
  }


  buttonFunctionClicked() {//select button option is clicked
    this.stepperLabel = 'Select the buttons';
    const buttons = document.querySelectorAll(".btn");
    buttons.forEach(button => {
      button.classList.remove("active");
      button.classList.add("disableButton");
    })
    this.selectionActive = true;
    this.activeSelections = []
    this.stepper.next();
  }

  runn() {//run the click function of the selected buttons
    if (this.botSelectedButtons.length) {
      //use tagName + all the classes to select the rest of the similar buttons
      const remainingElementsQuery = this.botSelectedButtons[0].tagName.toLowerCase() + '.' + this.botSelectedButtons[0].classList.value.split(" ").slice(0, -1);
      const extraEl = document.querySelectorAll(remainingElementsQuery);
      this.clearSelections();
      extraEl.forEach((item: any) => {
        if (this.inputClicked) {//if input text was changed then use output function to add the tasks
          this.addTask.emit(this.inputTextString);
        } else {
          item.click();
        }
        item.classList.remove("disableButton");
        item.classList.add("active");
      });
      this.resetStepper();
      this.inputClicked = false;
      this.inputTextString = '';
    }
  }

  resetStepper() {// reset the stepper to the first step
    this.stepper.reset();
    this.selectionActive = true;
    this.removeHighlight()
    this.activeSelections = [];
    this.botSelectedButtons = [];
    this.botActiveSelections = [];
  }

  inputTextChange($event: any) {//change all the inputs values on change
    const remainingElementsQuery = this.botActiveSelections[0].tagName.toLowerCase() + '.' + this.botActiveSelections[0].classList.value.split(" ").slice(0, -1);
    const extraEl = document.querySelectorAll(remainingElementsQuery);
    extraEl.forEach((input: any) => {
      input.value = $event;
    })
  }

  markAllTasks() {
    const isList = this.botActiveSelections[0]?.tagName.toLowerCase() == 'li'
    const childNode = isList ? this.botActiveSelections[0]?.childNodes[1] : this.botActiveSelections[0];
    const childClassList = childNode.classList.value.split(" ");
    let allSimilarChilds;
    if (childClassList.length > 1) {
      allSimilarChilds = childNode.tagName.toLowerCase() + '.' + childClassList;
    } else {
      allSimilarChilds = childNode.tagName.toLowerCase();
    }
    const extraEl = document.querySelectorAll(allSimilarChilds);
    this.clearSelections();
    extraEl.forEach((child: any) => {
      child.click();
    });
    this.removeHighlight();
    this.botActiveSelections = [];
    this.activeSelections = [];
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

  handleSelection(cevent: Event) {
    const clickedElement = cevent.target as HTMLElement;
    // dont proceed further if selection mode is inactive or if the clicked element already has a border dont proceed further
    if (!this.selectionActive || clickedElement.classList.contains('userSelectedBorder')) {
      return;
    }

    if (this.highlightedElement) { // remove the dotted highlight

      this.renderer.removeClass(this.highlightedElement, 'dottedHighlight');
    }

    this.activeSelections.push({
      element: clickedElement,
      tagName: clickedElement.tagName.toLocaleLowerCase()
    });
    clickedElement.classList.add('userSelectedBorder');



    if (this.activeSelections.length < 2) {// if selections are more than 2 then add the remaining items else ignore
      return;
    }

    const firstElement = this.activeSelections[0];
    let remainingElementsQuery;
    if (firstElement.element.classList.contains('userSelectedBorder') && firstElement.element.classList.length > 1) {
      remainingElementsQuery = firstElement.tagName + '.' + firstElement.element.classList.value.split(" ").slice(0, -1);
    } else {//for elements with no class we use the tagname to get them
      remainingElementsQuery = firstElement.tagName;
    }
    const extraEl = document.querySelectorAll(remainingElementsQuery);
    extraEl.forEach(item => {
      if (!item.classList.contains('userSelectedBorder')) {
        item.classList.add('botSelectedBorder');
        this.selectionActive = false;
        if (item.classList.contains('btn-add') || item.classList.contains('delete')) {
          this.botSelectedButtons.push(item)
        } else {
          this.botActiveSelections.push(item);
        }
      }
    });
  }

  @HostListener('document:mousemove', ['$event'])
  handleMouseMove(event: MouseEvent): void {
    //if the panel is opened then add a hover border over elements
    if (this.selectionActive) {
      const el: HTMLElement = event.target as HTMLElement;
      if (this.el.nativeElement.contains(el) || el.classList.contains("botSelectedBorder")) {
        return;
      }
      this.addEvent(el, 'click', (ev: Event) => {//use addEvent function to add the custom click event so we can remove it once done
        if (!this.el.nativeElement.contains(ev.target)) {
          ev.stopImmediatePropagation();
          this.handleSelection(ev);
        }
      }, true);

      if (this.highlightedElement) {
        this.renderer.removeClass(this.highlightedElement, 'dottedHighlight');
        this.hoveredElements.push(this.highlightedElement);
      }

      // Add highlight to the currently hovered element
      this.highlightedElement = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement;
      this.highlightElement(this.highlightedElement);
    }
  }

  highlightElement(element: HTMLElement): void {
    if (element) {
      this.renderer.addClass(element, 'dottedHighlight');
    }
  }

  clearSelections() {//remove all selection borders and custom events
    this.hoveredElements.forEach(item => {
      this.removeAllEvents(item, 'click');
    });
    this.removeHighlight();
    this.selectionActive = false;
  }


  // Remove highlight from all elements
  removeHighlight() {
    const elements = document.querySelectorAll('.botSelectedBorder, .dottedHighlight, .userSelectedBorder');
    elements.forEach((element) => {
      element.classList.remove('botSelectedBorder', 'dottedHighlight', 'userSelectedBorder');
    });
  }


}


