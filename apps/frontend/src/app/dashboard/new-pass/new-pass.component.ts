import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { NzNotificationService, UploadFile } from 'ng-zorro-antd';
import { GeneralService } from '../../shared/services/general.service';
import { ActivatedRoute } from '@angular/router';
import { PassService } from '../../shared/services/pass/pass.service';

@Component({
  selector: 'nest-js-boiler-plate-new-pass',
  templateUrl: './new-pass.component.html',
  styleUrls: ['./new-pass.component.scss']
})
export class NewPassComponent implements OnInit {

  public isRequestInProcess:boolean;

  public applicationFormData:any;
  public applicationForm: FormGroup;
  public requestId:string;
  public dateFormat = 'MM/dd/yyyy';

  // upload profile pic
  public loadingProfilePic = false;
  public avatarUrl: string;


  // upload aadhar
  public loadingAadharPic = false;
  public aadharUrl: string;


  // doc upload
  public attachementHeader: any;
  public attachementUrl: string;
  public uploadedImages = [];
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
              private _generalService: GeneralService,
              private _passService : PassService ,private _activatedRouter: ActivatedRoute) {
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


    // initializing form
    this.initForm();


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


  // initializing form
  public initForm() {

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
    this.uploadedImages = [];
    this.attachementIds = [];

  }


  // Getting existing request (view mode)
  public getPassRequest() {
    this.isRequestInProcess = true;
    const json:any  = {
      id : this.requestId
    };
    this._passService.getRequestById(json).subscribe((data) => {
      this.isRequestInProcess = false;
      this.applicationFormData = data.data;
    });
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




  // document uploads
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


  // profile pic upload

  // common for both
  private getBase64(img: File, callback: (img: {}) => void): void {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
  }


  beforeUpload = (file: File) => {
    const isJPG = file.type === 'image/jpeg' || 'image/png';
    if (!isJPG) {
      this.notification.error('Error', 'You can only upload JPG file!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      this.notification.error('Error', 'Image must smaller than 2MB!');
    }
    return isJPG && isLt2M;
  }


  // profile
  handleProfilePicChange(info: { file: UploadFile }): void {
    if (info.file.status === 'uploading') {
      this.loadingProfilePic = true;
      return;
    }
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      this.getBase64(info.file.originFileObj, (img: string) => {
        this.loadingProfilePic = false;
        this.avatarUrl = img;
      });
    }

    if (info.file.status === 'error') {
      this.notification.error('Error', 'Profile pic not uploaded');
    }

  }


  // aadhar
  handleAadharChange(info: { file: UploadFile }): void {
    if (info.file.status === 'uploading') {
      this.loadingAadharPic = true;
      return;
    }
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      this.getBase64(info.file.originFileObj, (img: string) => {
        this.loadingAadharPic = false;
        this.aadharUrl = img;
      });
    }

    if (info.file.status === 'error') {
      this.notification.error('Error', 'Aadhar pic not uploaded');
    }

  }


  public saveRequest() {

    this.isRequestInProcess = true;

    const json: any = { ...this.applicationForm.getRawValue() };

    if(this.requestId) {
      // update
      this._passService.updateRequest(json).subscribe((data) => {
        this.isRequestInProcess = false;
        this.applicationFormData = data.data;
      });

    } else {

      this._passService.createRequest(json).subscribe((data) => {
        this.isRequestInProcess = false;
        this.applicationFormData = data.data;
      });

    }

  }


  public rejectRequest() {

    this.isRequestInProcess = true;
    const json: any = {
      id : this.requestId
    };
    this._passService.rejectRequest(json).subscribe((data) => {
      this.isRequestInProcess = false;
      this.applicationFormData = data.data;
    });

  }

  public approveRequest() {

    this.isRequestInProcess = true;
    const json: any = {
      id : this.requestId
    };
    this._passService.approveRequest(json).subscribe((data) => {
      this.isRequestInProcess = false;
      this.applicationFormData = data.data;
    });

  }



}
