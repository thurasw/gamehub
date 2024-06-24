import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({name: 'gameImage'})
export class GameImagePipe implements PipeTransform {
  transform(image_id: string, quality?: string): string {
    if (!quality) quality = "1080p";
    return "https://images.igdb.com/igdb/image/upload/t_" + quality + "/" + image_id + ".jpg";
  }
}

@Pipe({name: 'unixTime'})
export class UnixTimePipe implements PipeTransform {
  transform(unixTime: number, output?: string): string {
    let date = new Date(unixTime*1000);
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    switch(output) {
      case 'year':
        return date.getFullYear() + ''
      case 'full':
        return this.dateOrdinal(date.getDate()) + " " + monthNames[date.getMonth()] + " " + date.getFullYear();
    }
  }
  dateOrdinal(dom) {
    if (dom == 31 || dom == 21 || dom == 1) return dom + "st";
    else if (dom == 22 || dom == 2) return dom + "nd";
    else if (dom == 23 || dom == 3) return dom + "rd";
    else return dom + "th";
  };
}

@Pipe({name: 'youtubeVideo'})
export class YoutubeVideoPipe implements PipeTransform {
  constructor(private domSanitizer: DomSanitizer) {}
  transform(video_id: string): SafeResourceUrl {
    return this.domSanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube-nocookie.com/embed/${video_id}?controls=0&modestbranding=1&autohide=1&showinfo=0&enablejsapi=1`)
  }
}

@Pipe({name: 'promoImage'})
export class PromoImagePipe implements PipeTransform {
  transform(image: string, slug: string) {
    const base_url = "/promo"
    return base_url + "/images/" + slug + "-" + image;
  }
}

@Pipe({name: 'ratingColor'})
export class RatingColorPipe implements PipeTransform {
  transform(rating: number) {
    if (rating >= 80) {
      return 'rating-80'
    }
    else if (rating >= 60) {
      return 'rating-60'
    }
    else if (rating >= 40) {
      return 'rating-40'
    }
    else if (rating >= 20) {
      return 'rating-20'
    }
    else {
      return 'rating-0'
    }
  }
}
