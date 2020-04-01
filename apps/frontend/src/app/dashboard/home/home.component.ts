import { Component, OnInit } from '@angular/core';
import { StateService } from '../../shared/services/state-city/state.service';
import { PassService } from '../../shared/services/pass/pass.service';
import { PassModel } from '@covid19-helpline/models';

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

    this.getAllRequest('pending');

    // looking tab change event then will replace both line
    this.getAllRequest('approved');
    this.getAllRequest('rejected');

  }


  async getAllRequest(status?: string) {

    const json = {
      status :status
    }
    await this._passServive.getRequests(json).subscribe((data) => {

      if(status==='pending') {
        this.pendingData = data.data;
      } else if(status==='approved') {
        this.approvedData = data.data;
      } else if(status==='rejected') {
        this.rejectedData = data.data;
      }

    });

  }

  public getInitialData() {

    this._stateService.getStates().subscribe();

  }

}
