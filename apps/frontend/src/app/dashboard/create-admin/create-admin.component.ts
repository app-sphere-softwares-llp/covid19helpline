import { Component, OnInit } from '@angular/core';
import {
  CityModel,
  CityRequestModel,
  GetAllAdminUsersRequestModel,
  MemberTypes,
  StateModel,
  User
} from '@covid19-helpline/models';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../shared/services/auth.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { StateService } from '../../shared/services/state-city/state.service';
import { CityService } from '../../shared/services/state-city/city.service';
import { GeneralService } from '../../shared/services/general.service';
import { UserService } from '../../shared/services/user/user.service';
import { Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd';

@Component({
  selector: 'covid19-helpline-create-admin',
  templateUrl: './create-admin.component.html',
  styleUrls: ['./create-admin.component.css']
})
export class CreateAdminComponent implements OnInit {

  public isRequestInProcess: boolean;
  public adminForm:FormGroup;


  public selectedState:StateModel;
  public stateDataSource:StateModel[]=[];
  public isSearchingState:boolean;

  public selectedCity:StateModel;
  public cityDataSource: CityModel[]= [];
  public isSearchingCity:boolean;

  public allData: User[] = [];
  public isGettingDataInProcess:boolean;

  public formTitle: string = 'Create Admin';


  public filterRequest: GetAllAdminUsersRequestModel = {
    count : 15,
    page: 1,
    query : '',
    sort:'',
    sortBy: 'desc'
  }

  public modelChangedState = new Subject<string>();
  public modelChangedCity = new Subject<string>();

  constructor(private FB:FormBuilder,
              private _stateService :StateService,
              private _cityService: CityService,
              private _authService: AuthService,
              private _generalService: GeneralService,
              private _userService: UserService,
              private _router: Router,
              private modalService: NzModalService) { }

  ngOnInit() {

    if(this._generalService.user.memberType !== MemberTypes.superAdmin) {
      this._router.navigate(['']);
    }

    this.getAllAdmin();

    this.initForm();

    // search state
    this.modelChangedState
      .pipe(
        debounceTime(500))
      .subscribe(() => {
        const queryText = this.adminForm.get('state').value;
        const name = this.selectedState && this.selectedState.name ? this.selectedState.name : null;
        if (!queryText || this.adminForm.get('state').value === name) {
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
        const queryText = this.adminForm.get('city').value;
        const name = this.selectedCity && this.selectedCity.name ? this.selectedCity.name : null;
        if (!queryText || this.adminForm.get('city').value === name) {
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


  }


  public initForm(isCancel?: boolean) {

    this.formTitle = 'Create Admin';

    this.adminForm = this.FB.group(
      {
        id: [null],
        firstName: [null, [Validators.required]],
        lastName: [null, [Validators.required]],
        city: [null, [Validators.required]],
        cityId: [null, [Validators.required]],
        state: [null, [Validators.required]],
        stateId: [null, [Validators.required]],
        mobileNumber: [null, [Validators.required]],
      }
    );

    if(!isCancel) {

    }

    this.isRequestInProcess = false;
    this.selectedCity = this._generalService.user.city;
    this.selectedState = this._generalService.user.state;

    if(this._generalService.user.state) {
      this.adminForm.get('stateId').patchValue(this._generalService.user.state.id);
      this.adminForm.get('state').patchValue(this._generalService.user.state.name);
    }

    if(this._generalService.user.city) {
      this.adminForm.get('cityId').patchValue(this._generalService.user.city.id);
      this.adminForm.get('city').patchValue(this._generalService.user.city.name);
    }



  }


  public selectStateTypeahead(state: StateModel) {
    if (state && state.id) {
      this.selectedState = state;
      this.adminForm.get('stateId').patchValue(state.id);
      this.adminForm.get('state').patchValue(state.name);
    }
    this.modelChangedState.next();
  }

  public selectCityTypeahead(city: CityModel) {
    if (city && city.id) {
      this.selectedCity = city;
      this.adminForm.get('cityId').patchValue(city.id);
      this.adminForm.get('city').patchValue(city.name);
    }
    this.modelChangedCity.next();
  }


  async createAdmin() {

    try {

      const json: User = {...this.adminForm.getRawValue()};
      this.isRequestInProcess = true;

      if(json.id) {
        await this._userService.updateAdmin(json).toPromise();
      } else {
        await this._userService.createAdmin(json).toPromise();
      }

      this.isRequestInProcess = false;
      this.initForm();

    } catch (e) {
      this.isRequestInProcess = false;
    }

  }


  enableEdit(user:User) {
    this.formTitle = 'Edit Admin';
    this.adminForm.patchValue(user);

    // disable mobile control because admin mobile is not allowed
    this.adminForm.get('mobileNumber').disable();

    this.adminForm.get('cityId').patchValue(user.city.id);
    this.adminForm.get('stateId').patchValue(user.state.id);
  }



  async removeAdmin(id: string) {

    try {

      return this.modalService.confirm({
        nzTitle: 'Are you sure delete?',
        nzContent: '',
        nzOnOk: () =>
          new Promise(async (resolve, reject) => {
            const json = { id: id };
            this.isRequestInProcess = true;
            const data = await this._userService.deleteAdmin(json).toPromise();
            this.isRequestInProcess = false;
              if(data && data.data) {
                setTimeout(Math.random() > 0.5 ? resolve : reject, 10);
              }
            return true;
          }).catch(() => console.log('Oops errors!'))
      });

    } catch (e) {
      this.isRequestInProcess = false;
    }

  }

  async getAllAdmin() {

    try {

      this.isGettingDataInProcess = true;

      const data = await this._userService.getAllAdmin(this.filterRequest).toPromise();
      this.allData = data.data.items;
      this.isGettingDataInProcess = false;


    } catch (e) {
      this.isGettingDataInProcess = false;
    }

  }

  public pageChanged(index: number) {
    this.filterRequest.page = index;
    this.getAllAdmin();
  }

}
