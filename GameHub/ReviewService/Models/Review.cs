using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ReviewService.Models
{
    public class Review
    {
        public long Id { get; set; }
        
        public string GameSlug { get; set; }

        public string Username { get; set; }

        public long Rating { get; set; }

        public string ReviewText { get; set; }

        public string DatePosted { get; set; }

        public ICollection<Report> Reports { get; set; }

    }
}
