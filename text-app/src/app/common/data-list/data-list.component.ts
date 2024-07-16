import { Component, AfterViewInit, Input, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AllMatModule } from '@app/materials/all-mat/all-mat.module';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { BuddhaService } from '@app/services/buddha.service';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Sutra } from '@app/models/sutra';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortable, Sort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { TextareaAutoresizeDirective } from '@app/common/textarea-autoresize.directive';

import { HighlightAuto } from 'ngx-highlightjs';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { HighlightLineNumbers } from 'ngx-highlightjs/line-numbers';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-data-list',
  standalone: true,
  imports: [
    CommonModule,
    AllMatModule,
    MatFormField,
    ClipboardModule,
    MatPaginator,
    MatSort,
    MatFormFieldModule,
    TextareaAutoresizeDirective,
    HighlightAuto,
    HighlightLineNumbers
  ],
  templateUrl: './data-list.component.html',
  styleUrl: './data-list.component.scss',
  providers: [HighlightAuto, HighlightLineNumbers,
    { provide: 'LOCALE_ID', useValue: 'ko-KR' }
  ],
  animations: [
    trigger("detailExpand", [
      state("collapsed", style({ height: "0px", minHeight: "0" })),
      state("expanded", style({ height: "*" })),
      transition(
        "expanded <=> collapsed",
        animate("225ms cubic-bezier(0.4, 0.0, 0.2, 1)")
      ),
    ]),
  ]
})
export class DataListComponent implements AfterViewInit, OnDestroy {


  @Input() title?: string;
  @Input() columnsToDisplay = ["id", "title", "created"];
  @Input() columnsName = ["번호", "제목", "수록일자"];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  rowsSize: number = 10;
  readOnly: boolean = true;
  dataSource!: MatTableDataSource<Sutra>;
  fontSize: any = 'text-xl';
  subtraSubscription!: Subscription;

  columnsToDisplayWithExpand = [...this.columnsToDisplay, 'expand']; // 확장된 행을 위한 컬럼 추가
  expandedElement!: Sutra | null;

  constructor(private service: BuddhaService,
    private announcer: LiveAnnouncer,
    private snackBar: MatSnackBar
  ) { }

  ngAfterViewInit(): void {
    this.subtraSubscription = this.service.getSutras().subscribe({
      next: (data) => {
        this.dataSource = new MatTableDataSource(data);
        this.dataSource.paginator = this.paginator;
        this.sort?.sort({ id: 'id', start: 'desc', disableClear: false } as MatSortable);
        this.dataSource.sort = this.sort;
      }
    });

    this.service.hideElement(true);
  }

  sortChange(state: Sort) {
    if (state.direction) {
      this.announcer.announce(`정렬 순서가 ${state.direction}로 변경되었습니다.`);
    } else {
      this.announcer.announce(`정렬 순서가 초기화 되었습니다.`);
    }
  }

  sutraFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  getKoName(name: string): string {
    return this.columnsName[this.columnsToDisplay.indexOf(name)];
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }

  // 클립보드에 복사한다.
  onCopyToClipboard() {
    this.openSnackBar('경전 본문이 클립보드에 복사 완료되었습니다.', '복사완료!');
  }

  ngOnDestroy(): void {
    if (this.subtraSubscription) {
      this.subtraSubscription.unsubscribe();
    }
  }
}
