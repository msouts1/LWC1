import { LightningElement, api, wire, track } from 'lwc';

import getBoatsByLocation from '@salesforce/apex/BoatDataService.getBoatsByLocation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';


const LABEL_YOU_ARE_HERE = 'You are here!';
const ICON_STANDARD_USER = 'standard:user';
const ERROR_TITLE = 'Error loading Boats Near Me';
const ERROR_VARIANT = 'error';
export default class BoatsNearMe extends LightningElement {
  @api boatTypeId;
  @track mapMarkers = [];
  isLoading = true;
  isRendered;
  latitude;
  longitude;
  
  // Add the wired method from the Apex Class
  // Name it getBoatsByLocation, and use latitude, longitude and boatTypeId
  // Handle the result and calls createMapMarkers
  @wire(getBoatsByLocation, {latitude: '$latitude', longitude: '$longitude', boatTypeId: '$boatTypeId'})
  wiredBoatsJSON({error, data}) { 
    if (data){
      console.log("boatsNearMe.getBoatsByLocation --> returned data " + data);
      this.createMapMarkers(data);
    }
    else if (error)
    {
      console.log("boatsNearMe.getBoatsByLocation --> error: " + error);
      this.dispatchEvent(new ShowToastEvent({
        title: ERROR_TITLE,
        message: error.message,
        variant: ERROR_VARIANT,
        })
      );
    }
    this.isLoading = false;
  }
  

  // Controls the isRendered property
  // Calls getLocationFromBrowser()
  renderedCallback() { 
    console.log("boatsNearMe.renderedCallback --> started ");
    if (!this.isRendered){
      this.getLocationFromBrowser();
      this.isRendered = true;
    }
  }
  
  // Gets the location from the Browser
  // position => {latitude and longitude}
  getLocationFromBrowser() { 
    console.log("boatsNearMe.getLocationFromBrowser --> started");
    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
          (position) => {
            this.latitude = position.coords.latitude;
            this.longitude = position.coords.longitude;
            console.log("boatsNearMe.getLocationFromBrowser --> longitude: " + this.longitude + ", latitude: " + this.latitude);
          }
        )
    } else {
      console.log("boatsNearMe.getLocationFromBrowser --> browser not supporting location");
    }


  }
  
  // Creates the map markers
  createMapMarkers(boatData) {
     // const newMarkers = boatData.map(boat => {...});
     // newMarkers.unshift({...});
     
     const newMarkers = boatData.map(boatInfo => {
      return {
        location: {
            Latitude: boatInfo.Geolocation__Latitude__s,
            Longitude: boatInfo.Geolocation__Longitude__s
        },
        title: boatInfo.Name,
      };
    });
    newMarkers.unshift({
      location: {
        Latitude: this.latitude,
        Longitude: this.longitude
      },
      title: LABEL_YOU_ARE_HERE,
      icon: ICON_STANDARD_USER
    });
  
    this.mapMarkers = newMarkers;
  }
}
