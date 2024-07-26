import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { BuddistScripture } from '@app/types/buddist-scripture'
import { Sutra } from '@app/models/sutra';
import { environment } from '@env/environment.development';

@Injectable({ providedIn: 'root' })

export class BuddhaService {

  baseURL = "https://api.buddham.co.kr";

  public isUpdated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isDeleted: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isElement: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public subject = new Subject<BuddistScripture[]>();

  constructor(private http: HttpClient) { }

  //--> subject
  next(value: BuddistScripture[]) {
    this.subject.next(value);
  }

  //--> isDeleted
  hideElement(value: boolean) {
    this.isElement.next(value);
  }

  //--> isUpdated
  updated(value: boolean) {
    this.isUpdated.next(value);
  }

  //--> Get All
  getScriptures = (): Observable<BuddistScripture[]> =>
    this.http.get<BuddistScripture[]>(`${this.baseURL}/api/sutras`);
  //--> Get All by Sutras
  getSutras = (): Observable<Sutra[]> => this.http.get<Sutra[]>(`${this.baseURL}/api/sutras`);

  //--> Create New
  postScripture = (data: BuddistScripture): Observable<BuddistScripture> => // Add a new data
    this.http.post<BuddistScripture>(`${this.baseURL}/api/sutras`, data);

  //--> Get By Id
  getScriptureById = (id: number): Observable<BuddistScripture> =>
    this.http.get<BuddistScripture>(`${this.baseURL}/api/sutras/${id}`);

  //--> Update By Id
  updateScripture = (id: number, data: BuddistScripture): Observable<BuddistScripture> =>
    this.http.put<BuddistScripture>(`${this.baseURL}/api/sutras/${id}`, data);

  //--> Delete By Id
  deleteScripture = (id: number): Observable<BuddistScripture> =>
    this.http.delete<BuddistScripture>(`${this.baseURL}/api/sutras/${id}`);

  delete(id: number): Observable<BuddistScripture> {
    let result = this.http.delete<BuddistScripture>(`${this.baseURL}/api/sutras/${id}`);
    return result;
  }
}
