import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ThemeConstantService } from '../shared/services/theme-constant.service';
import { GeneralService } from '../shared/services/general.service';
import { UserService } from '../shared/services/user/user.service';
import { UserQuery } from '../queries/user/user.query';
import { cloneDeep } from 'lodash';

@Component({
  templateUrl: './dashboard.component.html'
})

export class DashboardComponent implements OnInit, OnDestroy {
  isFolded: boolean;
  isSideNavDark: boolean;
  isExpand: boolean;
  selectedHeaderColor: string;

  constructor(private router: Router, private activatedRoute: ActivatedRoute, private themeService: ThemeConstantService,
              private _generalService: GeneralService, private _userService: UserService,
              private _userQuery: UserQuery) {
  }

  ngOnInit() {

    // listen for user from store
    this._userQuery.user$.subscribe(res => {
      this._generalService.user = cloneDeep(res);
    });

    this.themeService.isMenuFoldedChanges.subscribe(isFolded => this.isFolded = isFolded);
    this.themeService.isSideNavDarkChanges.subscribe(isDark => this.isSideNavDark = isDark);
    this.themeService.selectedHeaderColor.subscribe(color => this.selectedHeaderColor = color);
    this.themeService.isExpandChanges.subscribe(isExpand => this.isExpand = isExpand);
  }


  stepDone() {
    setTimeout(() => {
      console.log('Step done!');
    }, 3000);
  }


  ngOnDestroy(): void {
  }
}
