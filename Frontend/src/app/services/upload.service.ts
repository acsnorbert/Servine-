import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../enviroments/environment';

const BASE = `${environment.serverUrl}/api`;

@Injectable({ providedIn: 'root' })
export class UploadService {

  constructor(private http: HttpClient) {}
  private tokenName =environment.tokenName;

  getToken(): String | null {
   
    console.log(sessionStorage.getItem(this.tokenName));
    return sessionStorage.getItem(this.tokenName);
  }

  tokenHeader():{ headers: HttpHeaders }{
    
    let token = this.getToken();
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return { headers }
  }


// Egy kép feltöltése
uploadImage(file: File): Observable<any> {
  const formData = new FormData();
  formData.append('image', file);

  return this.http.post(
    `${BASE}/upload`,
    formData,
    this.tokenHeader()
  );
}

// Több kép feltöltése
uploadMultipleImages(files: File[]): Observable<any> {
  const formData = new FormData();

  files.forEach(file => {
    formData.append('images', file);
  });

  return this.http.post(
    `${BASE}/upload/multiple`,
    formData,
    this.tokenHeader()
  );
}

// Kép törlése
deleteImage(filename: string): Observable<any> {
  return this.http.delete(
    `${BASE}/upload/${filename}`,
    this.tokenHeader()
  );
}
}