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

  constructor(private _stateService : StateService,
              private _passServive : PassService) {
  }

  ngOnInit(): void {

    this.getInitialData();

    this.getAllRequest(PassStatusEnum.pending);

    // looking tab change event then will replace both line
    this.getAllRequest(PassStatusEnum.approved);
    this.getAllRequest(PassStatusEnum.rejected);

  }


  public getAllRequest(status?: PassStatusEnum) {

    const json: GetAllPassesRequestModel = {
      status : status,
      query: '',
      count: 10
    }

    this._passServive.getRequests(json).subscribe((data) => {

      if(status===PassStatusEnum.pending) {
        this.pendingData = data.data.items;
      } else if(status===PassStatusEnum.approved) {
        this.approvedData = data.data.items;
      } else if(status===PassStatusEnum.rejected) {
        this.rejectedData = data.data.items;
      }

    });

  }

  public getInitialData() {

    this._stateService.getStates().subscribe();

  }

}
