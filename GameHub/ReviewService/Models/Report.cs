using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ReviewService.Models
{
    public class Report
    {
        public long Id { get; set; }

        public string Reason { get; set; }

        public string ReviewText { get; set; }

        public string DateReported { get; set; }
    }
}
