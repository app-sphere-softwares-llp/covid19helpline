import { Component, OnInit } from '@angular/core';
import { CityModel, CityRequestModel, MemberTypes, StateModel, User } from '@covid19-helpline/models';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../shared/services/auth.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { StateService } from '../../shared/services/state-city/state.service';
import { CityService } from '../../shared/services/state-city/city.service';
import { GeneralService } from '../../shared/services/general.service';
import { UserService } from '../../shared/services/user/user.service';
import { Router } from '@angular/router';

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

  public modelChangedState = new Subject<string>();
  public modelChangedCity = new Subject<string>();

  constructor(private FB:FormBuilder,
              private _stateService :StateService,
              private _cityService: CityService,
              private _authService: AuthService,
              private _generalService: GeneralService,
              private _userService: UserService,
              private _router: Router) { }

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


  public initForm() {
    this.adminForm = this.FB.group(
      {
        firstName: [null, [Validators.required]],
        lastName: [null, [Validators.required]],
        city: [null],
        state: [null],
        cityId: [null],
        stateId: [null],
        emailId: [null],
        mobileNumber: [null, Validators.required],
      }
    );

    this.selectedCity = null;
    this.selectedState = null;

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

      console.log(json);

      await this._authService.createAdmin(json).toPromise();
      this.isRequestInProcess = false;
      this.initForm();

    } catch (e) {
      this.isRequestInProcess = false;
    }

  }


  async getAllAdmin() {

    try {

      this.isGettingDataInProcess = true;

      const data = await this._userService.getAllAdmin().toPromise();
      this.allData = data.data;
      this.isGettingDataInProcess = false;


    } catch (e) {
      this.isGettingDataInProcess = false;
    }

  }

}
