import { LightningElement, api, track} from 'lwc';

import getAllReviews from '@salesforce/apex/BoatDataService.getAllReviews';
import { NavigationMixin } from 'lightning/navigation';

export default class BoatReviews extends NavigationMixin(LightningElement) {
  // Private
  boatId;

  @track error;
  @track boatReviews;
  
  isLoading = false;
  
  // Getter and Setter to allow for logic to run on recordId change
  get recordId() { 
    return this.boatId;
  }
  @api
  set recordId(value) {
    console.log('>>>>>> Setting recordId as: ' + value);
    //sets boatId attribute
    //sets boatId assignment
    this.boatId = value;
    //get reviews associated with boatId
    this.getReviews();
  }
  
  // Getter to determine if there are reviews to display
  get reviewsToShow() {
    if (this.boatReviews && this.boatReviews.length >= 1){
      return true;
    } else {
      return false;
    }

  }
  
  // Public method to force a refresh of the reviews invoking getReviews
  @api
  refresh() { 
    console.log('boatReviews.refresh');
    this.getReviews();
  }
  
  // Imperative Apex call to get reviews for given boat
  // returns immediately if boatId is empty or null
  // sets isLoading to true during the process and false when it’s completed
  // Gets all the boatReviews from the result, checking for errors.
  getReviews() {
    console.log('>>>>> BoatReviews.getReviews()');
    if (!this.boatId){
      return;
    } else {
      this.isLoading = true;
      getAllReviews({boatId: this.boatId}) 
        .then (result => {
          this.boatReviews = result;
          this.isLoading = false;
          console.log('>>>>> BoatReviews.getReviews() - got all reviews OK: ' + JSON.stringify(result));

        })
        .catch(error => {
          this.error = error.body.message;
          console.log('>>>>> BoatReviews.getReviews() - error getting reviews ' + this.error);
        })
    }
  }

  // Helper method to use NavigationMixin to navigate to a given record on click
  navigateToRecord(event) { 

    this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: {
                    recordId: event.target.dataset.recordId,
                    objectApiName: 'User',
                    actionName: 'view'
                }
            });

   }
}
