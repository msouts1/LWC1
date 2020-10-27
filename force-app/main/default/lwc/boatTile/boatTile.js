import { LightningElement, api, wire } from 'lwc';
import { APPLICATION_SCOPE, MessageContext, subscribe, unsubscribe } from 'lightning/messageService';
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';

const TILE_WRAPPER_SELECTED_CLASS = 'tile-wrapper selected';
const TILE_WRAPPER_UNSELECTED_CLASS = 'tile-wrapper';

export default class BoatTile extends LightningElement {
    @api boat;
    @api selectedBoatId;
    
    @wire(MessageContext)
    messageContext
    subscription=null;
    receivedMessage;

    
    // Getter for dynamically setting the background image for the picture
    get backgroundStyle() {
        return `background-image: url(${this.boat.Picture__c})`;

     }
    
    // Getter for dynamically setting the tile class based on whether the
    // current boat is selected
    get tileClass() {
        if (this.boat.Id == this.selectedBoatId){
            return TILE_WRAPPER_SELECTED_CLASS;
        } else {
            return TILE_WRAPPER_UNSELECTED_CLASS;
        } 
     }
    
    // Fires event with the Id of the boat that has been selected.
    selectBoat() { 
        console.log ('boat selected ' + this.boat.Id);
        this.selectedBoatId = this.boat.Id;
        const boatEvent = new CustomEvent('boatselect', {detail: {boatId: this.boat.Id} });
        this.dispatchEvent(boatEvent);
    }

    subscribeMC() {
        console.log(">>>> boatTile.subscribeMC ... subscribing to message channel");
        if (this.subscription) {
            return;
        }
        this.subscription = subscribe(
            this.messageContext,
            BOATMC, (message) => {
                this.handleMessage(message);
            },
            {scope: APPLICATION_SCOPE}
            );
    }

    unsubscribeMC() {
        unsubscribe(this.subscription);
        this.subscription = null;
    }


    handleMessage(message) {
        //console.log(">>>>>> boatTile.handleMessage --> message: " + message.recordId);
        this.selectedBoatId = message.recordId;
    }    

    disconnectedCallback() {
        this.unsubscribeMC();
    }
    connectedCallback() {
        this.subscribeMC();
    }

  }
  