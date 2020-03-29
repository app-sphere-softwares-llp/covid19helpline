import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { NzNotificationService } from 'ng-zorro-antd';
import { GeneralService } from '../../shared/services/general.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'nest-js-boiler-plate-new-pass',
  templateUrl: './new-pass.component.html',
  styleUrls: ['./new-pass.component.scss']
})
export class NewPassComponent implements OnInit {

  public applicationForm: FormGroup;
  public requestId:string;
  public dateFormat = 'MM/dd/yyyy';

  // doc upload
  public uploadedImages = [];
  public attachementHeader: any;
  public attachementUrl: string;
  public attachementIds: string[] = [];
  // doc upload end


  public selectedReason:any;
  public selectedState:any;
  public selectedCity:any;
  public selectedPurpose:any;

  public cityDataSource: any[] = [{
    name:'Indore',
    id:'10',
  }];

  public stateDataSource: any[] = [{
    name:'Madhya Pradesh',
    id:'23',
  }];

  public reasonDataReason: any[] = [{
    name:'Medical',
    id:'23',
  }];

  public purposeDataReason: any[] = [
    {
      name:'Medical emergency',
      id:'1',
    },
    {
    name:'Police complaint',
    id:'2',
    },
    {
      name:'Doctors appointment',
      id:'3',
    }];

  public isSearchingState: boolean;
  public isSearchingCity: boolean;
  public isSearchingReason:boolean;
  public isSearchingPurpose: boolean;

  public modelChangedState = new Subject<string>();
  public modelChangedCity = new Subject<string>();
  public modelChangedReason = new Subject<string>();
  public modelChangedPurpose = new Subject<string>();

  constructor(private FB: FormBuilder, protected notification: NzNotificationService,
              private _generalService: GeneralService, private _activatedRouter: ActivatedRoute) {
    this.notification.config({
      nzPlacement: 'bottomRight'
    });
  }

  ngOnInit() {

    this.requestId = this._activatedRouter.snapshot.params.requestId;

    if (this.requestId) {
      this.getPassRequest();
    }

    this.attachementUrl = '';

    this.attachementHeader = {
      Authorization: 'Bearer ' + this._generalService.token
    };


    this.applicationForm = this.FB.group({
      firstName: [null, [Validators.required]],
      lastName: [null, [Validators.required]],
      city: [null, [Validators.required]],
      state: [null, [Validators.required]],
      aadhar: [null, [Validators.required]],
      PIN: [null, [Validators.required]],
      address: [null, [Validators.required]],
      mobile: [null, [Validators.required]],
      passDate: [null, [Validators.required]],
      purpose: [null, [Validators.required]],
      vehicleNumber: [null, [Validators.required]],
      reasonCode: [null, [Validators.required]],
      reasonDetails: [null, [Validators.required]],
      destinationPIN: [null, [Validators.required]],
      destinationAreaAddress: [null, [Validators.required]],
      personsWithMe :[[]],
      profilePic :[null, [Validators.required]],
      aadharPic :[null, [Validators.required]],
      supportingDocs :[[], [Validators.required]],
      travellerName :[null],
      travellerAadhar :[null],
    });



    // search state
    this.modelChangedState
      .pipe(
        debounceTime(500))
      .subscribe(() => {
        const queryText = this.applicationForm.get('state').value;
        const name = this.selectedState.name
        if (!queryText || this.applicationForm.get('state').value === name) {
          return;
        }
        this.isSearchingState = true;
        const json = {
          stateId: this.selectedState.id,
          query : queryText
        }
        // this._locationService.searchState(json).subscribe((data) => {
        //   this.isSearchingState = false;
        //   this.stateDataSource = data.data;
        // });

      });
    // end search state

    // search city
    this.modelChangedCity
      .pipe(
        debounceTime(500))
      .subscribe(() => {
        const queryText = this.applicationForm.get('city').value;
        const name = this.selectedState.name
        if (!queryText || this.applicationForm.get('city').value === name) {
          return;
        }
        this.isSearchingCity = true;
        const json = {
          stateId: this.selectedCity.id,
          query : queryText
        }
        // this._locationService.searchState(json).subscribe((data) => {
        //   this.isSearchingState = false;
        //   this.cityDataSource = data.data;
        // });

      });
    // end search city


    // search state
    this.modelChangedReason
      .pipe(
        debounceTime(500))
      .subscribe(() => {
        const queryText = this.applicationForm.get('reasonCode').value;
        const name = this.selectedReason.name
        if (!queryText || this.applicationForm.get('reasonCode').value === name) {
          return;
        }
        this.isSearchingReason = true;
        const json = {
          stateId: this.selectedReason.id,
          query : queryText
        }
        // this._locationService.searchState(json).subscribe((data) => {
        //   this.isSearchingReason = false;
        //   this.reasonDataSource = data.data;
        // });

      });
    // end search state

    // search state
    this.modelChangedPurpose
      .pipe(
        debounceTime(500))
      .subscribe(() => {
        const queryText = this.applicationForm.get('purpose').value;
        const name = this.selectedReason.name
        if (!queryText || this.applicationForm.get('purpose').value === name) {
          return;
        }
        this.isSearchingPurpose = true;
        const json = {
          stateId: this.selectedPurpose.id,
          query : queryText
        }
        // this._locationService.searchState(json).subscribe((data) => {
        //   this.isSearchingPurpose = false;
        //   this.purposeDataSource = data.data;
        // });

      });
    // end search purpose


  }


  public getPassRequest() {

  }

  public selectStateTypeahead(state: any) {
    if (state && state.id) {
      this.selectedState = state;
      this.applicationForm.get('state').patchValue(state.name);
    }
    this.modelChangedState.next();
  }


  public selectCityTypeahead(city: any) {
    if (city && city.id) {
      this.selectedCity = city;
      this.applicationForm.get('city').patchValue(city.name);
    }
    this.modelChangedCity.next();
  }

  public selectReasonTypeahead(reason: any) {
    if (reason && reason.id) {
      this.selectedCity = reason;
      this.applicationForm.get('reasonCode').patchValue(reason.name);
    }
    this.modelChangedReason.next();
  }

  public selectPurposeTypeahead(purpose: any) {
    if (purpose && purpose.id) {
      this.selectedPurpose = purpose;
      this.applicationForm.get('purpose').patchValue(purpose.name);
    }
    this.modelChangedPurpose.next();
  }



  handleChange({ file, fileList }): void {
    const status = file.status;
    if (status !== 'uploading') {
      console.log(file, fileList);
    }
    if (status === 'done') {

      if (file.response && file.response.data.id) {
        this.attachementIds.push(file.response.data.id);
      }

      this.notification.success('Success', `${file.name} file uploaded successfully.`);
    } else if (status === 'error') {
      this.notification.error('Error', `${file.name} file upload failed.`);
    }
  }

  handleRemove = (file: any) => new Observable<boolean>((obs) => {

    this.attachementIds.splice(this.attachementIds.indexOf(file.id), 1);
    this.uploadedImages = this.uploadedImages.filter((ele) => {
      if (ele.id !== file.id) {
        return ele;
      }
    });
    obs.next(false);
  });



  public saveForm() {

  }

}
