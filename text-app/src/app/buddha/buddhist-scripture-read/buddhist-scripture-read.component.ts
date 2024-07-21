import { AfterContentInit, Component, inject, Injectable, Input, OnDestroy, OnInit } from '@angular/core';
import { AllMatModule } from '@app/materials/all-mat/all-mat.module';
import { HighlightLineNumbers } from 'ngx-highlightjs/line-numbers';
import { HighlightAuto } from 'ngx-highlightjs';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BuddhaService } from '@app/services/buddha.service';
import { BuddistScripture } from '@app/types/buddist-scripture';
import { HangulOrder } from '@app/types/hangul-order';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatDialog } from '@angular/material/dialog';
import { DialogVivComponent } from '@app/common/dialog-viv/dialog-viv.component';
import { CurrencyPipe, DatePipe, JsonPipe, NgIf } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthService } from '@app/services/auth.service';
import { DataService } from '@app/services/data.service';

@Component({
  selector: 'app-buddhist-scripture-read',
  standalone: true,
  imports: [
    AllMatModule,
    HighlightAuto,
    HighlightLineNumbers,
    ClipboardModule,
    JsonPipe,
    NgIf,
    DatePipe,
    CurrencyPipe,
  ],
  templateUrl: './buddhist-scripture-read.component.html',
  styleUrl: './buddhist-scripture-read.component.scss',
  providers: [HighlightAuto, HighlightLineNumbers,
    { provide: 'LOCALE_ID', useValue: 'ko-KR' }
  ],
})
@Injectable({
  providedIn: 'root'
})
export class BuddhistScriptureReadComponent implements OnInit, AfterContentInit, OnDestroy {

  @Input() mainTitle?: string;

  created!: Date;

  dataService = inject(DataService);

  sutraDTO: BuddistScripture = {
    id: 0,
    title: '',
    subtitle: '',
    author: '',
    translator: '',
    summary: '',
    sutra: '',
    originalText: '',
    annotation: '',
    hangulOrder: HangulOrder.가,
    created: new Date(),
    userId: '',
    userName: ''
  }

  tabs = ['경전', '원문', '해설', '주석'];

  fontSize = 'text-3xl';

  sutraSubscription!: Subscription;

  authService = inject(AuthService);

  constructor(
    private router: Router,
    private service: BuddhaService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngAfterContentInit(): void {
    this.service.hideElement(true);
  }

  ngOnInit(): void {

    // 파라미터를 받아오기 위해 ActivatedRoute를 사용한다.
    this.route.queryParams.subscribe({
      next: (params: Params) => {

        this.sutraDTO.id = params['id'] as number; // id 파라미터를 받아온다.

        if (this.sutraDTO.id === null || this.sutraDTO.id === undefined) { this.sutraDTO.id = 1; } // id가 없으면 1로 초기화한다.

        this.service.getScriptureById(this.sutraDTO.id).subscribe({ // id로 서버에 요청한다.
          next: (data: BuddistScripture) => {
            if (data != null) {
              this.created = new Date(data.created + 'Z');
              this.sutraDTO = data;
            }
          },
          error: (error: any) => { this.openSnackBar('경전 데이터를 가져오는데 실패했습니다.', '실패'); }
        });
      },
      error: (error: any) => { this.openSnackBar('경전 데이터를 가져오는데 실패했습니다.', '실패'); }
    });
  }

  // 경전 삭제
  onDelete() {

    if (!this.authService.isLoggedIn()) {

      this.openSnackBar('로그인이 필요합니다.', '로그인');
      this.router.navigate(['../login'], { relativeTo: this.route });

    } else {
      this.dataService.next(this.sutraDTO.id);
      this.router.navigate(['../BuddhistScriptureDelete'], { relativeTo: this.route, queryParams: { id: this.sutraDTO.id } });
    }
  }

  goNavigateUpdate(id: number) {
    this.router.navigate(['../BuddhistScriptureUpdate'], { relativeTo: this.route, queryParams: { id } });
  }

  increaseFontSize() {
    this.fontSize = 'text-3xl font-bold';
  }

  openDialog(data: any, success: boolean, action: string) {
    let message = `자료번호 ( ${data.id} ) 데이터 ${action} `;

    let dialogRef = success
      ? this.dialog.open(DialogVivComponent, { data: { name: `${message}` } })
      : this.dialog.open(DialogVivComponent, { data: { name: `${message}` } });

    dialogRef.afterClosed().subscribe(() => {
      // this.reloadComponent();
    });
  }

  openSnackBar(message: string, action: string): void {
    this.snackBar.open(message, action, {
      duration: 3000,
      horizontalPosition: 'center'
    });
  }

  onScrollToTop() {
    window.scrollTo(0, 0);
  }

  // 클립보드에 복사한다.
  onCopyToClipboard() {
    this.openSnackBar('경전 본문이 클립보드에 복사 완료되었습니다.', '복사완료!');
  }

  ngOnDestroy(): void {
    if (this.sutraSubscription) {
      this.sutraSubscription.unsubscribe();
    }
    this.service.hideElement(false);
  }
}
