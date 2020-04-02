import { Component, OnInit } from '@angular/core';
import { StateService } from '../../shared/services/state-city/state.service';
import { PassService } from '../../shared/services/pass/pass.service';
import { GetAllPassesRequestModel, PassModel, PassStatusEnum } from '@covid19-helpline/models';

@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  public pendingData: PassModel[] = [];
  public approvedData: PassModel[] = [];
  public rejectedData: PassModel[] = [];
  public gettingDataInProcess:boolean;

  public filterRequest: GetAllPassesRequestModel = {
    count : 15,
    page: 1,
    query : '',
    status : PassStatusEnum.pending
  }

  constructor(private _stateService : StateService,
              private _passServive : PassService) {
  }

  ngOnInit(): void {

    // commented because applied search facility on state fileds on new pass form
    // this.getInitialData();

    this.getAllRequest(PassStatusEnum.pending);

  }

  public currentTab(status?: string) {
    if(status==='dashboard'){ // will apply dashboard api later
      return;
    }
    this.filterRequest.page = 1;
    this.filterRequest.totalItems = 0;
    this.getAllRequest(status as PassStatusEnum);
  }


  public getAllRequest(status?: PassStatusEnum) {

    this.filterRequest.status = status;

    this._passServive.getRequests(this.filterRequest).subscribe((data) => {

      this.filterRequest.totalItems = data.data.totalItems;

      if(status===PassStatusEnum.pending) {
        this.pendingData = data.data.items;
      } else if(status===PassStatusEnum.approved) {
        this.approvedData = data.data.items;
      } else if(status===PassStatusEnum.rejected) {
        this.rejectedData = data.data.items;
      }

    });

  }

  public pageChanged(index: number, status: string) {
      this.filterRequest.page = index;
      this.getAllRequest(status as PassStatusEnum);
  }


  public getInitialData() {

    this._stateService.getStates().subscribe();

  }

}
