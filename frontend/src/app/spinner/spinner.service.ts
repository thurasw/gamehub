import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {

  private overlayRef: OverlayRef = undefined;
  public isLoading = new BehaviorSubject(false);
  
  constructor(private overlay: Overlay) { }
}
