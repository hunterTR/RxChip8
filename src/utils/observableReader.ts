import { Observable, throwError } from "rxjs";

export const readFile = (blob: Blob): Observable<ArrayBuffer> =>
{
  if (!(blob instanceof Blob)) {
    return throwError(new Error('`blob` must be an instance of File or Blob.'));
  }

  return Observable.create(obs => {
    const reader = new FileReader();

    reader.onerror = err => obs.error(err);
    reader.onabort = err => obs.error(err);
    reader.onload = () => obs.next(reader.result);
    reader.onloadend = () => obs.complete();

    return reader.readAsText(blob);
  });
}