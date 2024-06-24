import { trigger, style, animate, transition } from '@angular/animations';
import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/auth.service';
import { GameService } from 'src/app/game.service';
import { ReviewService } from 'src/app/review.service';
import { PriceService } from '../price.service';

@Component({
  selector: 'app-game-details',
  templateUrl: './game-details.component.html',
  styleUrls: ['./game-details.component.css'],
  animations: [
    trigger('video-fullscreen', [
      transition(':enter', [
        style({ transform: 'translate3d(0, 200%, 0)' }),  // initial
        animate('0.5s ease-out',
          style({ transform: 'translate3d(0,0,0)' }))  // final
      ]),
      transition(':leave', [
        style({ transform: 'translate3d(0,0,0)' }),  // initial
        animate('0.5s ease-in',
          style({ transform: 'translate3d(0, 200%, 0)' }))  // final
      ])
    ]),
  ]
})
export class GameDetailsComponent implements OnInit {

  slug: string;
  game: any;
  videoBackdrop: SafeResourceUrl;
  videoPaused: boolean = true;
  videoFullscreen: boolean = false;

  backgroundImages: Array<any> = [];

  reviews: Array<any> = [];
  loggedIn: boolean = false;

  @ViewChildren('videoSlide') videoSlides;
  @ViewChild('ytplayer', {read: ElementRef}) ytplayer: ElementRef;

