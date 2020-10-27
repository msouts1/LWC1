import { LightningElement, api, wire, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { updateRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import getBoats from '@salesforce/apex/BoatDataService.getBoats';
import { MessageContext, publish } from 'lightning/messageService';
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';

const COLS = [
    { label: 'Name', fieldName: 'Name', editable: true },
    { label: 'Length', fieldName: 'Length__c', type: 'number', editable: true },
    { label: 'Price', fieldName: 'Price__c', type: 'currency', editable: true },
    { label: 'Description', fieldName: 'Description__c', editable: true },
];
const SUCCESS_TITLE = 'Success';
const MESSAGE_SHIP_IT = 'Ship it!';
const SUCCESS_VARIANT = 'success';
const ERROR_TITLE   = 'Error';
const ERROR_VARIANT = 'error';

export default class BoatSearchResults extends LightningElement {
    boatTypeId = '';
    @track boats;
    @track draftValues = [];
    selectedBoatId = '';
    isLoading = false;
    wiredBoatsResult;
    columns = COLS;
    
    // wired message context
    @wire(MessageContext) messageContext;
    
    
    @wire(getBoats, {boatTypeId: '$boatTypeId'})
    wiredBoats(result) { 
        this.wiredBoatsResult = result;
        this.boats = result;
        this.notifyLoading(false);
    }
    

    // public function that updates the existing boatTypeId property
    // uses notifyLoading
    @api
    searchBoats(boatTypeId) {
        console.log('>>>>> got boat type Id: ' + boatTypeId);
        this.notifyLoading(true);
        this.boatTypeId = boatTypeId;
    }
    

    // this public function must refresh the boats asynchronously
    // uses notifyLoading
    @api
    async refresh() { 
        console.log(">>>>> REFRESH STARTING <<<<<");
        this.notifyLoading(true);
        await refreshApex(this.boats);
        this.notifyLoading(false);
        console.log(">>>>> REFRESH DONE <<<<<");
    }
    
    // this function must update selectedBoatId and call sendMessageService
    updateSelectedTile(event) { 
        console.log(">>>>>> boatSearchResults - selected boat Id " + event.detail.boatId)
        this.selectedBoatId = event.detail.boatId;
        this.sendMessageService(this.selectedBoatId);

    }
    
    // Publishes the selected boat Id on the BoatMC.
    sendMessageService(boatId) { 
        const message = {
            recordId: boatId
        };
        publish(this.messageContext, BOATMC, message);
        console.log(">>>>> boatSearchResults.sendMessageService --> published message: " + JSON.stringify(message));
    }
    
    // This method must save the changes in the Boat Editor
    // Show a toast message with the title
    // clear lightning-datatable draft values
    handleSave(event) {
        this.notifyLoading(true);
        const recordInputs =  event.detail.draftValues.slice().map(draft => {
            const fields = Object.assign({}, draft);
            return { fields };
        });
        
        const promises = recordInputs.map(recordInput => updateRecord(recordInput));
        Promise.all(promises).then( () => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: SUCCESS_TITLE,
                    message: MESSAGE_SHIP_IT,
                    variant: SUCCESS_VARIANT
                })
            );
            console.log(">>>>> save all good <<<<<");
            this.draftValues = [];
            this.refresh();
        })
        .catch(error => {
            this.dispatchEvent(new ShowToastEvent({
                    title: ERROR_TITLE,
                    message: error.body.message,
                    variant: ERROR_VARIANT
                })
            );
            this.notifyLoading(false);
        })
        .finally(() => {
            this.draftValues = [];
        });
    }

    // Check the current value of isLoading before dispatching the doneloading or loading custom event
    notifyLoading(isLoading) { 
        this.isLoading = isLoading;
        if(isLoading){
            this.dispatchEvent(new CustomEvent('loading'));
        } else {
            this.dispatchEvent(new CustomEvent('doneloading'));
        }
    }


}
  