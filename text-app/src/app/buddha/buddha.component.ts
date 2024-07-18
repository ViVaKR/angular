import { Component, inject, ChangeDetectorRef, OnDestroy, OnInit, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute, Route, Router, RouterLink, RouterOutlet } from '@angular/router';

import { BuddhaService } from '@app/services/buddha.service';
import { BuddistScripture } from '@app/types/buddist-scripture';
import { Observable, of, Subscription } from 'rxjs';

import { AllMatModule } from '@app/materials/all-mat/all-mat.module';
import { HangulOrderArray } from '@app/types/hangul-order';
import { BuddhistScriptureReadComponent } from './buddhist-scripture-read/buddhist-scripture-read.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GotoLoginComponent } from "../common/goto-login/goto-login.component";

@Component({
  selector: 'app-buddha',
  standalone: true,
  imports: [
    AsyncPipe,
    AllMatModule,
    RouterLink,
    RouterOutlet,
    GotoLoginComponent
  ],
  templateUrl: './buddha.component.html',
  styleUrl: './buddha.component.scss'
})
export class BuddhaComponent implements OnInit, OnDestroy {

  readonly panelOpenState = signal(false);
  readonly kors = HangulOrderArray.sort((a, b) => a.key.localeCompare(b.key));

  service = inject(BuddhaService);
  sutras$!: Observable<BuddistScripture[]>;

  sutraSubscription!: Subscription;

  constructor(private router: Router,
    public route: ActivatedRoute,
    public read: BuddhistScriptureReadComponent,
    private cdredf: ChangeDetectorRef,
    private snackBar: MatSnackBar) {

  }

  ngAfterContentChecked() {
    this.cdredf.detectChanges();
  }

  ngOnInit(): void {
    this.sutras$ = this.service.getScriptures();

    // Read 에서 삭제시 이벤트를 받아온다. (목록 갱신용)
    this.sutraSubscription = this.service.subject.subscribe(x => this.sutras$ = of(x));

    this.service.isUpdated.subscribe(x => {
      if (x) {
        this.sutras$ = this.service.getScriptures();
      }
    });
  }

  goNavigateList() {
    this.router.navigate(['BuddhistScriptureList'], { relativeTo: this.route });
  }
  goNavigateCreate() {
    this.router.navigate(['BuddhistScriptureCreate'], { relativeTo: this.route });

  }
  goNavigateRead(id: number) {
    this.router.navigate(['BuddhistScriptureRead'], { relativeTo: this.route, queryParams: { id } });
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }

  ngOnDestroy() {
    if (this.sutraSubscription) {
      this.sutraSubscription.unsubscribe();
    }
  }

  // onExpand() {
  //   this.isExpand = !this.isExpand;
  //   this.menuIcon = this.isExpand ? 'collapse_content' : 'expand_content';

  // }

  // onScale() {
  //   this.isScale = !this.isScale;
  // }
}
