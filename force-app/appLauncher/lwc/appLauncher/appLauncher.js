import { LightningElement, api, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';


export default class AppList extends NavigationMixin(LightningElement) {
	@track apps; 
	@api appsConfig; // the JSON string with the config 
	@api bgColourHeader;
	@api bgColour;
	@api title;
	@api titleColour;

    connectedCallback() {
		console.log('>>>>> in connected callback: ' );
		console.log('>>>>> appsConfig: ' + this.appsConfig);
		this.apps = JSON.parse(this.appsConfig);
		console.log('>>>>> apps Object: ' + this.apps);
		console.log('>>>>> apps Object size: ' + this.apps.length);
	}

    handleAppSelected(event) {
		console.log('>>>> received handle app event: ' + event);
		console.log('>>>> received handle app event: ' + event.detail);
        this[NavigationMixin.Navigate]({
            "type": "standard__webPage",
            "attributes": {
                "url": event.detail
            }
        });
	}
	
	get bgColourHeaderStyle() {
        return `background-color: ${this.bgColourHeader}`;
    }
	get titleColourStyle() {
        return `color: ${this.titleColour}`;
    }
	get bgColourStyle() {
        return `background-color: ${this.bgColour}`;
    }
    
}



