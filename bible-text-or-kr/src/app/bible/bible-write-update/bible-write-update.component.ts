import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { CommonModule, CurrencyPipe, DatePipe, JsonPipe, NgFor, NgIf, registerLocaleData } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AfterContentChecked, afterNextRender, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, inject, Injector, Input, OnDestroy, OnInit, Renderer2, ViewChild, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggle, MatButtonToggleChange, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { MatCardHeader, MatCardModule } from '@angular/material/card';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { BlankSpaceComponent } from '@app/blank-space/blank-space.component';
import { IBible } from '@app/interfaces/i-bible';
import { ICategory } from '@app/interfaces/i-category';
import { IResponse } from '@app/interfaces/i-response';
import { ScrollArrowComponent } from '@app/scroll-arrow/scroll-arrow.component';
import { AuthService } from '@app/services/auth.service';
import { BibleService } from '@app/services/bible.service';
import { CategoryService } from '@app/services/category.service';
import localeKo from '@angular/common/locales/ko';
import { Subscription } from 'rxjs';
import { ICategoryVerse } from '@app/interfaces/i-category-verse';
import { bibleChapters } from '../bible-category/bibleChapters';

registerLocaleData(localeKo, 'ko');

@Component({
  selector: 'app-bible-write-update',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    JsonPipe,
    NgIf,
    NgFor,
    DatePipe,
    CurrencyPipe,
    MatProgressSpinner,
    FormsModule,
    MatCardModule,
    MatCardHeader,
    MatFormFieldModule,
    MatInputModule,
    MatFormField,
    MatSelectModule,
    MatButtonToggleGroup,
    MatButtonToggle,
    MatButtonModule,
    ScrollArrowComponent,
    BlankSpaceComponent,
    CommonModule
  ],
  templateUrl: './bible-write-update.component.html',
  styleUrl: './bible-write-update.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,

  providers: [
    DatePipe,
    { provide: 'LOCALE_ID', useValue: 'ko' }
  ]
})
export class BibleWriteUpdateComponent implements OnInit, AfterContentChecked, AfterViewInit, OnDestroy {

  protected readonly value = signal('');

  protected onInput(event: Event) {
    this.value.set((event.target as HTMLInputElement).value);
  }

  @Input() title: string = '성경 쓰기';
  @Input() division: boolean = true; // true: 쓰기, false: 수정

  @ViewChild('autosize') autosize!: CdkTextareaAutosize;
  @ViewChild('bible') bible!: ElementRef;

  categories: ICategory[] = [];

  fb = inject(FormBuilder);
  _injector = inject(Injector);
  authService = inject(AuthService);
  bibleService = inject(BibleService);
  categoryService = inject(CategoryService);
  elementRef = inject(ElementRef);
  cdredf = inject(ChangeDetectorRef);
  router = inject(Router);
  route = inject(ActivatedRoute);
  renderer = inject(Renderer2);
  snackbar = inject(MatSnackBar);
  datePipe = inject(DatePipe);

  today!: string | null | undefined;
  // isEmailConfirmed: boolean = false;
  visibleSaveButton: boolean = true;

  userId: string = '';
  userName: string = '';
  @Input() myIp: string = '';
  chapterMax: number = 0; // 150 장;
  verseMax: number = 0; // 176 절;
  description: string = '-';
  serviceIp: string = '';

  verses: ICategoryVerse[] = bibleChapters;

  form!: FormGroup;

  public fontOptions = (min: number, max: number) => [...Array(max - min + 1).keys()].map(i => `${i + min}px`);

  public chapterOptions = (min: number) => [...Array(this.chapterMax - min + 1).keys()].map(i => `${i + min}`);

  public verseOptions = (min: number, max: number) => [...Array(max - min + 1).keys()].map(i => `${i + min}`);

  rows: number = 5;
  rowArray = [5, 10, 15, 20, 25, 30, 40, 50, 100, 300, 500, 1000];
  status: boolean = false;
  isSpinner: boolean = false;
  tempData!: IBible;
  lineSpace = 1.5;
  myClass = {
    'text-slate-400': true
  }

  fontSize = "2em";

  bibleSubscription!: Subscription;
  authSubscription!: Subscription;

  newForm(val: string): void {
    this.form = this.fb.group({
      id: [0],
      title: ['성경 쓰기', Validators.required],
      categoryId: [0, Validators.required],
      chapter: [0, Validators.required],
      verse: [0, Validators.required],
      textKor: [val, Validators.required],
      textEng: ['bible'],
      comments: [val],
      created: [null],
      modified: [null],
      userId: [val],
      userName: [val],
      myIp: ['0.0.0.0']
    });
  }

