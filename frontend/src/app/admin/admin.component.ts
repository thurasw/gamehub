import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PromoService } from '../promo.service';
import { ReviewService } from '../review.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  selectedHeader: string = "promo";
  promos: Array<any> = [];
  reports: Array<any> = [];

  promoForm: FormGroup;
  promoImages = {
    banner: null,
    background: null,
    character: null
  }
  promoError: string = "";
  selectedPromo: number = null;

  constructor(private promoService: PromoService, private modalService: NgbModal, private fb: FormBuilder, private cd: ChangeDetectorRef, private reviewService: ReviewService) { }

  ngOnInit(): void {
    this.promoForm = this.fb.group({
      name: ['', Validators.required],
      gameSlug: ['', Validators.required]
    })
    this.getPromos();
    this.getReports();
  }
  openModal(modal) {
    this.modalService.open(modal, {ariaLabelledBy: 'add-promo-modal', animation: true, backdrop: 'static', centered: true, scrollable: false, size: 'md'}).result
    .then(result => {
      this.selectedPromo = null;
    })
  }

  getPromos() {
    this.promoService.getPromos().subscribe(data => {
      this.promos = data;
    })
  }
  createPromo(modal) {
    this.promoService.createPromo(this.promoForm.value, this.promoImages).subscribe(data => {
      this.getPromos();
      this.promoForm.reset();
      this.promoImages = {
        banner: null,
        background: null,
        character: null
      }
      this.promoError = "";
      modal.close();
    }, err => {
      this.promoError = "An unexpected error occurred. Please try again."
    })
  }
  onFileChange(event, key) {
    if(event.target.files && event.target.files.length) {
      const [file] = event.target.files;
      this.promoImages[key] = file;
      this.cd.markForCheck();
    }
  }

  deletePromo(modal) {
    if (this.selectedPromo) {
      this.promoService.deletePromo(this.selectedPromo).subscribe(data => {
        this.getPromos();
        this.promoError = "";
        modal.close();
      }, err => {
        this.promoError = "An unexpected error occurred. Please try again.";
      })
    }
  }

  getReports() {
    this.reviewService.getReports().subscribe(data => {
      if (data && data.length) {
        this.reports = data.map(review => {
          for (let r of review.reports) {
            r = Object.assign(r, {reviewId: review.id})
          }
          return review.reports
        }).flat();
      }
      else this.reports = data;
    })
  }

  selectedReport: any;
  reportError: string = "";
  deleteReview(modal) {
    this.reviewService.deleteReview(this.selectedReport.reviewId).subscribe(data => {
      if (data.delete) {
        this.reportError = "";
        modal.close();
        this.selectedReport = null;

        this.getReports();
      }
      else{
        this.reportError = "An unexpected error occurred. Please try again."
      }
    })
  }

  resolveReview(modal) {
    this.reviewService.resolveReview(this.selectedReport.reviewId).subscribe(data => {
      if (data.delete) {
        this.reportError = "";
        modal.close();
        this.selectedReport = null;

        this.getReports();
      }
      else {
        this.reportError = "An unexpected error occurred. Please try again."
      }
    })
  }
}
