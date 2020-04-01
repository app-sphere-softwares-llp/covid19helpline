import { Component, OnInit } from '@angular/core';
import { StateService } from '../../shared/services/state-city/state.service';

@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  public listOfData = [
    {
      id: '2323naoauodhdf9w8ehsfsdf',
      firstName: 'Aashish',
      lastName: 'Patil',
      passDate: new Date(),
      destinationAddress: '134, Goyal Vihar, Indore'
    },
    {
      id: '3457naoauodhdf9w8ehsfsdf',
      firstName: 'Pradeep',
      lastName: 'Sharma',
      passDate: new Date(),
      destinationAddress: '134, Goyal Vihar, Indore'
    },
    {
      id: '3457naoauodhdf9w8ehsfsdf',
      firstName: 'Vishal',
      lastName: 'Isharani',
      passDate: new Date(),
      destinationAddress: '134, Goyal Vihar, Indore'
    }
  ];

  constructor(private _stateService : StateService) {
  }

  ngOnInit(): void {
    this.getInitialData();
  }


  public getInitialData() {
    this._stateService.getStates().subscribe();
  }

}