  constructor() {
    this.today = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
    this.bibleService.isElement.next(true);
  }

  ngOnInit(): void {

    this.rows = 100;
    this.userId = this.authService.getUserDetail()?.id;
    this.userName = this.authService.getUserDetail()?.fullName;

    if (this.authService.isLoggedIn() && (this.userId === '' || this.userId === undefined || this.userId === null)) {
      this.snackbar.open('로그인이 필요합니다.', '닫기');
      this.router.navigate(['/login']);
      return;
    }

    this.newForm(''); // 폼 초기화

    this.form.controls['userId'].setValue(this.userId);
    this.form.controls['userName'].setValue(this.userName);
    // this.bibleService.publicIPAddress.subscribe({
    //   next: (x) => {
    //     this.myIp = x;
    //     this.form.controls['myIp'].setValue(this.myIp);
    //   }
    // });

    if (!this.division) { // 수정일 경우 시작 부분

      this.route.queryParams.subscribe({
        next: (params: any) => {

          const id = params['id'] as number;
          if (id === undefined || id === null || id < 1) {
            this.division = true;
          }

          this.bibleService.getBibleById(id).subscribe({
            next: (data: IBible) => {
              if (data != null) {
                this.tempData = data;
                this.form.patchValue(data);
                this.renderer
                // this.bibleService.publicIPAddress.subscribe(x => this.myIp = x);
                this.form.controls['myIp'].setValue(this.myIp);
              }
            },
            error: (err: HttpErrorResponse) => {
              this.snackbar.open(err.message, '닫기');
            }
          });
        }
      })
    } // 수정일 경우 끝 부분
  }

  onSubmit(): void {

    this.form.controls['userId'].setValue(this.userId);
    this.form.controls['userName'].setValue(this.userName);
    this.isSpinner = true;

    if (this.form.invalid) {
      this.snackbar.open('입력값을 확인해주세요.', '닫기');
      this.isSpinner = false;
      return;
    }

    if (this.division) { // 쓰기일 경우
      this.bibleSubscription = this.bibleService.postBible(this.form.value).subscribe({
        next: (response: IResponse) => {
          this.isSpinner = false;
          this.bibleService.updated(true);
          this.snackbar.open(`(${response.isSuccess} ${response.message}) ${response.data}`, '닫기');
          this.bibleService.updated(false);
        },
        error: (err) => {
          this.isSpinner = false;
          this.bibleService.updated(false);
          this.snackbar.open(`Error: ${err.message}`, '닫기', { duration: 3000 });

        }
      });
    } else { // 수정일 경우
      this.bibleSubscription = this.bibleService.putBible(this.form.value.id, this.form.value).subscribe({
        next: (data: IResponse) => {
          this.isSpinner = false;
          this.bibleService.updated(true);
          this.snackbar.open(`수정완료: ${data.message}`, '닫기', { duration: 3000 });
          this.bibleService.updated(false);
        },
        error: (err: HttpErrorResponse) => {
          this.snackbar.open(err.message, '닫기', { duration: 3000 });
          this.isSpinner = false;
        }
      });
    }
  }

  ngAfterViewInit(): void {
    this.rows = 10;
    this.categoryService.getCategories().subscribe({
      next: (data: ICategory[]) => {
        this.categories = data;
      },
      error: (err: HttpErrorResponse) => {
        this.snackbar.open(err.message, '닫기', { duration: 3000 });
      }
    });
  }

  ngAfterContentChecked(): void {
    this.cdredf.detectChanges();
  }
  categoryId: number = 0;
  selectedCategory(target: any) {
    this.categoryId = target.value;
    this.form.controls['categoryId'].setValue(target.value);

    const chapter = this.categories.find(x => x.id === target.value)?.chapterCount;

    this.chapterMax = chapter === undefined ? 0 : chapter;

    this.description = this.categories.find(x => x.id === target.value)?.description ?? '-';
  }

  selectedChapter($event: MatSelectChange) {

    let verse = this.verses.find(x => x.id === this.categoryId)?.verses[$event.value - 1];
    this.verseMax = verse === undefined ? 0 : verse;
  }


  onToggleChange($event: MatButtonToggleChange) {
    this.rows = $event.value;
  }

  triggerResize(): void {
    afterNextRender(() => {
      this.autosize.resizeToFitContent(true);
    }, {
      injector: this._injector
    });
  }

  onReset(): void {
    this.form.reset();
  }

  onCancel(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  ngOnDestroy(): void {
    if (this.bibleSubscription) {
      this.bibleSubscription.unsubscribe();
    }
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}
