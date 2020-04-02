import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Observable, Subject} from 'rxjs';
import {debounceTime} from 'rxjs/operators';
import {NzNotificationService, UploadFile} from 'ng-zorro-antd';
import {GeneralService} from '../../shared/services/general.service';
import {ActivatedRoute} from '@angular/router';
import {PassService} from '../../shared/services/pass/pass.service';
import {StateQuery} from '../../queries/state/state.query';
import {cloneDeep} from 'lodash';
import {
  CityModel,
  CityRequestModel, PassStatusEnum, ReasonModel,
  StateModel, UpdatePassStatusRequestModel
} from '@covid19-helpline/models';
import {CityService} from '../../shared/services/state-city/city.service';
import {CityQuery} from '../../queries/city/city.query';
import {StateService} from '../../shared/services/state-city/state.service';
import {ReasonService} from '../../shared/services/reason/reason.service';
import {PassUrls} from '../../shared/services/pass/pass.url';

@Component({
  selector: 'nest-js-boiler-plate-new-pass',
  templateUrl: './new-pass.component.html',
  styleUrls: ['./new-pass.component.scss']
})
export class NewPassComponent implements OnInit {

  public showPassNotFoundView: boolean;

  public isRequestInProcess: boolean;

  public applicationFormData: any;
  public applicationForm: FormGroup;
  public requestId: string;
  public dateFormat = 'MM/dd/yyyy';

  // upload profile pic
  public loadingProfilePic = false;
  public avatarUrl: string;


  // upload aadhaar
  public loadingAadhaarPic = false;
  public aadhaarUrl: string;


  // doc upload
  public attachementHeader: any;
  public attachementUrl: string;
  public uploadedImages = [];
  public attachementIds: string[] = [];
  // doc upload end


  public selectedReason: ReasonModel;
  public selectedState: StateModel;
  public selectedCity: ReasonModel;
  public selectedPurpose: any;

  public cityDataSource: CityModel[] = [];

  public stateDataSource: StateModel[] = [];

  public reasonDataSource: ReasonModel[] = [];

  public isSearchingState: boolean;
  public isSearchingCity: boolean;
  public isSearchingReason: boolean;

  public showAddPersonBtn: boolean = true;

  public modelChangedState = new Subject<string>();
  public modelChangedCity = new Subject<string>();
  public modelChangedReason = new Subject<string>();
  public modelChangedPurpose = new Subject<string>();

  constructor(private FB: FormBuilder, protected notification: NzNotificationService,
              private _generalService: GeneralService,
              private _passService: PassService, private _activatedRouter: ActivatedRoute,
              private _stateQuery: StateQuery, private _cityQuery: CityQuery,
              private _reasonService: ReasonService,
              private _cityService: CityService, private _stateService: StateService) {
    this.notification.config({
      nzPlacement: 'bottomRight'
    });
  }

  ngOnInit() {

    // initializing form
    this.initForm();

    this.requestId = this._activatedRouter.snapshot.params.requestId;

    if (this.requestId) {
      this.getPassRequest();
    }

    this.attachementUrl = PassUrls.attachment;

    this.attachementHeader = {
      Authorization: 'Bearer ' + this._generalService.token
    };

    // search state
    this.modelChangedState
      .pipe(
        debounceTime(500))
      .subscribe(() => {
        const queryText = this.applicationForm.get('state').value;
        const name = this.selectedState && this.selectedState.name ? this.selectedState.name : null;
        if (!queryText || this.applicationForm.get('state').value === name) {
          return;
        }
        this.isSearchingState = true;
        const json = {
          term: queryText
        }
        this._stateService.searchState(json).subscribe((data) => {
          this.isSearchingState = false;
          this.stateDataSource = data.data;
        });
      });


    // search city
    this.modelChangedCity
      .pipe(
        debounceTime(500))
      .subscribe(() => {
        const queryText = this.applicationForm.get('city').value;
        const name = this.selectedCity && this.selectedCity.name ? this.selectedCity.name : null;
        if (!queryText || this.applicationForm.get('city').value === name) {
          return;
        }
        this.isSearchingCity = true;
        const json: CityRequestModel = {
          stateId: this.selectedState.id,
          term: queryText
        }
        this._cityService.searchCity(json).subscribe((data) => {
          this.isSearchingCity = false;
          this.cityDataSource = data.data;
        });
      });

    // search reason
    this.modelChangedReason
      .pipe(
        debounceTime(500))
      .subscribe(() => {
        const queryText = this.applicationForm.get('reason').value;
        const name = this.selectedReason && this.selectedReason.name ? this.selectedReason.name : null;

        if (!queryText || this.applicationForm.get('reason').value === name) {
          return;
        }
        this.isSearchingReason = true;
        const json = {
          query: queryText
        }
        this._reasonService.searchReason(json).subscribe((data) => {
          this.isSearchingReason = false;
          this.reasonDataSource = data.data;
        });

      });
    // end search reason

  }


