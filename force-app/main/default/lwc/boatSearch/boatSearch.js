import { LightningElement, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

 export default class BoatSearch extends NavigationMixin(LightningElement) {
    @track isLoading = false;
    
    // Handles loading event
    handleLoading() {
        this.isLoading = true
     }
    
    // Handles done loading event
    handleDoneLoading() { 
        this.isLoading = false;
    }
    
    // Handles search boat event
    // This custom event comes from the form
    searchBoats(event) {
        const boatTypeId = event.detail.boatTypeId;
        console.log(">>>>> boatSearch.searchBoats --> boat Id = " + boatTypeId);
        this.template.querySelector('c-boat-search-results').searchBoats(boatTypeId);
    }
    
    createNewBoat() { 
        console.log(">>>> create new boat button clicked");
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Boat__c',
                actionName: 'new',
            },
        });
    }
  }
  