  constructor(private route: ActivatedRoute, private gameService: GameService, private sanitizer: DomSanitizer, private titleService: Title, private reviewService: ReviewService, private fb: FormBuilder, private modalService: NgbModal, private authService: AuthService, private router: Router, private priceService: PriceService) {
    this.addReviewForm = this.fb.group({
      rating: ['', Validators.required],
      reviewText: ['', [Validators.required]]
    })
    this.editReviewForm = this.fb.group({
      rating: ['', Validators.required],
      reviewText: ['', Validators.required]
    })
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.authService.auth().toPromise()
      .then(res => {
        if (res.user === false) {
          this.loggedIn = false;
        }
        else if (res.user) {
          this.loggedIn = res.user;
        }
      })

      this.slug = params.slug;
      this.game = null;
      this.videoBackdrop = null;
      this.videoPaused = true;
      this.videoFullscreen = false;
      this.price = null;

      this.backgroundImages = [];
      this.reviews = [];

      this.getReviews();
      this.gameService.getGameBySlug(this.slug).subscribe(res => {
        if (res && res.length) {
          this.game = res[0];
          this.titleService.setTitle(this.game.name);
          this.chooseVideoBackdrop();
          this.getBackground(this.game.screenshots)
          this.getPrice(this.game.external_games);
        }
        else {
          this.game = null;
        }
      })
    })
  }

  chooseVideoBackdrop() {
    if (!this.game.videos || !this.game.videos.length) {
      this.videoBackdrop = null;
      return;
    }
    let video = this.game.videos.find(video => {
      if (video.name.toLowerCase().includes("trailer")) return true;
      else if (video.name.toLowerCase().includes("story")) return true;
      else return false;
    })
    if (video) {
      this.videoBackdrop = this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube-nocookie.com/embed/${video.video_id}?controls=0&modestbranding=1&autohide=1&showinfo=0&autoplay=1&disablekb=1&playsinline=1&mute=1&enablejsapi=1&loop=1`);
    }
    else {
      this.videoBackdrop = this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube-nocookie.com/embed/${this.game.videos[0].video_id}?controls=0&modestbranding=1&autohide=1&showinfo=0&autoplay=1&disablekb=1&playsinline=1&mute=1&enablejsapi=1&loop=1`);
    }
    setTimeout(() => {
      this.videoPaused = false;
    }, 5000)
  }
  toggleVideo() {
    if (this.videoPaused) {
      this.ytplayer.nativeElement.contentWindow.postMessage('{"event":"command","func":"' + 'playVideo' + '","args":""}', '*');
      setTimeout(() => {
        this.videoPaused = false;  
      }, 300)
    }
    else {
      this.ytplayer.nativeElement.contentWindow.postMessage('{"event":"command","func":"' + 'pauseVideo' + '","args":""}', '*');
      this.videoPaused = true;
      if (this.videoFullscreen) {
        this.toggleFullscreen();
      }
    }
  }
  toggleFullscreen() {
    if (this.videoFullscreen) {
      this.ytplayer.nativeElement.contentWindow.postMessage('{"event":"command","func":"' + 'mute' + '","args":""}', '*');
      this.videoFullscreen = false;
    }
    else {
      this.ytplayer.nativeElement.contentWindow.postMessage('{"event":"command","func":"' + 'unMute' + '","args":""}', '*');
      this.videoFullscreen = true;
    }
  }

  getPlatforms(platforms: Array<any>) {
    if (!platforms.length) return "";
    let str = "on ";
    for(let i=0; i<platforms.length; i++) {
      if (!platforms[i].abbreviation) continue;
      str += platforms[i].abbreviation;
      if (i === platforms.length-1) {
        break;
      }
      else if (i === platforms.length) {
        str += " and "
      }
      else {
        str += ", "
      }
    }
    return str;
  }
  getThemes(themes: Array<any>) {
    let str = "";
    for (let i=0; i<themes.length; i++) {
      str += themes[i].name;
      if (i === themes.length-1) {
        break;
      }
      else {
        str += "  •  ";
      }
    }
    return str;
  }
  getCompany(companies: Array<any>) {
    let c = companies.find(c => c.developer === true) || companies.find(c => c.publisher === true);
    if (c) return c.company.name;
    else return "";
  }
  
  getBackground(images) {
    if (images.length === 0) return;
    this.backgroundImages = images
      .map((a) => ({sort: Math.random(), value: a}))
      .sort((a, b) => a.sort - b.sort)
      .map((a) => Object.assign({}, a.value))
      .slice(0, 4);
    while (this.backgroundImages.length < 4) {
      this.backgroundImages.push(this.backgroundImages[this.backgroundImages.length - 1])
    }
  }

  setScreenshot(image_id) {
    if (this.backgroundImages.length > 1) {
      this.backgroundImages[1].image_id = image_id;
    }
    else {
      this.backgroundImages[0].image_id = image_id
    }
  }
  onCarouselSlide(slide) {
    let id = parseInt(slide.prev.slice(-1))
    if (id < this.game.videos.length) {
      this.videoSlides._results[id].nativeElement.contentWindow.postMessage('{"event":"command","func":"' + 'pauseVideo' + '","args":""}', '*');
    }
  }

  getReviews() {
    this.reviewService.getReviewsByGame(this.slug).subscribe(data => {
      this.reviews = data;
    })
  }

  reviewError: string = "";
  addReviewForm: FormGroup;

  openAddReviewModal(modal) {
    if (this.loggedIn === false) {
      this.router.navigateByUrl('/signin')
    }
    else {
      this.openModal(modal);
    }
  }

  openModal(modal) {
    this.modalService.open(modal, {ariaLabelledBy: 'add-review-modal', animation: true, backdrop: true, centered: true, scrollable: false, size: 'md'}).result
  }

  addReview(modal) {
    this.reviewService.addReview(this.addReviewForm.value, this.slug).subscribe(data => {
      if (data.reason && data.reason === "login") {
        this.reviewError = "You need to be logged in to perform this action"
      }
      else if (data.reason && data.reason === "word-count") {
        this.reviewError = "Review cannot be more than 200 words"
      }
      else {
        modal.close();
        this.addReviewForm.reset();
        this.reviews.unshift(data);
        this.reviewError = "";
      }
    })
  }
  selectedReview: number;
  deleteReview(modal) {
    this.reviewService.deleteReview(this.selectedReview).subscribe(data => {
      if (data.delete) {
        this.reviewError = "";
        modal.close();
        this.reviews = this.reviews.filter(item => item.id !== this.selectedReview);
        this.selectedReview = null;
      }
      else {
        this.reviewError = "An unexpected error occurred. Please try again."
      }
    })
  }

  editReviewForm: FormGroup;
  openEditReviewModal(modal, id) {
    this.selectedReview = id;

    let r = this.reviews.find(item => item.id === id);
    this.editReviewForm.patchValue({rating: r.rating, reviewText: r.reviewText})

    this.openModal(modal);
  }
  editReview(modal) {
    this.reviewService.editReview(this.selectedReview, this.slug, this.editReviewForm.value).subscribe(data => {
      if (data.edit === true) {
        this.reviewError = "";
        
        let r = this.reviews.find(item => item.id === this.selectedReview);
        r.rating = this.editReviewForm.value.rating;
        r.reviewText = this.editReviewForm.value.reviewText;

        modal.close();
        this.editReviewForm.reset();
        this.selectedReview = null;
      }
      else if (data.edit === "word-count") {
        this.reviewError = "Review cannot be more than 200 words"
      }
      else {
        this.reviewError = "An unexpected error occurred. Please try again."
      }
    })
  }

  reportReason = new FormControl('Irrelevant content or spam');
  reportReview(modal) {
    let r = this.reviews.find(item => item.id === this.selectedReview);
    this.reviewService.reportReview(this.selectedReview, this.reportReason.value, r.reviewText).subscribe(data => {
      if (data.report) {
        this.reviewError = "";

        modal.close();
        this.reportReason.setValue("Irrelevant content or spam");
        this.selectedReview = null;
      }
      else {
        this.reviewError = "An unexpected error occurred. Please try again."
      }
    })
  }

  price: any;
  getPrice(websites: Array<any>) {
    this.priceService.getPriceFromGame(websites)
    .then(price => {
      this.price = price;
    })
    .catch(err => {
      console.log(err);
      this.price = null;
    })
  }
}