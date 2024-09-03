import { animate, state, style, transition, trigger } from '@angular/animations';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { formatNumber, JsonPipe, NgFor, NgIf } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort, MatSortable, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltip } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { IBible } from '@app/interfaces/i-bible';
import { ICategory } from '@app/interfaces/i-category';
import { BibleService } from '@app/services/bible.service';
import { CategoryService } from '@app/services/category.service';
import { Subscription } from 'rxjs';
import { CustomSlicePipe } from "../../pipes/custom-slice.pipe";
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-bible-list',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    JsonPipe,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSort,
    MatSortModule,
    MatPaginatorModule,
    MatTooltip,
    ClipboardModule,
    CustomSlicePipe,
    MatProgressSpinnerModule
  ],
  templateUrl: './bible-list.component.html',
  styleUrl: './bible-list.component.scss',
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class BibleListComponent implements OnInit {


  numberFormat(num: any) {
    return formatNumber(num, 'en-US');
  }
  editCategory(arg0: any) {
    //
  }

  title = '성서 목록';


  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // "id","category_id","chapter","verse","text_kor","text_eng","note","comments"
  columnsToDisplay = ['id', 'categoryId', 'chapter', 'verse', 'textKor', 'textEng'];
  columnsToDisplayName = ['번호', '구분', '장', '절', '내용'];
  columnsToDisplayWithExpand = [...this.columnsToDisplay, 'expand'];
  expandedElement: ICategory | null = null;
  subscription!: Subscription;
  dataSource!: MatTableDataSource<IBible>;

  categoryService = inject(CategoryService);
  bibleService = inject(BibleService);
  snackBar = inject(MatSnackBar);
  router = inject(Router);

  bibles!: IBible[];

  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;

  ngOnInit(): void {
    this.subscription = this.bibleService.getBibles().subscribe(data => {
      this.bibles = data;
      this.dataSource = new MatTableDataSource<IBible>(data);
      this.dataSource.paginator = this.paginator;
      this.sort?.sort({ id: 'id', start: 'desc', disableClear: false } as MatSortable);
      this.dataSource.sort = this.sort;
      this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
      this.isLoadingResults = false;
      this.isRateLimitReached = false;
      this.resultsLength = data.length;
    });
  }

  getCategoryName(id: number): string | undefined | null {
    return this.bibles.find(x => x.id === id)?.category?.korName;
  }

  makeTitle(element: IBible): void {
    this.title = `${element.category?.korName} (${element.chapter}:${element.verse})`;
  }

  dataFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  onCopyClick() {
    this.snackBar.open('클립보드에 복사되었습니다.', '닫기', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  goTo(url: string, id: number) {
    this.router.navigate([url], { queryParams: { id: id } });
  }

  ngOnDestroy() {
    if (this.subscription)
      this.subscription.unsubscribe();
  }
}