  // initializing form
  public initForm() {
    this.applicationForm = this.FB.group({
      firstName: [null, [Validators.required]],
      lastName: [null, [Validators.required]],
      city: [null],
      state: [null],
      cityId: [null, [Validators.required]],
      stateId: [null, [Validators.required]],
      aadhaarNo: [null, [Validators.required, Validators.pattern('^[0-9]{12}$')]],
      address: [null, [Validators.required]],
      mobileNo: [null, [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      passDate: [null, [Validators.required]],
      vehicleNo: [null, [Validators.required]],
      reasonId: [null, [Validators.required]],
      reason: [null, [Validators.required]],
      reasonDetails: [null, [Validators.required]],
      destinationPinCode: [null, [Validators.required, Validators.pattern('^[0-9]{6}$')]],
      destinationAddress: [null, [Validators.required]],
      picUrl: [null, [Validators.required]],
      aadharPicUrl: [null, [Validators.required]],
      passStatus: [null],
      attachments: [null],
      otherPersonDetails: new FormArray([]),
    });
    this.uploadedImages = [];
    this.attachementIds = [];
  }


  public initOtherPersonDetails() {
    return this.FB.group({
      fullName: [null, [Validators.required]],
      aadhaarNo: [null, [Validators.required, Validators.pattern('^[0-9]{12}$')]],
    });
  }

  public getCities() {
    const json: CityRequestModel = {
      stateId: this.selectedState.id
    }
    console.log(json);
    this.isSearchingCity = true;
    this._cityService.getCities(json).subscribe();
  }

  // Getting existing request (view mode)
  async getPassRequest() {
    try {

      this.isRequestInProcess = true;
      const json: any = {
        id: this.requestId
      };

      let data = await this._passService.getRequestById(json).toPromise();

      this.isRequestInProcess = false;
      this.showPassNotFoundView = false;
      //pre populate here

      if (!data.data.otherPersonDetails) {
        data.data.otherPersonDetails = [];
      }

      if (!data.data.attachmentDetails) {
        data.data.attachmentDetails = [];
      }

      this.applicationForm.patchValue(data.data);

      this.applicationForm.get('city').patchValue(data.data.city.name);
      this.applicationForm.get('state').patchValue(data.data.state.name);
      this.applicationForm.get('reason').patchValue(data.data.reason.name);


      this.aadhaarUrl = data.data.aadharPicUrl;
      this.avatarUrl = data.data.picUrl;

    } catch (e) {
      this.isRequestInProcess = false;
      if (!e.data) {
        this.showPassNotFoundView = true;
      }
    }
  }

  public selectStateTypeahead(state: StateModel) {
    if (state && state.id) {
      this.selectedState = state;
      this.applicationForm.get('stateId').patchValue(state.id);
      this.applicationForm.get('state').patchValue(state.name);
    }
    this.modelChangedState.next();
  }


  public selectCityTypeahead(city: CityModel) {
    if (city && city.id) {
      this.selectedCity = city;
      this.applicationForm.get('cityId').patchValue(city.id);
      this.applicationForm.get('city').patchValue(city.name);
    }
    this.modelChangedCity.next();
  }

  public selectReasonTypeahead(reason: ReasonModel) {
    if (reason && reason.id) {
      this.selectedCity = reason;
      this.applicationForm.get('reasonId').patchValue(reason.id);
      this.applicationForm.get('reason').patchValue(reason.name);
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
  handleChange({file, fileList}): void {
    const status = file.status;
    if (status !== 'uploading') {
      // console.log(file, fileList);
    }
    if (status === 'done') {

      if (file.response && file.response.data.id) {
        this.attachementIds.push(file.response.data.id);
        this.applicationForm.get('attachments').patchValue(this.attachementIds);
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

  beforeUploadDocs = (file: File) => {
    const isAllow = file.type === 'image/jpeg' || 'image/png' || 'application/pdf';
    if (!isAllow) {
      this.notification.error('Error', 'You can only upload JPG file!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      this.notification.error('Error', 'Image must smaller than 2MB!');
    }
    return isAllow && isLt2M;
  }

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

      if (info.file.response && info.file.response.data.id) {
        this.attachementIds.push(info.file.response.data.id);
        this.applicationForm.get('picUrl').patchValue(info.file.response.data.url);
      }

      this.getBase64(info.file.originFileObj, (img: string) => {
        this.loadingProfilePic = false;
        this.avatarUrl = img;
      });
    }

    if (info.file.status === 'error') {
      this.loadingProfilePic = false;
      this.notification.error('Error', 'Profile pic not uploaded');
    }

  }


  // aadhaar
  handleAadhaarChange(info: { file: UploadFile }): void {
    if (info.file.status === 'uploading') {
      this.loadingAadhaarPic = true;
      return;
    }
    if (info.file.status === 'done') {

      if (info.file.response && info.file.response.data.id) {
        this.attachementIds.push(info.file.response.data.id);
        this.applicationForm.get('aadharPicUrl').patchValue(info.file.response.data.url);
      }


      // Get this url from response in real world.
      this.getBase64(info.file.originFileObj, (img: string) => {
        this.loadingAadhaarPic = false;
        this.aadhaarUrl = img;
      });
    }

    if (info.file.status === 'error') {
      this.loadingAadhaarPic = false;
      this.notification.error('Error', 'Aadhaar pic not uploaded');
    }

  }

  public addOtherPersonDetails(group?: FormGroup) {
    const otherDetailsForm = this.applicationForm.get('otherPersonDetails') as FormArray;
    otherDetailsForm.controls.push(this.initOtherPersonDetails());

    this.showAddPersonBtn = otherDetailsForm.controls.length > 0 ? false : true;

  }

  public removeOtherPersonDetails(index: number) {
    const otherDetailsForm = this.applicationForm.get('otherPersonDetails') as FormArray;
    otherDetailsForm.removeAt(index);

    this.showAddPersonBtn = otherDetailsForm.controls.length > 0 ? false : true;

  }


  public saveRequest() {

    try {

      const json: any = {...this.applicationForm.getRawValue()};

      this.applicationForm.get('attachments').patchValue(this.attachementIds); // uploaded attachments

      // in case empty row submitted
      if (json.otherPersonDetails && json.otherPersonDetails.length > 0) {
        json.otherPersonDetails = json.otherPersonDetails.filter(ele => ele.fullName && ele.aadhaarNo);
      }

      console.log(JSON.stringify(json));

      this.isRequestInProcess = true;

      if (this.requestId) {
        // update
        this._passService.updateRequest(json).subscribe((data) => {
          this.isRequestInProcess = false;
          this.initForm();
          // this.applicationFormData = data.data;
        });

      } else {
        // create
        this._passService.createRequest(json).subscribe((data) => {
          this.isRequestInProcess = false;
          this.initForm();
          // this.applicationFormData = data.data;
        });

      }

    } catch (e) {
      this.isRequestInProcess = false;
    }

  }


  public rejectRequest() {

    try {

      this.isRequestInProcess = true;

      const json: UpdatePassStatusRequestModel = {
        id: this.requestId,
        status: PassStatusEnum.rejected
      };

      this._passService.updateStatus(json).subscribe((data) => {
        this.isRequestInProcess = false;
      });

    } catch (e) {
      this.isRequestInProcess = false;
    }

  }

  public approveRequest() {

    try {

      this.isRequestInProcess = true;
      const json: UpdatePassStatusRequestModel = {
        id: this.requestId,
        status: PassStatusEnum.approved
      };
      this._passService.updateStatus(json).subscribe((data) => {
        this.isRequestInProcess = false;
      });

    } catch (e) {
      this.isRequestInProcess = false;
    }

  }


}
