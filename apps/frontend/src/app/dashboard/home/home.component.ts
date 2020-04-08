import { Component, OnInit } from '@angular/core';
import { StateService } from '../../shared/services/state-city/state.service';
import { PassService } from '../../shared/services/pass/pass.service';
import { GetAllPassesRequestModel, PassModel, PassStatusEnum, User } from '@covid19-helpline/models';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { GeneralService } from '../../shared/services/general.service';

@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  public pendingData: PassModel[] = [];
  public approvedData: PassModel[] = [];
  public rejectedData: PassModel[] = [];
  public gettingDataInProcess:boolean;
  public isSearchingPass: boolean;

  public filterRequest: GetAllPassesRequestModel = {
    count : 15,
    page: 1,
    query : '',
    status : PassStatusEnum.pending
  }

  public modelChangedSearchPass = new Subject<string>();

  constructor(private _stateService : StateService,
              private _passServive : PassService,
              private _generalService: GeneralService) {
  }

  ngOnInit(): void {

    // commented because applied search facility on state fileds on new pass form
    // this.getInitialData();

    this.getAllRequest(PassStatusEnum.pending);

    // search state
    this.modelChangedSearchPass
      .pipe(
        debounceTime(500))
      .subscribe(() => {

        if (!this.filterRequest.query) {
          this.getAllRequest();
          return;
        }

        this.isSearchingPass = true;

        this.filterRequest.page = 1;

        this.getAllRequest();

      });


  }

  public currentTab(status?: string) {
    if(status==='dashboard'){ // will apply dashboard api later
      return;
    }
    this.filterRequest.page = 1;
    this.filterRequest.query = '';
    this.filterRequest.totalItems = 0;
    this.getAllRequest(status as PassStatusEnum);
  }


  public getAllRequest(status?: PassStatusEnum) {

    try {

      if (status) {
        this.filterRequest.status = status;
      }

      // console.log(this.filterRequest);

      this._passServive.getRequests(this.filterRequest).subscribe((data) => {

        this.gettingDataInProcess = false;
        this.isSearchingPass = false;

        this.filterRequest.totalItems = data.data.totalItems;

        if (this.filterRequest.status === PassStatusEnum.pending) {
          this.pendingData = data.data.items;
        } else if (this.filterRequest.status === PassStatusEnum.approved) {
          this.approvedData = data.data.items;
        } else if (this.filterRequest.status === PassStatusEnum.rejected) {
          this.rejectedData = data.data.items;
        }

      });

    }catch (e) {
      this.gettingDataInProcess = false;
      this.isSearchingPass = false;
    }

  }

  public pageChanged(index: number, status: string) {
      this.filterRequest.page = index;
      this.getAllRequest(status as PassStatusEnum);
  }


  public getInitialData() {

    this._stateService.getStates().subscribe();

  }

}
