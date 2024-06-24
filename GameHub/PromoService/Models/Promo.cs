using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PromoService.Models
{
    public class Promo
    {
        public long Id { get; set; }

        public string GameSlug { get; set; }

        public string Name { get; set; }

        public string Banner { get; set; }

        public string Background { get; set; }

        public string Character { get; set; }

    }
}
